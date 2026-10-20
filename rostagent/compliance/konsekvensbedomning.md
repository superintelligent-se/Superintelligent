# Konsekvensbedömning (DPIA) – AI-intervjuer med medarbetare

Superintelligent Group AB · Version 2, 20 oktober 2026 · Ansvarig: Thomas Dalebring
Ses över innan första kunden, vid varje ändring av agent, leverantör eller modell, och minst en gång per år.

## 1. Varför en konsekvensbedömning görs

Art. 35 GDPR kräver en konsekvensbedömning när behandlingen sannolikt leder till hög risk. IMY:s förteckning och EDPB:s riktlinjer pekar ut två kriterier som träffar här:

- **Sårbara registrerade:** anställda står i beroendeställning till arbetsgivaren.
- **Ny teknik:** röstintervju genomförd av ett AI-system med klonad röst.

Två kriterier räcker för att en bedömning ska göras. Den görs därför, även om de skyddsåtgärder som beskrivs nedan sänker risken.

## 2. Beskrivning av behandlingen

| | |
|---|---|
| **Personuppgiftsansvarig** | Superintelligent Group AB. Kunden (arbetsgivaren) får bara aggregerade resultat per roll och är inte ansvarig för intervjuerna. |
| **Ändamål** | Kartlägga hur arbetstiden används per roll hos kunden, som underlag för fördjupad assessment, AI-roadmap och träningsupplägg. |
| **Registrerade** | Medarbetare hos kunden som väljer att delta. |
| **Uppgifter** | Röstinspelning, utskrift, strukturerad sammanfattning (23 fält, se `agent/datainsamling.md`), företag, roll, uppdragskod, personlig slumpkod, tidpunkt och längd, IP-adress hos ElevenLabs. E-postadress för inbjudan, lagrad separat och bara under intervjuperioden. Inget namn i samtalet. |
| **Känsliga uppgifter** | Efterfrågas inte. Kan nämnas spontant. Tas bort ur sammanställningen. Rösten behandlas inte för identifiering och är därför inte biometriska uppgifter enligt art. 4.14 och art. 9. |
| **Rättslig grund** | Berättigat intresse, art. 6.1 f. Se intresseavvägningen i avsnitt 4. |
| **Mottagare** | Superintelligents rådgivare. Kunden får aggregat per roll. |
| **Biträden** | ElevenLabs (agent, inspelning, utskrift, analys) med underbiträden, bland annat språkmodellsleverantören (för närvarande Anthropic). Microsoft 365 (lagring av hämtade utskrifter i OneDrive/SharePoint, utskick av inbjudningar via Outlook). Anthropic (Claude Code, där inbjudningar, status och sammanställning hanteras). |
| **Tredjeland** | USA via ElevenLabs och dess underbiträden. Stöd: EU-U.S. Data Privacy Framework eller standardavtalsklausuler, enligt ElevenLabs DPA avsnitt 11. EU data residency hos ElevenLabs är valt bort (kräver Enterprise). Kompenseras med kort lagring hos ElevenLabs och långtidslagring inom EU. |
| **Lagring** | Ljud 30 dagar (ElevenLabs). Utskrift och fält 60 dagar hos ElevenLabs, kopia i Microsoft 365 inom EU i högst 24 månader efter samtalet. E-post och kopplingen kod → e-post raderas när intervjuperioden är slut. Aggregat per roll följer kunduppdraget, högst 24 månader efter avslut. |

### Flöde

1. Kunden lämnar e-postadress och roll för de medarbetare som ska bjudas in, minst tio.
2. `lankar.mjs` ger varje person en personlig länk med en slumpkod. Kopplingen kod → e-post sparas bara i `data/<kund_id>/deltagare.json`.
3. Superintelligent skickar inbjudan med länk till informationen (`policy/ai-intervju.pdf`) och den personliga länken. Påminnelser går bara till den som inte genomfört intervjun.
4. Samtalet förs i ElevenLabs. Agenten informerar om AI, klonad röst, inspelning och frivillighet, och frågar om personen vill fortsätta.
5. ElevenLabs sparar ljud, utskrift och de 23 fälten.
6. `hamta-samtal.mjs` hämtar utskrift och fält till `rostagent/data/<kund_id>/` (gitignorerad, i OneDrive) och visar vem som inte har genomfört intervjun.
7. Efter sista dag: `hamta-samtal.mjs --avsluta` raderar e-postadresser och kopplingen kod → e-post.
8. Rådgivaren sammanställer per roll och tar bort identifierande citat. Roller med färre än tre deltagare slås ihop. Under tio genomförda intervjuer görs ingen sammanställning.
9. Kunden får sammanställningen i assessmentmötet.
10. Samtalen raderas i ElevenLabs efter 60 dagar och lokalt efter högst 24 månader.

