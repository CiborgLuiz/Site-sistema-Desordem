-- SQL para criar a tabela publica de fichas no Supabase.
-- Execute este script no SQL Editor do projeto Supabase.

CREATE TABLE IF NOT EXISTS public.sheets (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Se uma versao antiga criou createdAt/updatedAt sem aspas, o PostgreSQL
-- salvou como createdat/updatedat. Este bloco copia esses valores.
ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sheets' AND column_name = 'createdat'
  ) THEN
    EXECUTE 'UPDATE public.sheets SET created_at = COALESCE(createdat, created_at)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sheets' AND column_name = 'updatedat'
  ) THEN
    EXECUTE 'UPDATE public.sheets SET updated_at = COALESCE(updatedat, updated_at)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sheets_updated_at ON public.sheets(updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_sheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sheets_updated_at ON public.sheets;
CREATE TRIGGER set_sheets_updated_at
BEFORE UPDATE ON public.sheets
FOR EACH ROW
EXECUTE FUNCTION public.set_sheets_updated_at();

ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sheets;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.sheets;
DROP POLICY IF EXISTS "Enable update for all users" ON public.sheets;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.sheets;

DROP POLICY IF EXISTS "Sheets are readable by everyone" ON public.sheets;
CREATE POLICY "Sheets are readable by everyone" ON public.sheets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sheets can be created by everyone" ON public.sheets;
CREATE POLICY "Sheets can be created by everyone" ON public.sheets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Sheets can be updated by everyone" ON public.sheets;
CREATE POLICY "Sheets can be updated by everyone" ON public.sheets
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sheets can be deleted by everyone" ON public.sheets;
CREATE POLICY "Sheets can be deleted by everyone" ON public.sheets
  FOR DELETE USING (true);

-- Tombstones de exclusao: impedem que caches locais de outros usuarios
-- recriem uma ficha que foi deletada publicamente.
CREATE TABLE IF NOT EXISTS public.deleted_sheets (
  id TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deleted_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deleted sheets readable by everyone" ON public.deleted_sheets;
CREATE POLICY "Deleted sheets readable by everyone" ON public.deleted_sheets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Deleted sheets insertable by everyone" ON public.deleted_sheets;
CREATE POLICY "Deleted sheets insertable by everyone" ON public.deleted_sheets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Deleted sheets deletable by everyone" ON public.deleted_sheets;
CREATE POLICY "Deleted sheets deletable by everyone" ON public.deleted_sheets
  FOR DELETE USING (true);
