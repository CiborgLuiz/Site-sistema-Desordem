"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

loadLocalEnv();

const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;

function loadLocalEnv() {
  if (process.env.VERCEL) return;

  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas. Fichas não serão persistidas."
    );
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function listSheets() {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("sheets")
    .select("id,data,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}

async function getSheet(id) {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("sheets")
    .select("id,data,created_at,updated_at")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

async function writeSheet(id, sheet) {
  if (!supabase) throw new Error("Supabase não configurado");

  if (!id || id !== sheet.id) {
    throw new Error("ID inválido para gravação de ficha.");
  }

  const { data, error } = await supabase
    .from("sheets")
    .upsert({
      id,
      data: sheet,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (error) throw new Error(error.message);

  return data;
}

async function deleteSheetRecord(id) {
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase
    .from("sheets")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

function serializeSheetRow(row) {
  const sheet = row?.data && typeof row.data === "object" ? row.data : {};
  return {
    ...sheet,
    id: sheet.id || row.id,
    createdAt: sheet.createdAt || row.created_at || "",
    updatedAt: sheet.updatedAt || row.updated_at || "",
  };
}

app.use(express.json({ limit: "2mb" }));

app.use(express.static(path.join(__dirname)));

app.get("/api/health", (req, res) => {
  res.json({ database: supabase ? "connected" : "unconfigured" });
});

app.get("/api/sheets", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    const sheets = await listSheets();
    res.json(sheets.map(serializeSheetRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sheets/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    const sheet = await getSheet(req.params.id);
    res.json(serializeSheetRow(sheet));
  } catch (error) {
    res.status(404).json({ error: "Ficha não encontrada." });
  }
});

app.post("/api/sheets/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    const id = req.params.id;
    await writeSheet(id, req.body);

    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/sheets/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    const id = req.params.id;
    await writeSheet(id, req.body);

    res.json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/sheets/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    const id = req.params.id;
    await deleteSheetRecord(id);

    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: "Ficha não encontrada." });
  }
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Inicializar Supabase
supabase = initSupabase();

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
    console.log(
      supabase
        ? "Conectado ao Supabase"
        : "Supabase não configurado - fichas não serão persistidas"
    );
  });
}
