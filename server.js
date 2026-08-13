"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

loadLocalEnv();

const app = express();

const SUPABASE_URL = firstEnv("DESORDEM_SUPABASE_URL", "SUPABASE_URL");
const SUPABASE_KEY = firstEnv(
  "DESORDEM_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DESORDEM_SUPABASE_SECRET_KEY",
  "DESORDEM_SUPABASE_ANON_KEY",
  "DESORDEM_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_DESORDEM_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
);

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

function firstEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "Variáveis DESORDEM_SUPABASE_URL e DESORDEM_SUPABASE_SERVICE_ROLE_KEY/DESORDEM_SUPABASE_ANON_KEY não configuradas. Fichas não serão persistidas."
    );
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function listSheets() {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("sheets")
    .select("id,data");

  if (error) throw new Error(error.message);

  const tombstoned = new Set(await listDeletedSheets());

  return (data || [])
    .filter((row) => !tombstoned.has(row.id))
    .sort((left, right) => {
      return timestampValue(serializeSheetRow(right).updatedAt) - timestampValue(serializeSheetRow(left).updatedAt);
    });
}

async function listDeletedSheets() {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("deleted_sheets")
    .select("id");

  if (error) throw new Error(error.message);

  return (data || []).map((row) => row.id);
}

async function getSheet(id) {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("sheets")
    .select("id,data")
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

  const { data: tombstone } = await supabase
    .from("deleted_sheets")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (tombstone) {
    const error = new Error("Esta ficha foi excluída e não pode ser recriada.");
    error.status = 409;
    throw error;
  }

  const { data, error } = await supabase
    .from("sheets")
    .upsert({
      id,
      data: sheet,
    }, { onConflict: "id" });

  if (error) throw new Error(error.message);

  return data;
}

async function deleteSheetRecord(id) {
  if (!supabase) throw new Error("Supabase não configurado");

  const { error: tombstoneError } = await supabase
    .from("deleted_sheets")
    .upsert({ id }, { onConflict: "id" });

  if (tombstoneError) throw new Error(tombstoneError.message);

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

function timestampValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

app.use(express.json({ limit: "2mb" }));

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ database: supabase ? "connected" : "unconfigured" });
});

apiRouter.get("/sheets", async (req, res) => {
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

apiRouter.get("/deleted-sheets", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(503)
        .json({ error: "Banco de dados não disponível" });
    }

    res.json(await listDeletedSheets());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/sheets/:id", async (req, res) => {
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

apiRouter.post("/sheets/:id", async (req, res) => {
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
    if (error.status === 409) return res.status(409).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
});

apiRouter.put("/sheets/:id", async (req, res) => {
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
    if (error.status === 409) return res.status(409).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
});

apiRouter.delete("/sheets/:id", async (req, res) => {
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

app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname)));

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
