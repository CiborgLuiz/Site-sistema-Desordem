"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;
const SHEETS_DIR = path.join(__dirname, "sheets");

function sanitizeId(id) {
  return String(id || "").replace(/[^a-zA-Z0-9-_]/g, "_");
}

function sheetFilePath(id) {
  return path.join(SHEETS_DIR, `${sanitizeId(id)}.json`);
}

async function ensureSheetsDirectory() {
  await fs.mkdir(SHEETS_DIR, { recursive: true });
}

async function listSheets() {
  const files = await fs.readdir(SHEETS_DIR);
  const sheets = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const content = await fs.readFile(path.join(SHEETS_DIR, file), "utf8");
      const sheet = JSON.parse(content);
      sheets.push(sheet);
    } catch (error) {
      console.warn(`Falha ao ler sheet ${file}: ${error.message}`);
    }
  }
  return sheets.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

async function writeSheet(id, sheet) {
  if (!id || id !== sheet.id) {
    throw new Error("ID inválido para gravação de ficha.");
  }
  await fs.writeFile(sheetFilePath(id), JSON.stringify(sheet, null, 2), "utf8");
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/sheets", async (req, res) => {
  try {
    const sheets = await listSheets();
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sheets/:id", async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    const content = await fs.readFile(sheetFilePath(id), "utf8");
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(404).json({ error: "Ficha não encontrada." });
  }
});

app.put("/api/sheets/:id", async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    const sheet = req.body;
    await writeSheet(id, sheet);
    res.status(200).json(sheet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/sheets/:id", async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    const sheet = req.body;
    await writeSheet(id, sheet);
    res.status(201).json(sheet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/sheets/:id", async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    await fs.unlink(sheetFilePath(id));
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: "Ficha não encontrada." });
  }
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

ensureSheetsDirectory()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar servidor:", error);
    process.exit(1);
  });
