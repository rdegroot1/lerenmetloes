# Grunndoku

Een zelfstandig Gronings detectivepuzzelspel onder Leren met Loes. Zevenentwintig fictieve zaken in drie reeksen: zeventien Stadse speurtochten, vier Nacht in Stad-dossiers en zes zaken Moord in de Martini. Tien historische versies blijven bereikbaar via Eerdere zaken. Alle actuele zaken gebruiken verzorgde mugshots, aparte slachtofferportretten, compacte ruimtebanners en bezetbare meubels. Kaarten zijn schematisch; er wordt geen officiële samenwerking met locaties of andere spellen gesuggereerd.

Speel op https://rdegroot1.github.io/lerenmetloes/grunndoku/. `?serie=nacht` opent de tweede reeks; `?serie=martini` opent de kerkserie.

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

De Martini-serie heeft 6, 8, 10, 12, 14 en 16 personages. De zesde zaak heeft uitzonderlijk zes sterren: Extreem · de Martini-proef. De langwerpige kerk met zijkapellen heeft verschillende breedte en hoogte (tot 24 × 16 vakken). Personen bezetten ieder een eigen rij en kolom; sommige kolommen blijven leeg. De eerste twee zaken hebben vier respectievelijk twee vaste personen. Een kaartkiezer en zoomknoppen helpen op kleinere schermen.

De eigen schematische kaarten bevatten orgel, preekstoel, kerkbanken, koor, kapellen en sacristie. Ze zijn geen actuele bezoekplattegrond. Grote banken en andere meubels hebben echte deelvakken. Afstanden tot een meubel worden vanaf de buitenrand van het hele voorwerp geteld.

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

Print deze zaak geeft een schone puzzel zonder introductie. Een bundel begint met twee originele oefenpagina’s: zelf proberen, daarna stap voor stap beredeneren. Korte spelregels worden alleen bij de eerste zaken herhaald. Browsernotities en zaakoplossingen worden niet geprint; het oefenvoorbeeld heeft wel een uitgewerkte oplossing.

Stadse en nachtelijke zaken gebruiken één liggend A4 per zaak. Voor iedere Martini-zaak staan de volledige kerkkaart en alle personages elk op één eigen liggend A4. Alle zestien personages van de finale passen op één dossierpagina. Mugshotnamen staan alleen op het vastgehouden bord.

- `grunndoku-print.pdf`: alle 27 zaken, 35 pagina’s inclusief introductie.
- `grunndoku-nacht-in-stad.pdf`: vier nachtelijke zaken, 6 pagina’s inclusief introductie.
- `grunndoku-moord-in-de-martini.pdf`: zes Martini-zaken, 14 pagina’s inclusief introductie.

Kies A4 en 100% schaal; schakel browserkop- en voetteksten uit. Gebiedsgrenzen blijven ook zonder achtergrondkleuren zichtbaar.

## Voortgang en oude adressen

De juiste naam is **Grunndoku**, met twee n’s. `/grundoku/` en `/grunmurdoku/` verwijzen rechtstreeks door, met behoud van queryparameters en fragment. Oude PDF-adressen bieden dezelfde vernieuwde uitgaven. De oorspronkelijke localStorage-namespace `grunmurdoku:v1:` blijft bewust behouden. Alle puzzel-ID’s en unieke oplossingen zijn behouden; gewijzigde aanwijzingen vernieuwen alleen de afvinkjes. Notities en plaatsingen op geldige vakken blijven beschikbaar. De hoofdapp en leervoortgang van Leren met Loes worden niet gewijzigd.

## Eigen materiaal en publicatie

De SVG-illustraties in `art.js`, puzzels, verhalen en uitleg zijn voor dit project gemaakt met AI-hulp en menselijke ontwerpkeuzes. Er zijn geen boekscans, stockfoto’s, logo’s van locaties of externe lettertypebestanden opgenomen. Fokko en de andere slachtoffers krijgen per zaak een symbolisch moordwapen; dit is geen plaatsaanwijzing. Bewaar herkomst en licenties bij nieuwe externe assets.

`AGENTS.md` legt de afspraken over kwaliteit, originaliteit en zorgvuldige publicatie vast. `PUBLICATIE.md` bevat bronnen en aandachtspunten voor merkonderzoek, rechten, Etsy, Sikkom en AI-vermelding. Deze documenten zijn geen juridische vrijgave. De actuele PDF’s zijn openbaar via GitHub Pages.
