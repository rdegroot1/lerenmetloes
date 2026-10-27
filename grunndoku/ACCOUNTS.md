# Accounts en synchronisatie

Gekozen op verzoek van de gebruiker: **Supabase**, een eigen **Free**-organisatie/project en aanmelden met **e-mail**. Gast spelen blijft zonder account werken. Verhuis de bestaande app niet alleen voor deze toevoeging: GitHub Pages kan de frontend blijven hosten.

## Status

Er is nog geen Supabase-project gekoppeld. De Supabase-plugin is aangeboden voor verbinding met het account van de eigenaar. Maak geen betaalde organisatie, abonnement, add-on of maildienst aan. Er is geen werkende accountfunctie in de huidige app; het speurdersdossier is lokale gastvoortgang.

## Uitwerking na koppelen

- Controleer de Free-organisatie en maak één project `grunndoku` in een beschikbare EU-regio. Bewaar geen databasewachtwoorden of beheersleutels in de frontend of Git.
- Gebruik Supabase Auth met bevestigde e-mail; de precieze inlogvorm (code of link) volgt de beschikbare mailconfiguratie. Configureer de echte app-URL en toegestane terugkeeradressen.
- Bewaar per gebruiker en zaak de bestaande spelstatus: plaatsingen, concepten, eerdere concepten, kruisen, afgevinkte hints, versie, afronding, reactie en speeltijd. Houd puzzel-ID’s stabiel.
- Beveilig alle voortgang met row-level security op de geverifieerde gebruikers-ID. Test met twee gebruikers dat niemand andermans dossier kan lezen of overschrijven.
- Bied na aanmelden expliciet aan om gastvoortgang mee te nemen. Meng geen voortgang van verschillende accounts via gedeelde browseropslag; bewaar een afzonderlijk lokaal gastdossier.
- Geef een duidelijke opslagstatus. Synchroniseer ook wissen en opnieuw beginnen, met serverversies/conflictdetectie. Bij gelijktijdige wijzigingen nooit stilletjes een andere tab of een ander apparaat overschrijven. Bewaar lokale wijzigingen bij verbindingsverlies en laat herstel/conflictkeuze zien.
- Test aanmelden, afmelden, herladen, offline verder spelen, twee apparaten, verlopen sessie, gewiste voortgang en overname van gastvoortgang. Geen fictief of lokaal nagebootst account als werkende login publiceren.

## Mail voor openbaar gebruik

De standaard SMTP-dienst van Supabase is alleen voor tests met teamadressen en heeft een zeer lage limiet. Voor aanmelden door gewone spelers is een eigen SMTP-provider of Send Email hook nodig. Bevestiging uitschakelen is geen oplossing voor openbaar gebruik. Configureer die mailvoorziening voordat aanmelden voor bezoekers wordt gepubliceerd; kies geen betaald abonnement zonder toestemming.

Bronnen gecontroleerd op 27 oktober 2026:

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/testing-auth-flows
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/free-project-pausing
