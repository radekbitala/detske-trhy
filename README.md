# Dětské trhy – Registrační systém

Registrační systém pro Dětské trhy Calm2be.

## Funkce

- **Veřejný registrační formulář** pro rodiče
- **Admin panel** pro správu registrací
- **Automatické emaily** při schválení tématu a videa
- **Filtrování a vyhledávání** registrací

## Technologie

- Next.js 14
- Supabase (databáze)
- Resend (emaily)
- Tailwind CSS
- Vercel (hosting)

## Lokální vývoj

```bash
npm install
npm run dev
```

## Environment proměnné

Vytvořte soubor `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
RESEND_API_KEY=re_xxx
ADMIN_PASSWORD=vaše-heslo
```

## URL adresy

- `/` – Veřejný registrační formulář
- `/admin` – Přihlášení do admin panelu
- `/admin/dashboard` – Seznam registrací
- `/admin/dashboard/[id]` – Detail registrace
