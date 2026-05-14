# Pitch: Digital tvättbokning för små hyreshus

## Kort beskrivning

Detta är en enkel digital tvättbokning för små hyreshus.

Systemet låter boende boka och avboka tvättdagar via mobilen utan app, utan konto och utan komplicerad inloggning.

Det är byggt för mycket små fastigheter, inte stora bostadsbolag.

## Problemet

I små hyreshus är tvättbokning ofta onödigt krångligt.

Vanliga problem:

- boende måste boka på plats
- bokningar sker muntligt eller informellt
- det är oklart vem som har tvättdag
- avbokningar syns inte snabbt
- hyresvärden saknar enkel överblick
- digitala system är ofta för dyra eller för stora

För ett hus med fyra lägenheter behövs inte ett tungt kommersiellt system.

Det behövs bara något som fungerar.

## Lösningen

En enkel webbsida:

https://your-domain.example

Boende loggar in med:

lägenhetsnummer + portkod eller bokningskod

Därefter kan de:

- se lediga dagar
- boka en hel kalenderdag
- avboka sin egen bokning
- se om en dag är upptagen

Andra boende kan inte se vem som har bokat. De ser bara att dagen är upptagen.

## Anpassad för små hus

Nuvarande demo är byggd för:

- 4 lägenheter
- ungefär 10 personer
- 1 tvättstuga
- bokning per hel kalenderdag

Det gör systemet mycket enklare än en vanlig bokningsplattform.

## Integritet

Systemet är byggt med dataminimering som grundidé.

Systemet lagrar:

- lägenhetsnummer
- bokade dagar
- avbokningar
- administratörsåtgärder

Systemet lagrar inte:

- namn
- e-postadresser
- telefonnummer
- personnummer
- IP-adresser
- analytics/spårning

## Admin

Admin kan logga in separat och se aktiva bokningar.

Admin kan:

- se vilken lägenhet som bokat en dag
- avboka en bokning vid behov
- hantera praktiska problem

Vanliga boende kan inte se lägenhetsnummer för andra bokningar.

## Driftkostnad

Systemet är byggt för att köras på Cloudflare Free:

- Cloudflare Workers
- Cloudflare Workers Assets
- Cloudflare D1
- Cloudflare secrets

Förväntad årlig kostnad:

ungefär kostnaden för en domän

Ingen VPS behövs.

Ingen lokal dator behöver stå på.

Ingen Mac används för drift.

## Varför Cloudflare

Cloudflare gör att systemet kan köras serverlöst med låg driftkostnad.

För ett litet hyreshus är det en bra modell eftersom systemet inte behöver:

- egen server
- VPS
- databasdrift
- mailserver
- avancerad infrastruktur

## Demo-status

Detta är bara en demo.

Det är inte fastighetens officiella tvättbokningssystem och är inte godkänt av hyresvärden ännu.

Demon ska inte användas som faktisk bokning.

Konceptet är inte till salu.

Syftet är att visa hur ett enkelt system skulle kunna fungera.

## Om systemet skulle användas på riktigt

Innan riktig användning bör följande beslutas:

- vem som är personuppgiftsansvarig
- vilka lägenheter som ska ingå
- vilken bokningskod eller portkod som ska användas
- hur bokningshistorik ska hanteras
- vem som får adminåtkomst
- var information om integritet ska visas för boende

## Sammanfattning

Detta är ett litet, billigt och integritetsvänligt tvättbokningssystem för små hyreshus.

Det gör en sak:

låter boende boka och avboka tvättdagar digitalt

Och det gör det utan onödig datainsamling.
