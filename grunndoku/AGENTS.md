# Grunndoku

Zelfstandige Nederlandstalige detectivepuzzel onder Leren met Loes. De juiste merknaam is **Grunndoku**, met twee n’s. Wijzig de hoofdapp niet voor werkzaamheden aan dit spel.

## Puzzelkwaliteit

- Iedere actuele zaak heeft precies één oplossing en één dader. Elke ruimte beslaat minimaal vier rastervakken. Werk bij grenswijzigingen de publieke aanwijzingen en hun vakmaskers samen bij; controleer verbonden ruimtes en behoud bestaande oplossingen.
- Iedere verdachte heeft precies één eigen aanwijzing. Actuele zaken beginnen zonder gegeven posities; vaste startplaatsen zijn alleen voor de oefenuitleg en het archief. Het slachtoffer heeft uitsluitend ‘Was samen met de moordenaar.’ Geen aanwijzing van een persoon verwijst naar het slachtoffer.
- Aanwijzingen mogen geen exact vak voorschrijven met een rij-en-kolompaar of een getelde afstand vanaf een voorwerp (‘precies drie vakjes rechts van ...’). Een genummerde rij óf kolom mag wel. Gebruik ook ruimere plaatsaanwijzingen, uitsluitingen, relaties tussen verdachten en ruimte- of meubelbezetting. Moeilijkheid komt uit samenhangende redeneerstappen; een grotere kaart en meer invulwerk zijn op zichzelf geen hoger niveau. Vervang bestaande afstandsaanwijzingen met behoud van één oplossing en controleer ook een deductieve route. Een eigen aanwijzing kan samenhangende informatie bevatten, maar mag geen verkapte exacte coördinaat worden.
- Eén soort stoel: dezelfde tekening, naam en betekenis. Groen gemarkeerde meubels zijn bezetbaar. Grote voorwerpen hebben één doorlopende illustratie en echte deelvakken.
- Behoud opslag-ID’s en bestaande oplossingen waar mogelijk. De oorspronkelijke opslagnamespace `grunmurdoku:v1:` is bewust behouden. Vernieuw alleen afvinkversies wanneer aanwijzingen wijzigen.
- Eerste zaak blijft zonder gokken met directe uitsluiting oplosbaar. Moeilijkheid gebruikt vijf sterren en de gedeelde labels in `difficulty.js`; zesdelige themareeksen hebben een zesde XXL-zaak met zes sterren. Gebruik een label dat bij het thema past.
- Hints tonen kleine redeneerstappen, zonder automatisch te plaatsen of de dader te noemen. Leid ze af uit de huidige definitieve plaatsingen en openbare regels.
- Rechtsklik kruist af en behoudt het gereedschap. Initialen selecteren personen; onderdruk die sneltoetsen in invoervelden en geopende dialogen.
- Niveau-feedback blijft lokaal tot de speler die bewust exporteert. Claim geen empirische kalibratie zonder proefspeelgegevens.
- De homepage toont uitsluitend vijf even grote, brede themakaarten onder elkaar met eigen PDF-link en een algemeen startblad. Elk thema opent eerst een eigen startblad met voorbeeld en voorwerpoverzicht; pas daarna verschijnen de puzzels. Bewaar schermnavigatie en browser-Terug zonder spelvoortgang te wijzigen.
- De vaste hoofdbalk bevat Spelregels en in een zaak het Zaakmenu met printen, PDF, archief, oplossing en opnieuw beginnen. Geen tweede spelregelknop bij de kaart. Alle zaken is een compact uitklapoverzicht bij de zaakkeuze. Houd primaire, secundaire en gereedschapsknoppen herkenbaar en behoud klikdoelen bij het noteren.
- Zaakkeuzes op het themastartblad en in de puzzel tonen uitsluitend zaken van het huidige thema, met nummer en titel. Geen moeilijkheid in de keuzes of zaaknavigatie; sterren en niveau staan op de puzzel. Houd het archief apart bereikbaar.
- Geen kladroosters of losse initialenlijstjes op scherm of papier. Kleine letters in conceptnotities en initialen in geplaatste tokens blijven functioneel.
- Grote zaken tonen vanaf 1000 pixels de aanwijzingen en kaart naast elkaar. De aanwijzingen scrollen binnen hun paneel; de kaart past standaard en blijft tot 300% vergroot volledig bereikbaar. Bewaar paneelposities bij noteren.
- Kleine zaken staan vanaf 760 pixels naast elkaar. Houd aparte schaalregelaars voor personen en kaart, zonder spelvoortgang te veranderen.
- Behoud vakknoppen tijdens het noteren. Verifieer snelle dubbele klikken en aanrakingen; de derde klik herstelt de eerdere concepten. Meldingen mogen het doelvak niet verplaatsen.
- Vloerpatronen zijn eigen sfeertekeningen, met behoud van gebiedskleuren en leesbare rastergrenzen. Gebruik dezelfde patronen op papier.
- Drie klikken: concept, definitief, eerdere concepten herstellen. Controleer dit ook na herladen en op meubels.
- PDF’s: bundels beginnen met twee eigen oefenpagina’s. Speluitleg en de algemene fictietoelichting staan bij de introductie; voeg geen herhaald ‘Even op weg’-blok of fictiedisclaimer aan losse puzzels toe. Klassieke zaken passen op één liggend A4; kleine Martini- en torenzaken (t/m 10 personen op maximaal 12 × 10 vakken) passen op één A4; grotere gebruiken één kaartpagina en één personagepagina. Houd oude PDF-adressen bruikbaar.

