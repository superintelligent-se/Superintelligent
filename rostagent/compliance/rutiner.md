# Rutiner för AI-intervjuerna

Det som ska göras, av vem och när. Kort med flit.

## Före första kunden (en gång)

- [ ] ElevenLabs: **Data use → stäng av träning på våra data.** Ta en skärmdump och lägg den i OneDrive.
- [ ] ElevenLabs: läs DPA (elevenlabs.io/dpa) och underbiträdeslistan (compliance.elevenlabs.io). Spara en kopia med datum.
- [ ] ElevenLabs: tvåstegsinloggning på kontot.
- [ ] Claude: kontot som används här ska antingen ligga under kommersiella villkor (Team, Enterprise eller API) eller ha *Help improve Claude* avstängt under Settings → Privacy. Annars får Anthropic träna på e-postlistor och utskrifter.
- [ ] ElevenLabs API-nyckel i nyckelringen (se README, *Arbetsgång i chatten*).
- [ ] Agenten: Expressive mode av, retention ljud 30 / utskrift 60 dagar, Zero Retention av, overrides av, dynamisk variabel `deltagare` finns.
- [ ] Konsekvensbedömningen och AI-bedömningen godkända och daterade.
- [ ] Integritetspolicy, cookiepolicy, användarvillkor och Information om AI-intervjun publicerade på sajten.
- [ ] Alla som läser intervjuresultat har läst `ai-forordningen.md` avsnitt 5. Datum och namn nedan.

## Per kund

| När | Vad | Vem |
|---|---|---|
| Vid avtal | Kundbilagan med i avtalet. Kunden bekräftar MBL-information/förhandling. | Rådgivaren |
| Före utskick | Kunden har informerat medarbetarna och facket. Minst tio inbjudna. Personliga länkar skapade med eget `kund_id`. | Rådgivaren |
| Under perioden | Status och påminnelser enligt arbetsgången i README. Läs `inga_rad` på nya samtal. Ett samtal med failure läses i sin helhet och agenten justeras. | Rådgivaren |
| Efter sista dag | Hämta samtal en sista gång, sedan `--avsluta`. Det raderar e-postadresser och kopplingen kod → e-post. Senast inom en vecka. | Rådgivaren |
| Vid sammanställning | Minst tio genomförda. Tre-regeln per roll. Citat granskas. Känsliga uppgifter och namn rensas. | Rådgivaren |
| Dag 60 | ElevenLabs raderar utskrifterna. Kontrollera att den lokala kopian är komplett innan dess. | Rådgivaren |
| Efter 24 månader | Radera `rostagent/data/<kund_id>/` utom aggregatet. | Thomas |

## Begäran från en medarbetare

1. Svara inom en månad. Börja med en bekräftelse samma vecka.
2. Hitta samtalet. Under perioden: via e-postadressen i `deltagare.json` och koden. Efter perioden: via dag, ungefärlig tid och roll (filtrera på `kund_id` och `roll`).
3. **Radering:** radera i ElevenLabs och lokalt. Har aggregatet redan levererats behöver det inte göras om, eftersom det inte innehåller uppgifter om personen.
4. **Tillgång:** skicka utskriften. Ljudet bara om personen ber om det och det finns kvar.
5. Hittar vi inte samtalet: säg det och förklara varför (art. 11).
6. Berätta aldrig för kunden att någon har hört av sig, och aldrig vem som har deltagit.

## Personuppgiftsincident

Till exempel: fel person fick en utskrift, kontot har blivit kapat, data har hamnat i repot.

1. Stoppa läckan. Byt API-nyckel och lösenord.
2. Dokumentera vad, när, hur många och vilka uppgifter, samma dag.
3. **Anmäl till IMY inom 72 timmar** om det inte är osannolikt att incidenten medför risk (imy.se → Anmäl personuppgiftsincident).
4. Informera de drabbade om risken är hög. Saknas namn: via kunden, med en text vi skriver.
5. Lägg in händelsen i loggen nedan, även om den inte anmäldes.

Har data hamnat i git: att ta bort filen räcker inte. Historiken måste skrivas om och GitHub kontaktas för att rensa cachade vyer.

## Logg

| Datum | Händelse | Åtgärd | Av |
|---|---|---|---|
| | | | |

## Genomgång av AI-kunnighet

| Datum | Namn | Gick igenom |
|---|---|---|
| | | |
