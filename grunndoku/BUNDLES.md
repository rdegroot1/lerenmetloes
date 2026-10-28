# Extra thema’s met een gedeelde toegangscode

Iedere toekomstige betaalde bundel krijgt een eigen, sterke gedeelde code. Alle kopers van dat thema ontvangen dezelfde code op een afzonderlijke toegang-PDF naast de puzzel-PDF bij Etsy. De code mag door meerdere accounts worden gebruikt. Activatie koppelt het thema aan het aangemelde account; opnieuw invoeren maakt geen dubbele aankoop. Hoofdletters, spaties en streepjes zijn niet van belang.

De vijf bestaande gratis thema’s blijven vrij. Er zijn nog geen echte betaalde bundels of verkoopcodes aangemaakt. De accountproef blijft gelden: openbare commerciële activatie pas na de echte Auth-/mailcontroles en het openen van publicLogin.

## In de app

- Mijn account bevat Extra thema activeren.
- Gepubliceerde extra thema’s staan apart op de homepage; vergrendelde kaarten hebben Toegangscode invoeren. Na activatie wordt dat Open dit thema.
- Als gast eerst aanmelden; een code wordt niet los op een apparaat geactiveerd.
- Een verkregen recht reist via Supabase mee naar andere apparaten. Verkeerde codes en verbindingsproblemen geven rustige meldingen.
- De catalogus wordt publiek opgehaald; alleen titel, beschrijving en aantal zaken worden vrijgegeven. Betaalde puzzels worden pas na accountcontrole opgehaald. Ze staan niet in GitHub of het publieke puzzles.json.
- Afmelden of van account wisselen verwijdert de geladen betaalde puzzels uit het actieve spel. Voortgang blijft gescheiden per account. Rechten worden niet uit localStorage vertrouwd.

## Server

Remote migratie: `grunndoku_shared_bundle_access`; snapshot in `supabase/bundle-schema.sql`.

- `public.grunndoku_bundles`: metadata, standaard niet gepubliceerd.
- `public.grunndoku_bundle_access`: alleen eigen rechten lezen, geen clientwijzigingen.
- `public.grunndoku_bundle_puzzles`: alleen lezen met een eigen recht op een gepubliceerd thema.
- `grunndoku_internal.bundle_codes`: één SHA-256-codehash per thema, geen clienttoegang; unieke hash voorkomt dezelfde code voor twee thema’s.
- `grunndoku_internal.bundle_attempts`: maximaal tien activatiepogingen per account per kwartier.
- `activate_grunndoku_bundle`: publieke security-invoker wrapper, alleen authenticated. De private, beperkt toegankelijke definerfunctie controleert de echte accountidentiteit en geeft een recht. Neemt geen user_id van de client aan en retourneert nooit een codehash.

De lege RLS-policyset op de twee interne tabellen is bewust deny-by-default. Schema-/tabelrechten verhinderen lezen; alleen de gecontroleerde definerfunctie heeft toegang. Geen extra rollen met bypassrls of sleutels in de frontend.

## Een bundel publiceren

1. Maak eigen puzzels, pas applyCast uit cast.mjs toe voor A/B/C-volgorde en slachtoffer Tammo, en valideer uniciteit, deductieve route en alle gebruikelijke kwaliteitsregels.
2. Gebruik een stabiel thema-ID `bundle-...` en unieke zaak-ID’s `bundle-...`. Elke JSON-zaak bevat dezelfde `seriesId` en `bundleId` als de bundel.
3. Maak metadata met enabled=false; plaats de JSON uitsluitend in de beveiligde tabel. Vul het werkelijke aantal zaken in.
4. Genereer lokaal een willekeurige code van minstens 16 tekens. Bewaar uitsluitend de SHA-256 van de genormaliseerde code in de interne codetabel. Geen werkelijke verkoopcodes in Git, frontend of openbare logs.
5. Maak de losse toegang-PDF met de themanaam, code, klikbare activatielink `?bundel=<thema-id>` en QR-code. De inhoud van de puzzel-PDF kan daarnaast direct via Etsy worden geleverd.
6. Controleer een echte activatie, een tweede koper met dezelfde code, een verkeerde code, een tweede apparaat en het blokkeren van niet-gekochte zaken. Controleer ook de Etsy-vermelding en Auth voordat het thema gepubliceerd wordt.
7. Zet enabled=true wanneer inhoud en verkoopbestanden gereed zijn.

Bij codevervanging alleen de hash vervangen. Bestaande rechten blijven behouden. Een code kan nooit betrouwbare kopieerbeveiliging bieden; het bewust aanvaarde risico is dat iemand hem doorgeeft. Toegang gebruikt het bestaande Supabase Free-project; geen Etsy-koppeling, nieuwe betaalprovider of betaald abonnement toegevoegd.

## Verificatie

`supabase/verify-bundles.sql` test met teruggerolde fixtures: gasten geweigerd, betaald materiaal afgeschermd, juiste code, verkeerde bundel, herhaalde activatie, tweede account met dezelfde code, geen directe rechtenwijzigingen, geen codehashlek, pogingslimiet en codevervanging zonder verlies van rechten. De browsercontrole gebruikt expliciete Auth/API-testantwoorden; die bewijst niet dat echte bevestigingsmails worden bezorgd.
