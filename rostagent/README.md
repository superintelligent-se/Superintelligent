# Röstagenten – intervjuer inför fördjupad assessment

En ElevenLabs-agent med Thomas klonade röst som intervjuar medarbetare i 15–20 minuter om hur arbetsdagen ser ut. Det är steg 1b i kundresan: efter att kunden sagt ja till assessment, före assessmentmötet, och en del av det betalda steg 2.

Agenten samlar in fakta (tid, friktion, verktyg). Rådgivaren tolkar. Mötestiden går då till tolkning och beslut i stället för datainsamling.

Agenten är generisk: samma agent och samma länk för alla företag och branscher. Den frågar själv vilket företag personen jobbar på, företagets webbadress och personens roll. Rollerna är spelets, utan storlek och bransch.

## Principer som inte får brytas

**Medarbetaren får aldrig analysen.** Samma princip som i spelet. Agenten ger inga råd, inga bedömningar, inga poäng och inga jämförelser. Frågar någon vad svaren betyder är svaret: "Det går rådgivaren igenom med er ledning."

**Agenten säger att den är en AI och att rösten är klonad.** Rösten är Thomas, men det är inte Thomas som pratar. Det ska sägas i första meningen, varje samtal.

**Rapportering per roll, aldrig per person.** Agenten frågar inte efter namn, och länken är densamma för alla. Ingen, inte heller vi, vet vem som har deltagit. Färre än tre genomförda i en rollgrupp slås ihop med närliggande grupp, och under tio genomförda per företag görs ingen sammanställning. Utan det svarar folk som de tror att chefen vill höra, särskilt på C3 (privata AI-konton) och B1 (energitjuvar).

**Inga grindar.** Vem som helst med länken kan göra intervjun. Länken bär ingen information, så den kan ligga på hemsidan, i ett mejl eller på ett intranät. Kopplingen till företaget görs i efterhand via webbadressen personen säger.

**Intervjudata committas aldrig.** Repot är publikt. `rostagent/data/` ligger i `.gitignore` och ska förbli där. API-nyckeln ligger i macOS nyckelring, aldrig i en fil eller i chatten.

**Börja med gårdagen, inte med en idealvecka.** Det är hela mätmetoden (MMM). En agent som frågar "hur ser en vanlig vecka ut?" får önsketänkande till svar.

## Mappen

```
rostagent/
  README.md               Den här filen
  KONFIGURATION.md        Steg för steg i ElevenLabs, fält för fält
  config.json             agent_id. Inte hemligt, det står i länken.
  agent/
    systemprompt.md       Klistras in i System prompt
    forsta-meddelande.md  Klistras in i First message
    datainsamling.md      25 fält till Analysis → Data collection
    utvardering.md        Kriterier till Analysis → Evaluation criteria
  kund/
    ny-omgang.mjs         Startar en omgång: period och antal inbjudna
    utskick.md            Mejl och påminnelse till medarbetarna
  scripts/
    hamta-samtal.mjs      Hämtar ett företags samtal och visar status
    kontrollera-agent.mjs Jämför agentens inställningar med den här mappen
  tester/
    testprotokoll.md      Det som ska provas innan en kund får länken
  compliance/
    konsekvensbedomning.md  DPIA, intresseavvägning, registerpost
    ai-forordningen.md      Bedömning enligt AI-förordningen
    kundbilaga.md           Bilaga till uppdragsavtalet
    rutiner.md              Checklistor, begäranden, incidenter
  data/                   Gitignorerad. En mapp per företag, namngiven efter domänen.
```

## Sanningskälla

Frågorna kommer från fliken *Agentfrågor per roll* i `Superintelligent_Fragepool_Kundresa_v0_1.xlsx`, men är nu generiska i stället för mäklarspecifika. Från och med nu är `agent/systemprompt.md` det agenten faktiskt säger. Ändras en fråga: ändra i systemprompten, klistra in i ElevenLabs, och uppdatera fliken *Frågepool* så att ID:na (A0–A4, R1–R7, B1–B4, C1–C5, D1–D3, Z1) fortsatt stämmer.

Rollerna kommer från `src/data/gameData.js`. Systemprompten och `datainsamling.md` har en kopia av listan, och `hamta-samtal.mjs` grupperar dem i fem rollgrupper (ledning, chef, it_data, hr, medarbetare) som styr block R. Läggs en roll till i spelet ska den in på alla tre ställena.

Fält-ID:na i `agent/datainsamling.md` är kontraktet mot Excel-filens MMM-flikar. Byter du namn på ett fält slutar `hamta-samtal.mjs` och all efterbearbetning att hitta det.

## Arbetsgång i chatten