- De drie zaken Rond de Martini horen bij het bestaande Martini-thema: De Kostery, Prinsentuin en Prinsenhof, niveaus 3/4/5 met 8/9/10 personen. Elk op één A4. Locaties krijgen afzonderlijke eigen kaarten; de caféverdiepingen zijn uitgeklapt tot één rooster, zonder verzonnen verbinding naar de kerk.
- De Martini-serie gebruikt de huidige kerk als inspiratie: orgel, preekstoel, koor en kapellen; geen historische biechthokjes. Kaarten zijn eigen schematische puzzelindelingen, geen bezoekersplattegrond. Breedte en hoogte kunnen verschillen; gebruik de dimensioneringsfuncties uit `engine.js`.
- Fokko is in actuele zaken het slachtoffer en staat als laatste in alle personagelijsten, ook op papier. Sorteer alleen de presentatie; behoud indices voor voortgang en aanwijzingen.
- Toon geen oriëntatiekop met noord/west/zuid/oost boven de kaart, ook niet op papier. Windrichtingen mogen wel in aanwijzingen en de spelregels staan.
- Ruimtenamen staan op de kaart; voeg geen tweede gebiedslegenda onder de kaart toe. Het overzicht van bezetbare en geblokkeerde voorwerpen staat bij de introductie en in Spelregels, niet onder iedere puzzel.
- Mugshots hebben hun naam uitsluitend op het vastgehouden bord; geen tweede naamstrook eronder. Archiefportretten mogen hun naamstrook behouden.

## Juridische uitgangspunten

- Maak eigen puzzelindelingen, personages, illustraties, verhalen, uitleg en grafische vormgeving. Neem geen boekpagina’s, afbeeldingen, voorbeeldpuzzels of karakteristieke vormgeving over.
- Gebruik namen van andere spellen niet als onze merknaam, logo, verkooplabel of SEO-trefwoord. Suggereer geen samenwerking of toestemming zonder concrete basis.
- Gebruik bestaande Groningse locaties beschrijvend in duidelijk fictieve, schematische zaken. Gebruik geen logo’s, foto’s of herkenbare echte personen zonder passende rechten.
- Bewaar herkomst en licenties bij eventuele externe assets. Huidige illustraties zijn eigen SVG-code en lettertypen worden niet meegeleverd.
- Noem de naam of uitwerking niet juridisch vrijgegeven of exclusief beschermd zonder geverifieerde grondslag. Een zoekopdracht is geen volledig merkenonderzoek.
- Bij voorbereiding van Etsy-publicaties: geef AI-gebruik eerlijk aan, toon het echte product en maak downloadtype en gebruiksrechten duidelijk. Bij Sikkom: bereid een beperkte niet-exclusieve publicatielicentie voor. Publiceer of verstuur daar alleen op verzoek van de gebruiker.
- Bewaar menselijke ontwerpkeuzes en versiegeschiedenis. Ga niet uit van auteursrecht op ieder AI-gegenereerd onderdeel.

Zie `PUBLICATIE.md` voor bronnen en resterende aandachtspunten. Deze werkinstructies vormen geen juridische goedkeuring van het product.

## Thematische uitbreiding

Noorderzon heeft op uitdrukkelijk verzoek acht normale zaken op niveaus 1, 2, 2, 3, 3, 4, 5, 5; iedere zaak op één liggend A4, zonder XXL. Houd een staande rechthoekige vijver met centrale fontein aan. Per ander nieuw thema blijft de eerdere standaard vijf normale niveaus plus een zesde XXL-zaak; varieer uitsneden, ruimtes en personages. WinterWelVaart is als eerste op deze manier toegevoegd. Behoud eerdere losse zaken en hun voortgang. De Euroborg en de andere bestaande thema’s staan in `ROADMAP.md`. Gebruik echte locaties alleen als beschrijvende inspiratie en maak eigen schematische plattegronden. Een waterzaak reconstrueert de posities vóór de val; het slachtoffer krijgt geen eigen plaatsaanwijzing.

- Fokko spreekt de speler toe in de optionele redeneerhulp; zijn karaktertekst voegt geen plaatsaanwijzing toe. Gebruik subtiele Groningse woorden zonder iedere zin in dialect te schrijven. Geen zichtbare timer tijdens het spelen. Bewaar speeltijd per zaak, pauzeer buiten de puzzel en in een verborgen tabblad, toon tijd alleen na oplossen. Benoem bij oude voortgang dat de meting pas sinds de update loopt.

