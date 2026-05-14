# Demo, integritet och personuppgifter

Detta dokument beskriver integritetsprinciperna för tvättbokningsdemon.

## Status

Detta system är en demo/prototyp för digital tvättbokning.

Det är inte fastighetens officiella tvättbokningssystem och är inte godkänt av hyresvärden ännu.

Demon används för att visa hur boende skulle kunna boka och avboka tvättdagar digitalt.

## Personuppgiftsansvarig för demon

Personuppgiftsansvarig för denna demo:

Alex Nord

Kontakt:

ggsweeden00+kanalgatandemo@gmail.com

Om systemet senare godkänns och används officiellt av hyresvärden behöver ansvarsfördelningen ändras. Då är det normalt hyresvärden som behöver stå som ansvarig för den faktiska behandlingen, och den tekniska driftrollen behöver definieras separat.

## Vilka uppgifter systemet lagrar

Systemet lagrar endast det som krävs för att visa och hantera tvättbokningar:

- lägenhetsnummer
- bokade dagar
- avbokade dagar
- administratörsåtgärder kopplade till bokningar

## Vilka uppgifter systemet inte lagrar

Systemet lagrar inte:

- namn
- e-postadresser
- telefonnummer
- personnummer
- IP-adresser
- analytics-identifierare
- cookies för marknadsföring eller spårning

## Lägenhetsnummer

Lägenhetsnummer som används i demon har hämtats via publikt tillgänglig information och avser officiella fyrsiffriga lägenhetsnummer för bostäder på adressen.

Lägenhetsnummer betraktas här som offentligt tillgänglig registerinformation.

Offentlighetsprincipen är en grundlagsskyddad princip som ger allmänheten rätt till insyn i statlig och kommunal verksamhet, främst genom rätten att ta del av allmänna handlingar. Den regleras i Tryckfrihetsförordningen och preciseras i Offentlighets- och sekretesslag (2009:400).

Enligt lag (2006:378) om lägenhetsregister ska kommunen fastställa lägenhetsnummer när det finns mer än en bostadslägenhet med samma belägenhetsadress.

Länk till lagen:

https://lagen.nu/2006:378

## Viktig avgränsning

Demon behandlar inte namn på boende.

Vanliga boende kan inte se vilken lägenhet som har bokat en upptagen dag. De ser bara:

- ledig
- upptagen
- din bokning

Admin kan se vilket lägenhetsnummer som har bokat en dag för att kunna hantera bokningar och support.

## Portkod

Demo-portkoden är endast till för att visa bokningsflödet.

Demo-portkod:

1234

Om systemet används på riktigt ska portkod eller separat bokningskod hanteras som en känslig åtkomstuppgift och inte publiceras i GitHub, dokumentation eller frontend.

## Hosting

Systemet hostas av Cloudflare.

Cloudflare:

https://www.cloudflare.com/learning/

Cloudflare Data Handling Policy:

https://www.cloudflare.com/trust-hub/privacy-and-data-protection/

## Lagring och historik

Systemet behåller bokningshistorik för att kunna visa avbokningar och hantera eventuella bokningstvister.

För ett officiellt system bör hyresvärden besluta hur länge bokningshistorik ska sparas.

Rekommenderad enkel regel:

Spara historik endast så länge den behövs för drift, felsökning och praktisk hantering av bokningar.

## Ingen IP-lagring

Systemet ska inte lagra IP-adresser.

Detta gäller både:

- rå IP-adress
- hashad IP-adress
- IP-adress i audit-logg

## Demo-varning

Sidan visar en demo-popup varje gång sidan öppnas. Den förklarar att systemet:

- endast är en demo
- inte är officiellt
- inte är godkänt av hyresvärden
- inte ska användas som faktisk bokning
- inte är till salu


## Automatisk rensning

Bokningshistorik äldre än 30 dagar raderas automatiskt.

Detta gäller både gamla bokningar och audit-logg. Syftet är att minimera lagrad historik och undvika att systemet sparar mer data än nödvändigt.