## 3. Nödvändighet och proportionalitet

- **Behövs uppgifterna?** Ja. Tidsmätning per roll (MMM) kräver att medarbetarna själva beskriver sin dag. Ledningens skattning är det som ska jämföras mot.
- **Finns mindre ingripande alternativ?** Skriftlig enkät. Den ger tydligt sämre tidsdata, eftersom "beskriv gårdagen timme för timme" fungerar dåligt i formulär. Röst utan inspelning är inte möjligt, eftersom utskriften är själva underlaget. Ljudet behövs däremot inte länge, därför 30 dagar.
- **Uppgiftsminimering:** inget namn i samtalet, inga frågor om kunder eller enskilda affärer, inga känsliga frågor. E-postadressen ligger bara i deltagarfilen och raderas efter perioden.
- **Varför personliga länkar.** Med en länk per roll går det inte att veta om svarsfrekvensen räcker, påminnelser måste gå till alla, och samma person kan räknas två gånger. Personliga koder löser det. Risken är att Superintelligent under perioden kan koppla ett samtal till en person. Den hanteras genom att kopplingen bara finns hos oss, aldrig lämnas till kunden, inte används för något annat än påminnelser och dubblettkontroll, och raderas när perioden är slut.
- **Varför utskrifter i två år.** Steg 5 i kundresan gör om kartläggningen efter sex till tolv månader och jämför med utgångsläget. Det kräver de ursprungliga svaren per roll, inte bara sammanställningen. Efter att kopplingen raderats går utskriften inte att knyta till en person via oss. Kopian ligger i Microsoft 365 inom EU, och ElevenLabs-kopian i USA raderas efter 60 dagar.
- **Ändamålsbegränsning:** uppgifterna används inte för att bedöma enskilda, inte för marknadsföring och inte för att träna modeller. ElevenLabs träning på kunddata är avstängd (se KONFIGURATION.md avsnitt 0).

## 4. Intresseavvägning (art. 6.1 f)

**Berättigat intresse.** Kundens intresse av att förstå hur arbetet faktiskt ser ut för att kunna förbättra det, och Superintelligents intresse av att leverera uppdraget. Båda är legitima och konkreta.

**Nödvändighet.** Se avsnitt 3.

**Den registrerades intressen och förväntningar.** En medarbetare kan rimligen förvänta sig att arbetsgivaren kartlägger hur arbetet bedrivs. Det som skulle gå utöver förväntningarna är om svaren knöts till personen och användes för bedömning, eller om inspelningen sparades länge. Det förhindras genom:

- frivilligt deltagande, uttryckligen sagt i inbjudan, i informationen och av agenten,
- inget namn i samtalet, aggregering per roll med minst tre deltagare och minst tio per företag,
- kunden får inte veta vem som deltagit, och kopplingen kod → e-post raderas efter perioden,
- kunden får aldrig ljud eller utskrifter,
- kundens åtagande att inte försöka identifiera deltagare eller pressa någon att delta (`kundbilaga.md`),
- kort lagring,
- ingen bedömning av känslor, personlighet eller prestation.

**Samtycke valdes bort som grund.** I anställningsförhållanden är samtycke sällan frivilligt (EDPB 05/2020, p. 21). Klicket på länken är därför en bekräftelse på att personen tagit del av informationen och vill delta, inte ett samtycke i GDPR:s mening.

**Slutsats.** Med skyddsåtgärderna väger det berättigade intresset tyngre. Rätten att invända hanteras genom att den som inte vill delta låter bli, och att den som deltagit kan få sitt samtal raderat.