Allt administreras i en Claude Code-session i det här repot. Det finns inget eget system. Thomas säger vad som ska göras, Claude kör skripten och skriver texterna.

| Thomas säger | Claude gör |
|---|---|
| **Ny intervjuomgång** för *Företag*, *webbadress*, sista dag *datum*, ungefär hur många per roll | Kör `ny-omgang.mjs` och fyller i `utskick.md` med datum, webbadress och länk, klart för kunden att skicka. Varnar om färre än tio är inbjudna. |
| **Status** *Företag* | Kör `hamta-samtal.mjs`: dag X av Y, genomförda per rollgrupp mot inbjudna, under tio-varning, samtal där agenten gav råd, och samtal som kan höra hit men har fel eller ingen webbadress. |
| **Påminn** *Företag* | Fyller i påminnelsen i `utskick.md` för kunden att skicka till alla. |
| **Koppla** *id* till *Företag* | Lägger samtalet i `inkludera` eller `exkludera` i `uppdrag.json` efter att Thomas lyssnat. |
| **Sammanställ** *Företag* | Fyller MMM per rollgrupp ur `sammanstallning.json` och utskrifterna, med tre- och tio-regeln, och granskar citat. |

**API-nyckeln** läggs en gång i macOS nyckelring. Kör i Terminal och klistra in nyckeln när du blir tillfrågad:

```bash
security add-generic-password -a "$USER" -s elevenlabs-api -w
```

Skripten för hand, om det behövs:

```bash
node rostagent/kund/ny-omgang.mjs <domän> "<Företag>" <ÅÅÅÅ-MM-DD> ledning=2 chef=3 medarbetare=12
node rostagent/scripts/hamta-samtal.mjs <domän>
node rostagent/scripts/kontrollera-agent.mjs
```

## Juridik

Publika dokument, på sajten under `/policy/`:

- `docs/policy/ai-intervju.html` → *Information om AI-intervjun*. Det medarbetarna läser innan de klickar. GDPR art. 13 och AI-förordningen art. 50.
- `docs/policy/integritetspolicy.html` har ett avsnitt om intervjuerna som hänvisar dit.

Interna dokument, i `compliance/`:

- `konsekvensbedomning.md`: DPIA, intresseavvägning och registerpost enligt art. 30.
- `ai-forordningen.md`: roll, förbudet mot känsloigenkänning, varför agenten inte är högrisk, transparenskraven.
- `kundbilaga.md`: bilaga till uppdragsavtalet. Kundens åtaganden, bland annat MBL och förbudet mot att bedöma enskilda.
- `rutiner.md`: checklista före första kund, per kund, begäran från medarbetare, incidenter.

Två saker bär hela upplägget. Ändras någon av dem måste dokumenten göras om:

1. **Superintelligent är personuppgiftsansvarig och kunden får bara aggregat per rollgrupp.** Det är det som gör löftet "din chef får inte veta vad du sagt" juridiskt hållbart, och det håller agenten utanför AI-förordningens högriskklass.
2. **Ingen känsloigenkänning.** Expressive mode ska vara av.

## Beslut som är tagna

- Superintelligent är personuppgiftsansvarig.
- Ljud raderas efter 30 dagar, så att Thomas kan lyssna när något är otydligt. Utskrifter sparas i högst 24 månader, hos ElevenLabs och som kopia i Microsoft 365, för jämförelsen i steg 5. ElevenLabs har bara en lagringstid, som raderar ljudet men lämnar utskriften, så gallringen av utskrifter gör vi själva.
- Ingen EU-lagring hos ElevenLabs (kräver Enterprise). Kompenseras med kort lagring där.
- Språkmodell GPT-6 Luna, vilket gör OpenAI till underbiträde via ElevenLabs.
- En generisk agent och en länk för alla. Inga dynamiska variabler, inga personliga länkar. Företag, webbadress och roll frågas i samtalet.
- Spelets roller, utan storlek och bransch.
- Minst tio genomförda per företag.
- Allt administreras i chatten.
- Compliance-dokumenten får ligga i det publika repot.

## Öppet

- **Samtal från personer vars arbetsgivare inte är kund.** Eftersom vem som helst kan göra intervjun kommer det sådana. Nu används de inte och raderas inom 90 dagar, i den månatliga gallringen i `compliance/rutiner.md`. Vill Thomas använda dem, till exempel som anonym jämförelsedata per bransch, måste informationen och konsekvensbedömningen ändras först.
- **Juridisk granskning.** Dokumenten är skrivna mot GDPR, IMY:s och EDPB:s vägledning och AI-förordningen, men ingen jurist har läst dem.
