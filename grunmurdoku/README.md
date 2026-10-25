# grunmurdoku

Een zelfstandige Nederlandstalige detectivepuzzel in Groningen. Zes nieuwe zaken die opbouwen van heel makkelijk (4×4) naar uitdagend (6×6), plus de vijf oorspronkelijke zaken in het archief. Oorspronkelijke zaken op de Grote Markt, Vismarkt, in het Noorderplantsoen en aan de Hoge der A. Alle personages en verhalen zijn fictief. Geen boekillustraties, teksten of bestaande puzzelindelingen overgenomen.

## Spelen

Plaats alle zes personen in verschillende rijen en kolommen. Voorwerpen blokkeren hun vakje. Elke aanwijzing moet kloppen. Het slachtoffer was met precies één andere persoon in hetzelfde gebied: de dader.

Selecteer een persoon. De eerste klik op een vrij vakje zet een klein conceptinitial in het hoekje. De tweede klik op dat vakje met dezelfde persoon geselecteerd maakt de plaatsing definitief. Meerdere concepten per vakje en per persoon zijn mogelijk. Alleen definitieve plaatsingen tellen mee voor de rij-, kolom- en gebiedsregels. Definitief plaatsen verwijdert de overige concepten van die persoon en alle concepten in het gekozen vakje. Wissel tussen plaatsen, wegstrepen en wissen. Een bezette cel selecteert de betreffende persoon om die te verplaatsen. Aanwijzingen kun je afvinken. Hints plaatsen één persoon; Terug draait wijzigingen terug. Voortgang blijft lokaal bewaard per zaak. Geen account, backend of API-sleutel nodig.

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

De tests lossen elk dossier onafhankelijk op en controleren uniciteit, één dader, verboden vakjes en de rij/kolomregels. `npm run generate` maakt dezelfde zes nieuwe dossiers opnieuw met de vaste seed. De eerste zaak heeft twee vaste startposities en is met directe uitsluiting zonder gokken op te lossen. De eerste twee zaken gebruiken alleen plaatsaanwijzingen; daarna volgen vergelijkingen tussen personen. De vijf oorspronkelijke dossiers blijven bereikbaar via Eerdere zaken, met behoud van hun bestaande voortgang. De opgeslagen puzzels bevatten aanwijzingen, geen hardgecodeerde oplossing; de solver leidt de oplossing af.

## Publicatie onder Leren met Loes

Deze app staat zelfstandig in `grunmurdoku/` binnen `rdegroot1/lerenmetloes`.

Speel op https://rdegroot1.github.io/lerenmetloes/grunmurdoku/.

GitHub Pages publiceert deze map samen met de bestaande site. Er is geen aparte Pages-configuratie of workflow nodig. De startpagina van Leren met Loes blijft ongewijzigd. De opslag gebruikt uitsluitend `grunmurdoku:v1:`-sleutels en raakt de leervoortgang niet aan.

Voer de tests vanuit deze map uit met `npm test`.

De interface gebruikt lokale lettertypen. Puzzeldata en voortgang blijven in de browser. De app is niet als offline PWA ingericht.

## Illustraties en printen

De oorspronkelijke vectorillustraties in `art.js` tekenen zes portretten en Groningse objecten: Martinitoren, Peerd van ome Loeks, Groningse vlag, eierballenkraam, viskraam, fietsrek, boom en bankje. Ze vereisen geen externe afbeeldingendienst of fonts.

Print deze zaak opent een blanco puzzel inclusief eventuele vaste startposities. Print de reeks geeft zes pagina’s: één zaak per liggend A4. `@page` stelt liggend A4 met marges van 10 mm in. De download `grunmurdoku-print.pdf` bevat dezelfde zes schone puzzels. Browsernotities en oplossingen worden niet geprint. Kies A4 en 100% schaal; schakel zo nodig browserkop- en voetteksten uit. Gebiedsgrenzen en labels werken ook zonder achtergrondkleuren.

Gecontroleerd in Chromium op desktop en 390px mobiel: alle zaken, notities met twee klikken, meerdere concepten, herladen, hints, beschuldiging, archief, vaste posities, reset en terug. De PDF telt zes liggende A4’s; printinhoud is op overloop gecontroleerd.