- Het gastdossier leidt voortgang af uit bestaande saves: alleen een geldige, volledig opgeloste zaak telt mee. Verder spelen opent een begonnen, onopgeloste zaak. Vier afrondingen met gevarieerde eigen teksten, ongeacht tijd, fouten of hulp. Geen snelheidsranglijst, verloren streak of puntenaftrek; waardering is onvoorwaardelijk. Reacties blijven per afgeronde zaak bewaard en wisselen tussen opeenvolgende afrondingen.

## Accountproef

Supabase Free-project `apmxwvxdldpfemwtaouq` staat in Frankfurt. Behoud de oude gastkeys; accountcaches zijn per gebruiker gescheiden. Importeer gastvoortgang alleen na een bewuste keuze. Gebruik RLS en voorwaardelijke updates met serverversies; los conflicten nooit stilletjes op met tijdstempels of de meeste ingevulde plekken. Publiceer de normale login pas nadat SMTP, Auth-terugkeeradressen en echte aanmeld-/herstelmails zijn gecontroleerd. Tot die tijd blijft publicLogin false en is de expliciete proef bereikbaar met accounts=preview. Auth-testantwoorden in browserchecks bewijzen geen echte mailbezorging. Zie ACCOUNTS.md voor status en stappen. Bundel een vastgezette Supabase-client lokaal en behoud de upstreamlicenties. Geen service_role-, SMTP- of Google-appwachtwoorden in de frontend of Git.

## Persoonlijke redeneerhulp en speurpunten

- Vier optionele hulpniveaus: algemeen zetje, kijkrichting, redeneerstap, expliciet uitgewerkte stap. Alleen de laatste mag de afgeleide plek tonen; nooit automatisch plaatsen of de dader noemen. Bij andere definitieve plaatsingen herberekenen, bij sluiten/herladen dezelfde hulpstap hervatten. Onmogelijke plaatsingen krijgen eerst een controletip.
- Bewaar geopende hulpniveaus en actieve tijd in het eigen dossier, zonder aparte analytics of beheerdersrapportage. Terugdraaien wist hulpgebruik of speeltijd niet. Een discreet hulpaanbod na drie actieve minuten zonder definitieve plaatsing onthult niets en kan vijf actieve minuten worden uitgesteld.
- Nieuwe afrondingen gebruiken scoreVersion 2: 600 vaste punten plus maximaal 400 zelfstandigheidsbonus. Per personage telt uitsluitend de hoogste geopende hulpdiepte: algemeen 0, kijkrichting 15%, redenering 45%, exacte plek 100% van diens gelijke aandeel in de bonus. Tijd en fouten kosten geen punten. Losse niveaupunten: 50 per ster boven de eerste. Bestaande afrondingen behouden hun oude score; een betere replay kan de bewaarde score verhogen, nooit verlagen. Dossiertotaal afleiden uit unieke geldige opgeloste zaken, inclusief oude voortgang; bewaar een gevalideerde voltooide kaart als bewijs zodat opnieuw beginnen verdiende punten behoudt; herhalen levert geen extra punten. Geen ranglijst of cijfer voor intelligentie.
- Een vrijblijvende aanbeveling verschijnt pas na minstens drie opgeloste zaken met nieuwe hulpregistratie binnen hetzelfde thema. Hulpgebruik bepaalt een vergelijkbaar niveau of een volgende uitdaging; tijd telt alleen mee bij zes geschikte recente zaken met drie eerdere vergelijkbare tijdmetingen. Noem dit een suggestie, geen gemeten vaardigheidsniveau. XXL blijft een bewuste keuze.

## Rustiger scherm voor ervaren spelers

Na 30 unieke, gevalideerde afrondingen in het eigen dossier (ook bewaarde afrondingen van opnieuw gestarte zaken) wordt de algemene startuitleg, het themavoorbeeld met voorwerpen en herhaalde beginnersinformatie bij de kaart standaard verborgen. Via Uitleg bekijken en Voorbeeld en voorwerpen bekijken kan de speler dit opnieuw openen. Spelregels, redeneerhulp, aanwijzingen, bijzondere kaartregels, zaakkeuze en downloads blijven bereikbaar. Geen voortgang wijzigen; voorkeur om uitleg tijdelijk te openen niet overdragen bij accountwissel. PDF's behouden hun introductie.

## Betaalde extra thema’s

Elk toekomstig extra thema krijgt één gedeelde code op een losse toegang-PDF. Activatie kan in Mijn account en bij de vergrendelde themakaart, uitsluitend voor aangemelde accounts. Eén code kan door meerdere kopers worden gebruikt; één recht per account/thema. Controle, rechten en betaalde puzzelinhoud staan achter serverautorisatie. Zet nooit codes, codehashes of betaalde puzzels in de openbare frontend. De bestaande vijf thema’s blijven gratis. Publiceer geen lege betaalde thema’s of verzonnen verkoopcodes. Zie BUNDLES.md voor uitgifte, codevervanging, accountproef en verificatie.
