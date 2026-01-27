-- Tabulka registrací na Dětské trhy
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Zákonný zástupce
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_city TEXT NOT NULL,
  parent_region TEXT NOT NULL,

  -- Dítě
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,

  -- Stánek
  stall_name TEXT NOT NULL,
  products TEXT NOT NULL,
  presentation_url TEXT,
  
  -- Stav registrace
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'theme_approved', 'video_approved')),
  
  -- Souhlas
  consent_given BOOLEAN DEFAULT TRUE,
  
  -- Odeslané emaily (JSON array)
  emails_sent JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps pro schválení
  theme_approved_at TIMESTAMP WITH TIME ZONE,
  video_approved_at TIMESTAMP WITH TIME ZONE
);

-- Index pro rychlejší vyhledávání
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_email ON registrations(parent_email);

-- Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Politika: Kdokoliv může vložit novou registraci (veřejný formulář)
CREATE POLICY "Allow public insert" ON registrations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Politika: Pouze authenticated uživatelé mohou číst a upravovat
CREATE POLICY "Allow authenticated read" ON registrations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update" ON registrations
  FOR UPDATE TO authenticated
  USING (true);

-- Tabulka pro admin uživatele (jednoduchá verze)
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vlož Veroniku jako admina
INSERT INTO admin_users (email) VALUES ('veronika@calm2be.cz');

-- =====================================================
-- MIGRACE: Zjednodušení formuláře (leden 2026)
-- =====================================================
-- Spusťte tyto příkazy v Supabase SQL editoru pro migraci existující databáze

-- 1. Přidat nové sloupce
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS parent_city TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS parent_region TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS presentation_url TEXT;

-- 2. Migrovat data z address_city do parent_city (pokud existují staré záznamy)
UPDATE registrations SET parent_city = address_city WHERE parent_city IS NULL AND address_city IS NOT NULL;

-- 3. Nastavit výchozí hodnotu pro parent_region u existujících záznamů
UPDATE registrations SET parent_region = 'Středočeský kraj' WHERE parent_region IS NULL;

-- 4. Odebrat staré sloupce (POZOR: nevratné!)
-- ALTER TABLE registrations DROP COLUMN IF EXISTS parent_birth_date;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address_street;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address_number;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address_city;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address_postal_code;

-- =====================================================
-- MIGRACE: Upload token pro dodatečné nahrání videa (leden 2026)
-- =====================================================
-- Spusťte tento příkaz v Supabase SQL editoru

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS upload_token UUID DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_upload_token ON registrations(upload_token);

-- Policy pro veřejné čtení registrace podle tokenu (pro upload stránku)
CREATE POLICY "Allow public read by token" ON registrations
  FOR SELECT TO anon
  USING (true);

-- Policy pro veřejnou aktualizaci presentation_url podle tokenu
CREATE POLICY "Allow public update presentation" ON registrations
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SUPABASE STORAGE: Bucket pro prezentace
-- =====================================================
-- Vytvořte bucket 'presentations' v Supabase Dashboard > Storage
-- Nastavte jako Public bucket

-- Storage policies (spusťte v SQL editoru):
-- CREATE POLICY "Allow public uploads" ON storage.objects
--   FOR INSERT TO public
--   WITH CHECK (bucket_id = 'presentations');

-- CREATE POLICY "Allow public reads" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'presentations');
