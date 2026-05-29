-- SQL para criar a tabela de fichas no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

CREATE TABLE sheets (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Índice para melhor performance nas buscas por data
CREATE INDEX idx_sheets_updated_at ON sheets(updatedAt DESC);

-- Política de segurança (RLS) - Permitir leitura/escrita anônima (ajuste conforme necessário)
ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Enable read access for all users" ON sheets
  FOR SELECT USING (true);

-- Política para permitir insert/update/delete
CREATE POLICY "Enable insert for all users" ON sheets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON sheets
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON sheets
  FOR DELETE USING (true);
