# grundoku

Een zelfstandige Nederlandstalige detectivepuzzel in Groningen. Stadse speurtochten bevat zeventien zaken, van heel makkelijk tot uitdagend. Nacht in Stad voegt vier mugshot-dossiers toe: Stadsschouwburg, Suikerunieterrein, het Forum en een studentenhuis aan de Korreweg. Tien oudere versies blijven in het archief beschikbaar. Alle personages en verhalen zijn fictief; kaarten zijn schematisch. Geen boekillustraties, teksten of bestaande puzzelindelingen overgenomen.

## Spelen

Plaats alle personen in verschillende rijen en kolommen. In Stadse speurtochten blokkeren voorwerpen hun vakje. In Nacht in Stad kun je op groen gemarkeerde stoelen, banken, bedden en vloerkleden plaatsen; andere voorwerpen blokkeren hun hele oppervlak. Elke aanwijzing moet kloppen. Het slachtoffer was met precies één andere persoon in hetzelfde gebied: de dader.

Selecteer een persoon. De eerste klik op een vrij vakje zet een klein conceptinitial in het hoekje. De tweede klik op dat vakje met dezelfde persoon geselecteerd maakt de plaatsing definitief. Een derde klik haalt de definitieve plaatsing weg en herstelt de eerdere conceptaantekeningen in dat vakje en op andere mogelijke plekken van die persoon; vaste startposities blijven staan. Meerdere concepten per vakje en per persoon zijn mogelijk. Alleen definitieve plaatsingen tellen mee voor de rij-, kolom- en gebiedsregels. Definitief plaatsen verbergt de overige concepten van die persoon en alle concepten in het gekozen vakje. Wissel tussen plaatsen, wegstrepen en wissen. Een bezette cel selecteert de betreffende persoon om die te verplaatsen. Aanwijzingen kun je afvinken. Hints plaatsen één persoon; Terug draait wijzigingen terug. Voortgang blijft lokaal bewaard per zaak. Geen account, backend of API-sleutel nodig.

‘Naast’ is orthogonaal aangrenzend en binnen hetzelfde gebied. Hoger/links vergelijken rij- en kolomnummers zonder vereiste van directe nabijheid. ‘Alleen met’ betekent precies twee personen in dat gebied. De kaart is schematisch en geeft geen werkelijke stadsgeografie weer.

## Lokaal starten

Gebruik een recente Node-versie voor tests. De app zelf heeft geen dependencies of build nodig.

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Dubbelklikken op index.html werkt niet vanwege het laden van de dossiers via fetch.

```sh
npm test
```

De tests lossen elk dossier onafhankelijk op en controleren uniciteit, één dader, verboden vakjes en de rij/kolomregels. `npm run generate` maakt dezelfde eenentwintig dossiers opnieuw met de vaste seed. De eerste zaak heeft twee vaste startposities en is met directe uitsluiting zonder gokken op te lossen. De eerste twee zaken gebruiken alleen plaatsaanwijzingen; daarna volgen vergelijkingen tussen personen. De vijf oorspronkelijke dossiers blijven bereikbaar via Eerdere zaken, met behoud van hun bestaande voortgang. De opgeslagen puzzels bevatten aanwijzingen, geen hardgecodeerde oplossing; de solver leidt de oplossing af.

## Publicatie onder Leren met Loes

Deze app staat zelfstandig in `grundoku/` binnen `rdegroot1/lerenmetloes`.

Speel op https://rdegroot1.github.io/lerenmetloes/grundoku/.

GitHub Pages publiceert deze map samen met de bestaande site. Er is geen aparte Pages-configuratie of workflow nodig. De startpagina van Leren met Loes blijft ongewijzigd. De opslag gebruikt uitsluitend `grunmurdoku:v1:`-sleutels en raakt de leervoortgang niet aan.

Voer de tests vanuit deze map uit met `npm test`.

De interface gebruikt lokale lettertypen. Puzzeldata en voortgang blijven in de browser. De app is niet als offline PWA ingericht.

## Illustraties en printen

