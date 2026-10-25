# grunmurdoku

Een zelfstandige Nederlandstalige detectivepuzzel in Groningen. Zeventien zaken: een opbouw van heel makkelijk (4×4) naar uitdagend (6×6), gevolgd door elf Groningse themazaken. Tien oudere versies blijven in het archief beschikbaar. Oorspronkelijke zaken op de Grote Markt, Vismarkt, in het Noorderplantsoen en aan de Hoge der A. Alle personages en verhalen zijn fictief. Geen boekillustraties, teksten of bestaande puzzelindelingen overgenomen.

## Spelen

Plaats alle personen in verschillende rijen en kolommen. Voorwerpen blokkeren hun vakje. Elke aanwijzing moet kloppen. Het slachtoffer was met precies één andere persoon in hetzelfde gebied: de dader.

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

De tests lossen elk dossier onafhankelijk op en controleren uniciteit, één dader, verboden vakjes en de rij/kolomregels. `npm run generate` maakt dezelfde zeventien dossiers opnieuw met de vaste seed. De eerste zaak heeft twee vaste startposities en is met directe uitsluiting zonder gokken op te lossen. De eerste twee zaken gebruiken alleen plaatsaanwijzingen; daarna volgen vergelijkingen tussen personen. De vijf oorspronkelijke dossiers blijven bereikbaar via Eerdere zaken, met behoud van hun bestaande voortgang. De opgeslagen puzzels bevatten aanwijzingen, geen hardgecodeerde oplossing; de solver leidt de oplossing af.

## Publicatie onder Leren met Loes

Deze app staat zelfstandig in `grunmurdoku/` binnen `rdegroot1/lerenmetloes`.

Speel op https://rdegroot1.github.io/lerenmetloes/grunmurdoku/.

GitHub Pages publiceert deze map samen met de bestaande site. Er is geen aparte Pages-configuratie of workflow nodig. De startpagina van Leren met Loes blijft ongewijzigd. De opslag gebruikt uitsluitend `grunmurdoku:v1:`-sleutels en raakt de leervoortgang niet aan.

Voer de tests vanuit deze map uit met `npm test`.

De interface gebruikt lokale lettertypen. Puzzeldata en voortgang blijven in de browser. De app is niet als offline PWA ingericht.

## Illustraties en printen

De oorspronkelijke vectorillustraties in `art.js` tekenen zes portretten en Groningse objecten: Martinitoren, Peerd van ome Loeks, Groningse vlag, eierballenkraam, viskraam, fietsrek, boom en bankje. Ze vereisen geen externe afbeeldingendienst of fonts.

Print deze zaak opent een blanco puzzel inclusief eventuele vaste startposities. Print de reeks geeft zeventien pagina’s: één zaak per liggend A4. `@page` stelt liggend A4 met marges van 10 mm in. De download `grunmurdoku-print.pdf` bevat dezelfde zeventien schone puzzels. Browsernotities en oplossingen worden niet geprint. Kies A4 en 100% schaal; schakel zo nodig browserkop- en voetteksten uit. Gebiedsgrenzen en labels werken ook zonder achtergrondkleuren.

Gecontroleerd in Chromium op desktop en 390px mobiel: alle zaken, de drieklikcyclus, meerdere concepten, herladen, hints, beschuldiging, archief, vaste posities, reset en terug. De PDF telt zeventien liggende A4’s; printinhoud is op overloop gecontroleerd.

## Vrije gebiedsvormen

Vanaf zaak 2 hebben de gebieden samenhangende L-vormen, inspringingen en smalle stroken. De eenvoudige introductie houdt haar oorspronkelijke kaart. Elk gebied blijft via zijden verbonden, en iedere nieuwe zaak heeft precies één oplossing. De vorige versies van de gewijzigde zaken staan met hun oorspronkelijke opslag-ID in Eerdere zaken; nieuwe kaarten gebruiken nieuwe IDs, zodat bestaande notities op de oude kaarten blijven passen. De PDF volgt de nieuwe gebiedsvormen.

## Namen en stap-voor-stapoplossing

De nieuwe reeks gebruikt Arend, Bertus, Cora, Tammo, Geeske en Fokko; hun initialen zijn uniek. De aangepaste namen veranderen geen persoonindices, notities of plaatsingen. De gegenereerde aanwijzingen bevatten geen expliciete koppeling van een verdachte aan hetzelfde gebied als het slachtoffer. Een herziene aanwijzingenlijst wist alleen de afvinkvinkjes van die betreffende zaak; plaatsingen en conceptnotities blijven behouden.

