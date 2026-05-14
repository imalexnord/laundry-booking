# Laundry Booking

Ett enkelt tvättbokningssystem för små hyreshus.

Systemet är byggt för att kunna köras billigt på Cloudflare Free:

- Cloudflare Workers för API
- Cloudflare Workers Assets för frontend
- Cloudflare D1 för databas
- Cloudflare Secrets för känsliga värden
- Statisk frontend utan React

## Demo-status

Detta är en demo/prototyp.

Det är inte fastighetens officiella tvättbokningssystem och är inte godkänt av hyresvärden ännu.

Demon ska inte användas som faktisk bokning.

Konceptet är inte till salu.

## Nuvarande funktioner

Demon kan:

- logga in med lägenhetsnummer och demo-portkod
- visa lediga och upptagna tvättdagar
- boka en hel kalenderdag
- avboka sin egen bokning
- visa “Upptagen” för andra boende utan att visa vem som bokat
- låta admin se aktiva bokningar
- låta admin avboka bokningar vid behov
- spara bokningar i Cloudflare D1

## Integritet

Systemet är byggt med dataminimering som grundidé.

Systemet lagrar:

- lägenhetsnummer
- bokade dagar
- avbokade dagar
- administratörsåtgärder

Systemet lagrar inte:

- namn
- e-postadresser
- telefonnummer
- personnummer
- IP-adresser
- analytics/spårning

## Projektstruktur

| Sökväg | Beskrivning |
|---|---|
| `docs/admin-guide.md` | Admininstruktioner och driftanteckningar. |
| `docs/gdpr.md` | Demo-, integritets- och personuppgiftsinformation. |
| `docs/pitch.md` | Kort pitch för hyresvärd eller presentation. |
| `migrations/` | D1-migrationer för databasstruktur och bokningsregler. |
| `public/index.html` | Statisk HTML för tenant- och adminvy. |
| `public/app.js` | Frontendlogik för login, bokning, avbokning och admin. |
| `public/styles.css` | Mobilvänlig styling. |
| `scripts/make-seed.mjs` | Skapar demo-seed för lägenheter och demo-portkod. |
| `src/index.ts` | Worker-entrypoint och routing. |
| `src/lib/` | Hjälpfunktioner för auth, crypto, responses och validation. |
| `src/routes/` | API-routes för admin, auth, bookings och slots. |
| `schema.sql` | Samlad databasschema-referens. |
| `wrangler.toml` | Cloudflare Worker- och D1-konfiguration. |

## Lokalt dev-flöde

Installera dependencies:

```bash
npm install
```

Kör TypeScript-kontroll:

```bash
npm run check
```

Starta lokal utvecklingsserver:

```bash
npm run dev
```

## Databas

Skapa D1-databas:

```bash
npx wrangler d1 create laundry-booking
```

Lägg sedan in `database_id` i `wrangler.toml`.

Kör migration lokalt:

```bash
npx wrangler d1 migrations apply laundry-booking --local
```

Kör migration mot Cloudflare:

```bash
npx wrangler d1 migrations apply laundry-booking --remote
```

Seeda demo-lägenheter:

```bash
node scripts/make-seed.mjs
npx wrangler d1 execute laundry-booking --remote --file=seed.sql
```

## Deployment

Deploya till Cloudflare:

```bash
npx wrangler deploy
```

## Grundregler

- Systemet ska lagra lägenheter, inte personnamn.
- Vanliga boende ska inte kunna se vem som bokat en upptagen dag.
- Admin får se lägenhetsnummer för att kunna hantera bokningar.
- Systemet ska aldrig lagra IP-adresser, varken råa eller hashade.
- Demo-portkod används endast för att visa bokningsflödet.
- Riktig portkod eller bokningskod ska inte publiceras i GitHub eller frontend.
- Bokningskoder ska hash:as.
- Dubbelbokning ska stoppas i databasen.
- Avbokade dagar ska kunna bokas igen.

## Demo-lägenheter

Demon använder följande lägenhetsnummer:

```text
1001
1002
1003
1004
```

Demo-portkod:

```text
1234
```

## Admin

Adminpanelen finns på:

```text
/admin
```

Adminkoden ska ligga som Cloudflare secret och aldrig i GitHub:

```bash
npx wrangler secret put ADMIN_CODE
```

Session secret ska också ligga som Cloudflare secret:

```bash
npx wrangler secret put SESSION_SECRET
```

## E-post

E-postpåminnelser ingår inte i denna demo.

Det hade tekniskt gått att lägga till frivilliga e-postpåminnelser via egen mailserver, men det skulle introducera fler personuppgifter och fler systemloggar, till exempel i mailserver, Rspamd eller Mailcow.

Därför är e-post medvetet bortvalt i demon.

## Cloudflare

Systemet är byggt för Cloudflare Free och ska inte driftas på en lokal Mac eller privat dator.

Den lokala datorn används endast för utveckling och test.

## Dokumentation

Mer dokumentation finns i:

- `docs/admin-guide.md`
- `docs/gdpr.md`
- `docs/pitch.md`

## Automatisk rensning

Bokningshistorik äldre än 30 dagar raderas automatiskt.

Detta gäller både gamla bokningar och audit-logg. Syftet är att minimera lagrad historik och undvika att systemet sparar mer data än nödvändigt.
