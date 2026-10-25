# grunmurdoku

Een zelfstandige Nederlandstalige detectivepuzzel in Groningen. Vijf oorspronkelijke zaken op de Grote Markt, Vismarkt, in het Noorderplantsoen en aan de Hoge der A. Alle personages en verhalen zijn fictief. Geen boekillustraties, teksten of bestaande puzzelindelingen overgenomen.

## Spelen

Plaats alle zes personen in verschillende rijen en kolommen. Voorwerpen blokkeren hun vakje. Elke aanwijzing moet kloppen. Het slachtoffer was met precies één andere persoon in hetzelfde gebied: de dader.

Selecteer een persoon, daarna een vrij vakje. Wissel tussen plaatsen, wegstrepen en wissen. Een bezette cel selecteert de betreffende persoon om die te verplaatsen. Aanwijzingen kun je afvinken. Hints plaatsen één persoon; Terug draait wijzigingen terug. Voortgang blijft lokaal bewaard per zaak. Geen account, backend of API-sleutel nodig.

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

De tests lossen elk dossier onafhankelijk op en controleren uniciteit, één dader, verboden vakjes en de rij/kolomregels. `npm run generate` maakt dezelfde vijf dossiers opnieuw met de vaste seed. De opgeslagen puzzels bevatten aanwijzingen, geen hardgecodeerde oplossing; de solver leidt de oplossing af.

## Publicatie onder Leren met Loes

Deze app staat zelfstandig in `grunmurdoku/` binnen `rdegroot1/lerenmetloes`.

Speel op https://rdegroot1.github.io/lerenmetloes/grunmurdoku/.

GitHub Pages publiceert deze map samen met de bestaande site. Er is geen aparte Pages-configuratie of workflow nodig. De startpagina van Leren met Loes blijft ongewijzigd. De opslag gebruikt uitsluitend `grunmurdoku:v1:`-sleutels en raakt de leervoortgang niet aan.

Voer de tests vanuit deze map uit met `npm test`.

De interface gebruikt optioneel Google Fonts; zonder verbinding vallen de fonts terug op lokale lettertypen. Puzzeldata en voortgang blijven in de browser. De app is niet als offline PWA ingericht.
