-- Tabulka registrací na Dětské trhy
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Zákonný zástupce
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_birth_date DATE NOT NULL,
  parent_address TEXT NOT NULL,
  
  -- Dítě
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  city TEXT NOT NULL,
  
  -- Stánek
  stall_name TEXT NOT NULL,
  products TEXT NOT NULL,
  
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