## 5. Risker och åtgärder

| Risk | Sannolikhet före | Åtgärd | Kvarstående |
|---|---|---|---|
| Arbetsgivaren identifierar vem som sagt vad | Medel | Aggregat per roll, tre-regeln, citat granskas, kunden får inga rådata | Låg |
| Medarbetaren känner sig tvingad att delta | Medel | Frivillighet i inbjudan och i samtalet, kundåtagande om att inte följa upp vem som deltagit, ingen individuell närvarorapport till kunden | Låg |
| Medarbetaren tror att det är Thomas som pratar | Medel | Sägs i första meningen, i informationen och i inbjudan. Utvärderingskriterium kontrollerar | Låg |
| Känslig information nämns spontant (hälsa, facket, kunders privatliv) | Medel | Agenten avbryter och leder vidare. Fälten instrueras att utelämna. Rådgivaren rensar | Låg |
| Inspelningen används för att träna ElevenLabs modeller | Hög om inget görs | Träning avstängd under Data use. Kontrolleras före första kund | Låg |
| Känsloigenkänning (förbjudet på arbetsplats, AI-förordningen art. 5.1 f) | Medel med Expressive mode | Expressive mode av. Attityd bara som självrapporterat svar i ord. Se `ai-forordningen.md` | Låg |
| Obehörig åtkomst till ElevenLabs-kontot | Låg | Tvåstegsinloggning, få användare, API-nyckel bara som miljövariabel | Låg |
| Data läcker via repot | Låg | `rostagent/data/` gitignorerad. API-nyckel i nyckelringen, aldrig i fil eller chatt | Låg |
| Anthropic tränar på e-postlistor och utskrifter som passerar Claude | Medel | Claude-kontot under kommersiella villkor (Team, Enterprise eller API), eller träning avstängd i Claudes inställningar under Privacy | Låg |
| Överföring till USA | Medel | DPF/SCC via ElevenLabs DPA. Informeras. Ljud 30 och utskrift 60 dagar hos ElevenLabs, långtidskopia inom EU | Medel |
| Länken sprids utanför kunden | Låg | Ingen åtkomst till andras samtal via länken. Dagligt samtalstak. Samtal med okänd kod rensas | Låg |
| Superintelligent kopplar svar till person | Medel | Kopplingen används bara för påminnelser och dubbletter, delas aldrig, raderas efter perioden med `--avsluta` | Låg |
| Kunden ber om att få veta vem som deltagit | Medel | Förbjudet i kundbilagan punkt 4.4. Vi svarar aldrig på frågan | Låg |
| Kunden använder resultatet för personalbeslut om enskilda | Låg | Aggregat, kundåtagande, uttryckligt förbud i kundbilagan | Låg |

**Samlad bedömning:** kvarstående risk är låg till medel, där tredjelandsöverföringen är den största. Förhandssamråd med IMY (art. 36) behövs inte.

## 6. Registerpost (art. 30)

| Fält | Innehåll |
|---|---|
| Behandling | AI-intervjuer med kunders medarbetare |
| Ansvarig | Superintelligent Group AB, 559213-4836, hello@superintelligent.se |
| Ändamål | Kartläggning av arbetstid per roll inför assessment |
| Kategorier av registrerade | Medarbetare hos kunder |
| Kategorier av uppgifter | Röst, utskrift, arbetsuppgifter och tid, verktyg, AI-användning, roll, tekniska uppgifter |
| Mottagare | Kunden (aggregat), ElevenLabs, Anthropic, Microsoft |
| Tredjeland | USA (DPF/SCC) |
| Gallring | Ljud 30 dagar. E-post och koppling vid periodens slut. Utskrift 60 dagar hos ElevenLabs, ≤ 24 månader i Microsoft 365 |
| Säkerhet | Åtkomst begränsad till rådgivare, tvåstegsinloggning, ingen data i git, kort lagring |

## 7. Beslut

Behandlingen får påbörjas när punkterna i README:s *Före första kunden* är bockade.

Godkänd av: ____________________ Datum: __________