De oorspronkelijke vectorillustraties in `art.js` tekenen zes portretten en Groningse objecten: Martinitoren, Peerd van ome Loeks, Groningse vlag, eierballenkraam, viskraam, fietsrek, boom en bankje. Ze vereisen geen externe afbeeldingendienst of fonts.

Print deze zaak opent een blanco puzzel inclusief eventuele vaste startposities. Print deze serie geeft zeventien of vier pagina’s, afhankelijk van de gekozen serie: één zaak per liggend A4. `@page` stelt liggend A4 met marges van 10 mm in. De download `grundoku-print.pdf` bevat alle eenentwintig schone puzzels; `grundoku-nacht-in-stad.pdf` bevat alleen de vier nieuwe dossiers. Browsernotities en oplossingen worden niet geprint. Kies A4 en 100% schaal; schakel zo nodig browserkop- en voetteksten uit. Gebiedsgrenzen en labels werken ook zonder achtergrondkleuren.

Gecontroleerd in Chromium op desktop en 390px mobiel: alle zaken, de drieklikcyclus, meerdere concepten, herladen, hints, beschuldiging, archief, vaste posities, reset en terug. Het complete puzzelboek telt eenentwintig liggende A4’s; printinhoud is op overloop gecontroleerd.

## Vrije gebiedsvormen

Vanaf zaak 2 hebben de gebieden samenhangende L-vormen, inspringingen en smalle stroken. De eenvoudige introductie houdt haar oorspronkelijke kaart. Elk gebied blijft via zijden verbonden, en iedere nieuwe zaak heeft precies één oplossing. De vorige versies van de gewijzigde zaken staan met hun oorspronkelijke opslag-ID in Eerdere zaken; nieuwe kaarten gebruiken nieuwe IDs, zodat bestaande notities op de oude kaarten blijven passen. De PDF volgt de nieuwe gebiedsvormen.

## Namen en stap-voor-stapoplossing

De nieuwe reeks gebruikt Arend, Bertus, Cora, Tammo, Geeske en Fokko; hun initialen zijn uniek. De aangepaste namen veranderen geen persoonindices, notities of plaatsingen. De gegenereerde aanwijzingen bevatten geen expliciete koppeling van een verdachte aan hetzelfde gebied als het slachtoffer. Een herziene aanwijzingenlijst wist alleen de afvinkvinkjes van die betreffende zaak; plaatsingen en conceptnotities blijven behouden.

Bekijk oplossing (spoiler) opent een aparte dialoog met bulletpoints. `explain.js` past de publieke plaatsaanwijzingen, relaties, rij- en kolomuitsluiting, groepen met bezette rijen/kolommen en de slachtofferregel toe. Elke gevonden vaste plek wordt in volgorde uitgelegd. Waar deze afleidingen niet volstaan, benoemt de uitleg expliciet de overgebleven combinaties en toetst die met de volledige solver. De laatste bullet identificeert de dader. De uitleg verschijnt nooit vanzelf, plaatst geen personen en wordt niet in de blanco PDF opgenomen.

## Groningse themazaken en gebiedsnamen

Zaken 7–12 spelen rond de Hoornseplas, het Stadspark, het Noorderplantsoen, de binnenstadskroegen en een festival in het groen. Gebieden zijn onder meer zandstrand, zwemsteiger, rietkraag, De Negende Cirkel, Het Pakhuis, De Drie Gezusters, Huize Maas, De Pintelier en Café De Toeter. Kaarten en verhalen zijn fictief en schematisch.

De gebiedsnamen staan als compacte serif-linten in een hoek van hun eigen gebied, zowel op scherm als papier. De labels blokkeren geen klik- of notitiedoelen. De ankers vermijden voorwerpen en gegeven posities waar mogelijk; letters gebruiken lokale Palatino/Georgia-fallbacks. De nieuwe illustraties voegen parasols, riet, podium, bar en lantaarns toe.