Bekijk oplossing (spoiler) opent een aparte dialoog met bulletpoints. `explain.js` past de publieke plaatsaanwijzingen, relaties, rij- en kolomuitsluiting, groepen met bezette rijen/kolommen en de slachtofferregel toe. Elke gevonden vaste plek wordt in volgorde uitgelegd. Waar deze afleidingen niet volstaan, benoemt de uitleg expliciet de overgebleven combinaties en toetst die met de volledige solver. De laatste bullet identificeert de dader. De uitleg verschijnt nooit vanzelf, plaatst geen personen en wordt niet in de blanco PDF opgenomen.

## Groningse themazaken en gebiedsnamen

Zaken 7–12 spelen rond de Hoornseplas, het Stadspark, het Noorderplantsoen, de binnenstadskroegen en een festival in het groen. Gebieden zijn onder meer zandstrand, zwemsteiger, rietkraag, De Negende Cirkel, Het Pakhuis, De Drie Gezusters, Huize Maas, De Pintelier en Café De Toeter. Kaarten en verhalen zijn fictief en schematisch.

De gebiedsnamen staan als serif-naambordjes op een horizontale strook van hun eigen gebied, zowel op scherm als papier. De labels blokkeren geen klik- of notitiedoelen. De ankers vermijden voorwerpen en gegeven posities waar mogelijk; letters gebruiken lokale Palatino/Georgia-fallbacks. De nieuwe illustraties voegen parasols, riet, podium, bar en lantaarns toe.

Ieder slachtoffer krijgt minstens één eigen plaatsaanwijzing, naast de algemene slachtofferregel. Selecteer een nog niet geplaatste persoon, ook het slachtoffer, en vraag Een zetje om juist die persoon te plaatsen. De oorspronkelijke zes oplossingen en opslag-ID’s blijven gelijk; gewijzigde aanwijzingen vernieuwen alleen de afvinkjes. De reeksnavigatie, archiefgrens en printreeks volgen het aantal dossiers automatisch.

## Slachtofferkaart in alle versies

Ook de tien archiefzaken hebben een eigen plaatsaanwijzing voor het slachtoffer; deze aanvulling is afgeleid van hun bestaande unieke oplossing en verandert geen plaatsingen of opslag-ID’s. Alleen afvinkjes in de vijf aangevulde archiefzaken krijgen een nieuwe versie. De kaart en print tonen Plaatsaanwijzing apart van Spelregel, zodat de algemene slachtofferregel geen plaatsaanwijzing lijkt te vervangen. Puzzelgegevens worden met een versiesleutel en zonder browsercache opgehaald; de ingang en printdownload hebben dezelfde vernieuwingssleutel. Browsercontrole omvat alle 27 slachtofferkaarten op scherm en papier.

## Concepten herstellen

Voor iedere definitieve plaatsing bewaart `notes.js` de concepten die daardoor verborgen worden. De derde klik herstelt die concepten zonder latere aantekeningen of andere plaatsingen terug te draaien. Dit werkt ook na herladen en met Terug; vaste startposities blijven staan. Concepten worden niet hersteld op bezette of weggestreepte vakken, of voor personen die inmiddels elders definitief staan. Wissen blijft expliciet wissen. Oudere opgeslagen plaatsingen zonder bewaarde concepten vallen terug op het initial van de betreffende persoon.

## Extra inspiratiezaken

Zaken 13–17 voegen Het aardbevingsdorp (fictief wierdedorp), Bommen Berend, Eurosonic, Noorderzon in het Noorderplantsoen en WinterWelVaart toe. De laatste drie kaarten hebben vijf gebieden, met kleinere ruimtes zoals backstage, garderobe en roef. De originele illustraties tonen onder meer een bouwsteiger, historisch kanon, gitaar, festivaltent, schip en winterkraam. De oorspronkelijke twaalf dossiers zijn byte-voor-byte behouden in de data; nieuwe dossiers hebben eigen opslag-ID’s. Het printboek telt zeventien liggende A4-pagina’s.

## Spelregels openen

De knop Spelregels staat in de kop en direct bij het speelveld. Beide openen dezelfde toegankelijke dialoog met doel, basisregels, de drieklikcyclus, originele voorbeelddiagrammen, begrippen en een aanpak. De uitleg beschrijft de werkelijke Grunmurdoku-regels: alle getekende voorwerpen blokkeren hun vakje; er wordt geen regel over bezetbare meubels uit het inspiratieboek gesuggereerd. De dialoog sluit met de sluitknop, Terug naar de zaak of Escape en verandert geen notities of voortgang.
