# WPM – Woo Product Manager

WPM er et Next.js 15‑baseret værktøj til at vedligeholde produkter på flere WooCommerce shops.
Upload CSV‑filer, håndter butiksforbindelser og synkroniser pris‑ og kategoridata direkte mod
WooCommerce API.

## Funktioner
- **CSV-upload** for både parent- og variationsprodukter. Data lagres i en lokal SQLite-database via Drizzle.
- **Shopstyring** med tilføj, rediger, slet og test af API-forbindelse.
- **Produktoversigt** med søgning, visning af variationer og hurtigt produktark.
- **Manuel synk** hvor udvalgte produkter sendes til WooCommerce.
- Komponentbibliotek baseret på Tailwind CSS.

## Kom i gang
1. Installer afhængigheder
   ```bash
   npm install
   ```
2. Start udviklingsserver
   ```bash
   npm run dev
   ```
3. Åbn [http://localhost:3000](http://localhost:3000)

### Miljø
- Node 20+
- SQLite-databasen `sqlite.db` oprettes automatisk.
- For sync-endpoints kan `SHOP_CONFIGS` miljøvariablen bruges til en JSON-liste med WooCommerce API-nøgler.

## Scripts
| Kommando        | Beskrivelse                     |
|-----------------|---------------------------------|
| `npm run dev`   | Starter udviklingsserver        |
| `npm run build` | Bygger produktionsversion       |
| `npm start`     | Starter produktion              |
| `npm test`      | Kører Vitest-enhedstests        |
| `npm run lint`  | ESLint/Next.js style check      |

## Test
Testfiler ligger i `src/lib/*.test.ts`. Kør både `npm test` og `npm run lint` før du commit'er.

## Licens
MIT