In Stadse speurtochten krijgt het slachtoffer minstens één eigen plaatsaanwijzing. In Nacht in Stad staat bij het slachtoffer uitsluitend “Was samen met de moordenaar”, zoals door de gebruiker gevraagd; de overgebleven plek volgt uit de andere personen. Selecteer een nog niet geplaatste persoon, ook het slachtoffer, en vraag Een zetje om juist die persoon te plaatsen. De oorspronkelijke zes oplossingen en opslag-ID’s blijven gelijk; gewijzigde aanwijzingen vernieuwen alleen de afvinkjes. De reeksnavigatie, archiefgrens en printreeks volgen het aantal dossiers automatisch.

## Slachtofferkaart in alle versies

Ook de tien archiefzaken hebben een eigen plaatsaanwijzing voor het slachtoffer; deze aanvulling is afgeleid van hun bestaande unieke oplossing en verandert geen plaatsingen of opslag-ID’s. Alleen afvinkjes in de vijf aangevulde archiefzaken krijgen een nieuwe versie. De kaart en print tonen Plaatsaanwijzing apart van Spelregel, zodat de algemene slachtofferregel geen plaatsaanwijzing lijkt te vervangen. Puzzelgegevens worden met een versiesleutel en zonder browsercache opgehaald; de ingang en printdownload hebben dezelfde vernieuwingssleutel. Browsercontrole omvat alle 27 slachtofferkaarten op scherm en papier.

## Concepten herstellen

Voor iedere definitieve plaatsing bewaart `notes.js` de concepten die daardoor verborgen worden. De derde klik herstelt die concepten zonder latere aantekeningen of andere plaatsingen terug te draaien. Dit werkt ook na herladen en met Terug; vaste startposities blijven staan. Concepten worden niet hersteld op bezette of weggestreepte vakken, of voor personen die inmiddels elders definitief staan. Wissen blijft expliciet wissen. Oudere opgeslagen plaatsingen zonder bewaarde concepten vallen terug op het initial van de betreffende persoon.

## Extra inspiratiezaken

Zaken 13–17 voegen Het aardbevingsdorp (fictief wierdedorp), Bommen Berend, Eurosonic, Noorderzon in het Noorderplantsoen en WinterWelVaart toe. De laatste drie kaarten hebben vijf gebieden, met kleinere ruimtes zoals backstage, garderobe en roef. De originele illustraties tonen onder meer een bouwsteiger, historisch kanon, gitaar, festivaltent, schip en winterkraam. De oorspronkelijke twaalf dossiers zijn byte-voor-byte behouden in de data; nieuwe dossiers hebben eigen opslag-ID’s. Het printboek telt zeventien liggende A4-pagina’s.

## Spelregels openen

De knop Spelregels staat in de kop en direct bij het speelveld. Beide openen dezelfde toegankelijke dialoog met doel, basisregels, de drieklikcyclus, originele voorbeelddiagrammen, begrippen en een aanpak. De uitleg maakt onderscheid tussen de oorspronkelijke serie met geblokkeerde voorwerpen en Nacht in Stad met bezetbare meubels. Voorwerpen over meerdere vakjes, exclusieve meubelaanwijzingen en exacte aantallen worden met voorbeelden uitgelegd. De dialoog sluit met de sluitknop, Terug naar de zaak of Escape en verandert geen notities of voortgang.

## Nacht in Stad: serie 2

De serieknoppen kiezen de oorspronkelijke zeventien zaken of de vier nieuwe mugshot-dossiers. De keuzelijst, volgende zaak en reeksnavigatie volgen de gekozen serie. `?serie=nacht` opent rechtstreeks de nieuwe reeks. Afvinkaanwijzingen hebben grotere toegankelijke checkboxen; ook op papier staan lege afvinkvakjes. Locatienamen zijn verfijnde naambordjes binnen hun eigen gebied.

Nieuwe speelvelden hebben echte uitsparingen aan de buitenkant: `regions[cell] === -1` is geen speelvak. `isPlayable` bewaakt dit in solver, validatie, uitleg, opgeslagen notities en herstel. Transparante stukken blijven ook op papier transparant. Rijen en kolommen lopen door over de uitsparingen; de oorspronkelijke spelregels blijven geldig.

