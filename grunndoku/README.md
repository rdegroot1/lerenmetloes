# Grunndoku

Een zelfstandig Gronings detectivepuzzelspel onder Leren met Loes. Eenentwintig fictieve zaken in twee reeksen: zeventien Stadse speurtochten en vier Nacht in Stad-dossiers. Tien historische versies blijven bereikbaar via Eerdere zaken. Alle actuele zaken gebruiken verzorgde mugshots, aparte slachtofferportretten, compacte ruimtebanners en bezetbare meubels. Kaarten zijn schematisch; er wordt geen officiële samenwerking met locaties of andere spellen gesuggereerd.

Speel op https://rdegroot1.github.io/lerenmetloes/grunndoku/. `?serie=nacht` opent de tweede reeks.

## Spelen

Plaats iedereen in een eigen rij én kolom. Iedere verdachte heeft precies één eigen aanwijzing of een vaste startpositie. Het slachtoffer krijgt alleen ‘Was samen met de moordenaar’; geen persoonsaanwijzing verwijst naar het slachtoffer. De dader is de enige andere persoon in diens gebied.

Groen gemarkeerde stoelen, bankjes, bedden en kleden zijn bezetbaar. Andere voorwerpen blokkeren hun hele oppervlak. Grotere meubels beslaan meerdere vakken met één doorlopende illustratie. Elk bezetbaar deelvak is een mogelijke plek. ‘Naast’ betekent direct boven, onder, links of rechts, binnen hetzelfde gebied en buiten het hele voorwerp. Hoger/lager en links/rechts tussen personen vergelijken rijen en kolommen. Noord is boven; oost is rechts. Een gebiedshoek ligt bij een horizontale én verticale grens van dat gebied.

‘De enige op een kleed’ sluit iedereen anders van alle kleden uit, ook het slachtoffer. Groepsaanwijzingen zoals ‘Precies twee personen zaten op een stoel’ tellen alle personen samen en zijn apart afvinkbaar. Archiefzaken behouden hun eerdere regels en aanwijzingen; hun eigen legenda laat zien wat bezetbaar is.

Selecteer een persoon. Eerste klik: concept in het hoekje. Tweede klik: definitief plaatsen. Derde klik: de eerdere concepten herstellen, ook op andere vakjes van die persoon. Dit werkt na herladen en met Terug. Latere onafhankelijke aantekeningen blijven behouden. Vaste startposities blijven vaststaan. Wegstrepen en Wissen zijn afzonderlijke gereedschappen.

Een zetje plaatst één persoon. Bekijk oplossing (spoiler) geeft een redenering in bulletpoints op basis van de openbare regels; waar nodig benoemt de uitleg expliciet het toetsen van resterende combinaties. Oplossingen verschijnen nooit vanzelf en worden niet in de blanco PDF opgenomen.

## Vijf niveaus

1. ★☆☆☆☆ — Eem kalm aan beginnen
2. ★★☆☆☆ — Nait al te gek
3. ★★★☆☆ — Een normale
4. ★★★★☆ — Kop d’r veur!
5. ★★★★★ — Het ken net

De sterren en namen komen uit `difficulty.js` en staan op scherm, in de zaakkeuze en op papier. Het zijn informele, leesbare namen met een Groningse knipoog, geen uniforme streektaalspelling. Bronnen en taalnuances staan in `PUBLICATIE.md`. De eerste zaak heeft twee gegeven personen en is met directe uitsluiting zonder gokken oplosbaar.

## Lokaal en tests

De app heeft geen dependencies of build nodig. Start vanuit de repositoryroot:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080/grunndoku/.

```sh
npm test --prefix grunndoku
node --test --test-isolation=none grunndoku/test/*.test.js
node grunndoku/generate.mjs
```

De vaste seed en deterministische verrijkingen produceren dezelfde data. De generator controleert dat alle oplossingen behouden blijven en uniek zijn. Tests controleren onder meer verboden en bezetbare vakken, rij/kolomregels, één dader, één aanwijzing per verdachte, geen verwijzingen naar het slachtoffer, uitleg, concepten herstellen, grote voorwerpen, gebiedsgrenzen en de eenvoudige introductie. De renderer heeft geen opgeslagen of hardgecodeerde oplossingen nodig.

## Printen

Print deze zaak geeft één schone puzzel; Print deze serie geeft zeventien of vier pagina’s. Elke zaak past op één liggend A4 met marges van 10 mm, inclusief sterren, aanwijzingen, illustraties en kladrooster. Browsernotities en oplossingen worden niet geprint.

- `grunndoku-print.pdf`: alle eenentwintig zaken.
- `grunndoku-nacht-in-stad.pdf`: de laatste vier zaken.

Kies A4 en 100% schaal; schakel browserkop- en voetteksten uit. Gebiedsgrenzen blijven ook zonder achtergrondkleuren zichtbaar.

## Voortgang en oude adressen

De juiste naam is **Grunndoku**, met twee n’s. `/grundoku/` en `/grunmurdoku/` verwijzen rechtstreeks door, met behoud van queryparameters en fragment. Oude PDF-adressen bieden dezelfde vernieuwde uitgaven. De oorspronkelijke localStorage-namespace `grunmurdoku:v1:` blijft bewust behouden. Alle puzzel-ID’s en unieke oplossingen zijn behouden; gewijzigde aanwijzingen vernieuwen alleen de afvinkjes. Notities en plaatsingen op geldige vakken blijven beschikbaar. De hoofdapp en leervoortgang van Leren met Loes worden niet gewijzigd.

## Eigen materiaal en publicatie

De SVG-illustraties in `art.js`, puzzels, verhalen en uitleg zijn voor dit project gemaakt met AI-hulp en menselijke ontwerpkeuzes. Er zijn geen boekscans, stockfoto’s, logo’s van locaties of externe lettertypebestanden opgenomen. Fokko en de andere slachtoffers krijgen per zaak een symbolisch moordwapen; dit is geen plaatsaanwijzing. Bewaar herkomst en licenties bij nieuwe externe assets.

`AGENTS.md` legt de afspraken over kwaliteit, originaliteit en zorgvuldige publicatie vast. `PUBLICATIE.md` bevat bronnen en aandachtspunten voor merkonderzoek, rechten, Etsy, Sikkom en AI-vermelding. Deze documenten zijn geen juridische vrijgave. De actuele PDF’s zijn openbaar via GitHub Pages.
