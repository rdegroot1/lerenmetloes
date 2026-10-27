# Accounts en synchronisatie

## Ingericht op 27 oktober 2026

- Supabase-organisatie **Grunndoku**, ID `qchckfhqtfllgljgkglw`, geverifieerd **Free**.
- Project **grunndoku**, ID `apmxwvxdldpfemwtaouq`, Frankfurt (`eu-central-1`). De creatiequote was **$0 per maand**. Geen betaalde abonnementen of add-ons aangezet.
- Tabel `public.grunndoku_progress` met afzonderlijke voortgang per gebruikers-ID en zaak. RLS op lezen, invoegen en wijzigen; gasten hebben geen tabelrechten. De server beheert de versie en het wijzigingstijdstip.
- Remote migratie `20261027135252 / create_grunndoku_progress` via de Supabase-koppeling. `supabase/schema.sql` is de bijbehorende beoordeelde schema-snapshot, geen lokaal gegenereerde CLI-migratie. De CLI kon in deze omgeving zijn configuratiemap niet aanmaken; er is geen databasewachtwoord of beheercredential in Git gezet.
- Supabase-browserclient `2.118.0`, exact vastgezet en lokaal gebundeld. Alleen de publishable key staat in auth-config.js. Licenties: vendor/LICENSES.txt.

## Wat de app doet

- Gastvoortgang behoudt `grunmurdoku:v1:<zaak>`. Accounts krijgen een afzonderlijke lokale cache per gebruikers-ID; afmelden herstelt het gastdossier. Verschillende accounts mengen geen voortgang.
- Aanmelden, registreren, bevestiging en wachtwoordherstel gebruiken de echte Supabase Auth-client. Geen lokaal nagebootste accountfunctie in productiecode.
- Aanmelden importeert gastvoortgang niet automatisch. De speler kiest dit zelf; bestaande accountvoortgang wordt niet stil overschreven.
- Alle plaatsingen, concepten, eerdere concepten, kruisen, afvinkingen, afrondingen, reacties en gemeten speeltijd worden als één zaakstatus bewaard. Niveaubeoordelingen worden uit de cloudpayload verwijderd en blijven lokaal tot een bewuste export.
- Wijzigen gebruikt de gelezen serverversie als voorwaarde. Bij gelijktijdige wijzigingen blijven beide versies beschikbaar totdat de speler kiest. Ook opnieuw beginnen gaat via deze versiecontrole.
- Verbinding weg: lokale accountwijzigingen blijven in de aparte cache staan. Bij herstel probeert de app opnieuw. Een verlopen sessie moet opnieuw worden aangemeld; de cache wordt daarbij niet verwijderd.
- Opslagstatus en een download van het huidige dossier zijn beschikbaar in het accountvenster. Exports bevatten geen sessietokens of sleutels.

## Nog nodig vóór openbare accounts

`AUTH_CONFIG.publicLogin` blijft **false**. De accountproef is bereikbaar via `?accounts=preview`. Dit is een zichtbare proefstand, geen toegangsbeveiliging. De gebruikelijke gast-app blijft beschikbaar. Zet de openbare knop pas aan na echte tests van aanmelden en mailbezorging.

### 1. Gmail instellen voor een eerste kleine proef

De gebruiker heeft Gmail en nog geen eigen domein. Gebruik, indien het Google-account dit ondersteunt, een Google-appwachtwoord voor SMTP. Daarvoor moet tweestapsverificatie aanstaan. Vul het appwachtwoord rechtstreeks in de Supabase-instellingen in, niet in Git of de chat.

- Google-appwachtwoord: https://myaccount.google.com/apppasswords
- Supabase SMTP: https://supabase.com/dashboard/project/apmxwvxdldpfemwtaouq/auth/smtp
- Enable custom SMTP: aan.
- Sender email: je eigen volledige Gmail-adres.
- Sender name: `Grunndoku`.
- Host: `smtp.gmail.com`.
- Port: `587` (STARTTLS).
- Username: hetzelfde volledige Gmail-adres.
- Password: het Google-appwachtwoord.

Gmail heeft verzendlimieten en is bedoeld als eerste kleinschalige proef; dit is geen belofte van onbeperkte gratis mail of een grote publieke lancering. Sommige Google-accounts ondersteunen geen appwachtwoorden. Verlaag de e-mailbevestiging niet als oplossing voor verzendproblemen.

### 2. Terugkeeradressen

In https://supabase.com/dashboard/project/apmxwvxdldpfemwtaouq/auth/url-configuration:

- Site URL: `https://rdegroot1.github.io/lerenmetloes/grunndoku/`.
- Redirect URLs: dezelfde URL en `https://rdegroot1.github.io/lerenmetloes/grunndoku/?reset-password=1`.
- E-mailbevestiging blijft ingeschakeld.

De Supabase-koppeling biedt hier geen functie om SMTP of Auth-URL-configuratie te wijzigen. Daarom is dit nog een handmatige dashboardstap.

### 3. Echte integratietest

De ontwikkelomgeving blokkeert een directe HTTPS-verbinding met `apmxwvxdldpfemwtaouq.supabase.co` (CONNECT-proxy geeft 403). Voeg dit exacte domein via de ondersteunde omgevingsconfiguratie toe aan toegestane netwerkhosts; wijzig of omzeil de proxy niet. Daarna testen: echte registratie en bevestiging, aanmelden op twee apparaten, herstelmail, verlopen sessie, offline wijzigingen, afmelden en accountwissel.

## Uitgevoerde controles

- 266 automatische tests, inclusief aparte accountcaches, import, netwerkuitval, versieconflicten tussen apparaten en tabs, bewerkingen tijdens upload en sessiewissels.
- Op de **echte database** getest met twee tijdelijke gebruikersidentiteiten: alleen eigen rijen lezen/schrijven, andere gebruiker niet invoegen, eigendom/versie niet vervalsen, oude versie niet overschrijven en geen toegang als gast. Alles teruggedraaid; nul testgebruikers achtergebleven. Script: `supabase/verify-rls.sql`.
- Supabase security- en performance-advisors: geen meldingen.
- Lokale browsercontrole: bestaande puzzelbediening, groot/klein, snel dubbelklikken/aanraken, derde klik, zoom, archief en dossier blijven werken.
- Accountinterface in de browser getest met expliciete Auth/Data API-testantwoorden: scheiding gast/account, import, conflictkeuze, afmelden, herladen, mobiel en herstelcallback. Dit bewijst **geen echte aanmelding of mailbezorging**.

## Bronnen

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://support.google.com/mail/answer/185833
- https://developers.google.com/workspace/gmail/imap/imap-smtp
- https://supabase.com/docs/guides/platform/free-project-pausing
