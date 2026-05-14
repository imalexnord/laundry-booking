# Admin Guide

Detta dokument beskriver hur adminläget fungerar i tvättbokningsdemon.

## Viktigt

Detta är en demo/prototyp. Det är inte fastighetens officiella tvättbokningssystem och är inte godkänt av hyresvärden ännu.

Adminläget finns för att visa hur en hyresvärd eller administratör skulle kunna hantera bokningar om systemet införs på riktigt.

## Adresser

Vanlig bokningssida:

https://your-domain.example/

Adminsida:

/admin

## Admininloggning

Admin loggar in med en separat adminkod.

Adminkoden ska inte ligga i GitHub eller i wrangler.toml. Den ska ligga som Cloudflare secret:

npx wrangler secret put ADMIN_CODE

För lokal utveckling kan adminkoden ligga i .dev.vars:

ADMIN_CODE=change-this-local-admin-code
SESSION_SECRET=change-this-local-session-secret

.dev.vars ska aldrig pushas till GitHub.

## Vad admin kan göra

Admin kan:

- se aktiva bokningar
- se vilket lägenhetsnummer som har bokat en dag
- avboka en aktiv bokning

Admin kan inte se:

- namn
- e-postadresser
- telefonnummer
- personnummer
- IP-adresser

## Bokningsregler

Systemet är byggt för ett litet hyreshus med:

- 4 lägenheter
- ungefär 10 personer
- 1 tvättstuga
- bokning per hel kalenderdag

Regler:

- en dag kan bara vara bokad av en lägenhet åt gången
- en lägenhet kan inte boka samma dag flera gånger
- avbokade dagar blir lediga igen
- andra boende ser inte vem som bokat en upptagen dag

## Demo-lägenheter

Demon använder följande lägenhetsnummer:

1001
1002
1003
1004

Demo-portkod:

1234

## Drift

Systemet är byggt för Cloudflare Free:

- Cloudflare Workers
- Cloudflare Workers Assets
- Cloudflare D1
- Cloudflare secrets

Systemet ska inte driftas på en lokal Mac eller privat dator. Den lokala datorn används endast för utveckling och test.

## Deployment

Kör TypeScript-kontroll:

npm run check

Kör migrationer mot Cloudflare D1:

npx wrangler d1 migrations apply laundry-booking --remote

Seeda demo-lägenheter:

node scripts/make-seed.mjs
npx wrangler d1 execute laundry-booking --remote --file=seed.sql

Deploya:

npx wrangler deploy

## Säkerhet

Detta ska inte ligga i GitHub:

- .dev.vars
- riktiga adminkoder
- SESSION_SECRET
- framtida portkoder om de byts från demo
- seed.sql

database_id i wrangler.toml är inte en hemlighet.


## Automatisk rensning

Bokningshistorik äldre än 30 dagar raderas automatiskt.

Detta gäller både gamla bokningar och audit-logg. Syftet är att minimera lagrad historik och undvika att systemet sparar mer data än nödvändigt.
