# Frontierlingo

Een leerspel voor het hele gezin, in de stijl van Duolingo. Eén HTML-bestand, zonder installatie: open `index.html` in de browser of via GitHub Pages.

- **Loes (kind):** lezen (rijmen, klanken, eerste woordjes), rekenen (tellen, splitsen, plus en min), Engels en topografie.
- **Rik en Judith (volwassen):** dt-regels en spelling, hoofdrekenen, Engelse false friends en uitdrukkingen, topografie van Nederland, Europa en de wereld.
- XP, sterren, stickers, leerdoelen en een gezinsranglijst.

## Voortgang

Voortgang wordt in de browser van het apparaat bewaard. Een nieuwe versie van het spel laat XP en levels staan. Naar een ander apparaat neem je de voortgang mee met de knop **📦 Voortgang meenemen** op het startscherm.

## Aanpassen

Woorden, levels, vragen en leerdoelen staan als lijstjes bovenaan het script in `index.html` (`WOORDEN`, `LEZEN_LEVELS`, `REKENEN_LEVELS`, `DT_VRAGEN`, `LEERDOELEN`, ...). Elk level heeft een vaste `id`: verander die niet, want de voortgang hangt eraan.

## Open bronnen

- Kaart van de provincies: [click_that_hood](https://github.com/codeforgermany/click_that_hood) (`the-netherlands.geojson`).
- Landen: [Natural Earth](https://www.naturalearthdata.com/) (publiek domein), via [world-atlas](https://github.com/topojson/world-atlas) en [topojson-client](https://github.com/topojson/topojson-client).
- Lettertypen: Andika en Fredoka via Google Fonts (SIL Open Font License).
- `kaartdata/build.js` zet de kaartdata om naar de compacte kaart in `index.html`.