De mugshots zijn oorspronkelijke vectorillustraties met hoogtelijnen, dossiernummer en een vastgehouden naambord. Arend blijft mannelijk afgebeeld. De oude portretten zijn ongewijzigd. Nieuwe voorwerpen: toneeldoek, theaterstoel, silo, opslagkrat, bierkrat, boekenkast, filmprojector en bank.

De vier nieuwe slachtoffers hebben bewust geen eigen plaatsaanwijzingen; dit geldt alleen voor Nacht in Stad. Rechtstreekse aanwijzingen die de dader aan het slachtoffer koppelen blijven uitgesloten. Alle vier dossiers hebben precies één oplossing. De oorspronkelijke zeventien dossiers en opslag-ID’s zijn ongewijzigd.

## Bezetbare meubels en grotere voorwerpen

Nacht in Stad gebruikt stoelen, banken, bedden en vloerkleden als mogelijke plekken. Kleine groene markeringen geven de bezetbare vakken aan. Een bed of bank kan twee vakken beslaan, een vloerkleed vier; grote tafels blokkeren twee of vier vakken. De illustratie loopt door over het hele voorwerp. Elk deelvak telt als een mogelijke plek, maar personen blijven in verschillende rijen en kolommen. ‘Naast’ betekent buiten het hele voorwerp, direct aan een zijkant en in hetzelfde gebied.

Extra aanwijzingen onder de persoonskaarten zijn ook afvinkbaar. ‘Precies twee personen zaten op een stoel’ telt personen op alle stoelen samen, inclusief het slachtoffer. ‘De enige persoon op een vloerkleed’ sluit alle andere personen uit van alle vloerkleden. Bij het slachtoffer blijft uitsluitend ‘Was samen met de moordenaar’ staan. De stap-voor-stapuitleg verwerkt deze regels.

Alle vier herziene dossiers hebben één oplossing, met dezelfde plaatsingen en opslag-ID’s als ervoor. Alleen afvinkjes worden vernieuwd vanwege de gewijzigde aanwijzingen. Notities op bezetbare meubels, terugzetten met de derde klik en herladen blijven werken. De eerste zeventien puzzelgegevens zijn ongewijzigd. Beide PDF’s bevatten de nieuwe meubels en extra aanwijzingen.

## Eenduidige aanwijzingen en ruimtebanners

In Nacht in Stad heeft elke verdachte precies één eigen aanwijzing. Geen persoonsaanwijzing verwijst naar het slachtoffer, dat alleen de algemene slachtofferregel krijgt. Groepsaanwijzingen blijven apart afvinkbaar. Alle stoelen hebben dezelfde tekening, de naam ‘een stoel’ en dezelfde betekenis in aanwijzingen. De herziening behoudt de oplossingen en opslag-ID’s; alleen afvinkjes krijgen een nieuwe versie.

Ruimtenamen staan in compacte sierlijke linten tegen een onderste hoek van hun eigen gebied. De ankers vermijden voorwerpen en vaste startposities waar mogelijk. De banners laten het midden van de ruimte vrij, klikken door naar het rooster en worden ook op liggend A4 geprint.

## Slachtofferillustraties

Fokko krijgt in ieder Nacht in Stad-dossier een eigen slachtofferportret met een ander getekend moordwapen: dolk, moersleutel, gifflacon en kandelaar. Deze vectorillustraties staan op scherm en in beide PDF’s. De verdachten houden hun mugshots. Het wapen is decoratief en vormt geen plaatsaanwijzing; de slachtofferkaart houdt uitsluitend ‘Was samen met de moordenaar’. Puzzelregels, oplossingen, aanwijzingenversies en opgeslagen voortgang blijven gelijk.

## Naamswijziging naar Grundoku

De app staat nu in `grundoku/`. Het oude adres `/grunmurdoku/` verwijst door en bewaart de gekozen serie, overige queryparameters en het fragment. De bestaande `grunmurdoku:v1:`-opslagsleutels blijven bewust behouden; alle IDs, plaatsingen, notities, afvinkjes en opgeloste zaken blijven daardoor beschikbaar op dezelfde origin. Oude rechtstreekse PDF-links blijven werken en bevatten de bijgewerkte Grundoku-uitgave.
