# Röstagenten – intervjuer inför fördjupad assessment

En ElevenLabs-agent med Thomas klonade röst som intervjuar medarbetare i 15–20 minuter om hur arbetsdagen ser ut. Det är steg 1b i kundresan: efter att kunden sagt ja till assessment, före assessmentmötet, och en del av det betalda steg 2.

Agenten samlar in fakta (tid, friktion, verktyg). Rådgivaren tolkar. Mötestiden går då till tolkning och beslut i stället för datainsamling.

## Principer som inte får brytas

**Medarbetaren får aldrig analysen.** Samma princip som i spelet. Agenten ger inga råd, inga bedömningar, inga poäng och inga jämförelser. Frågar någon vad svaren betyder är svaret: "Det går rådgivaren igenom med er ledning."

**Agenten säger att den är en AI och att rösten är klonad.** Rösten är Thomas, men det är inte Thomas som pratar. Det ska sägas i första meningen, varje samtal.

**Rapportering per roll, aldrig per person.** Agenten frågar inte efter namn. Varje medarbetare får en personlig länk med en slumpkod, så att vi ser vem som har svarat och bara påminner de andra. Kopplingen kod → e-post finns bara hos oss, lämnas aldrig till kunden och raderas när perioden är slut. Färre än tre intervjuer i en roll slås ihop med närliggande roll, och under tio genomförda per företag görs ingen sammanställning. Utan det svarar folk som de tror att chefen vill höra, särskilt på C3 (privata AI-konton) och B1 (energitjuvar).

**Intervjudata committas aldrig.** Repot publiceras till GitHub Pages. `rostagent/data/` ligger i `.gitignore` och ska förbli där. API-nyckeln bor i miljövariabeln `ELEVENLABS_API_KEY`, aldrig i en fil.

**Börja med gårdagen, inte med en idealvecka.** Det är hela mätmetoden (MMM). En agent som frågar "hur ser en vanlig vecka ut?" får önsketänkande till svar.

## Mappen

```
rostagent/
  README.md               Den här filen
  KONFIGURATION.md        Steg för steg i ElevenLabs, fält för fält
  agent/
    systemprompt.md       Klistras in i System prompt
    forsta-meddelande.md  Klistras in i First message
    datainsamling.md      23 fält till Analysis → Data collection
    utvardering.md        Kriterier till Analysis → Evaluation criteria
  kund/
    lankar.mjs            Personliga länkar från en mottagarlista
    utskick.md            Mejlmall till medarbetarna
  scripts/
    hamta-samtal.mjs      Hämtar svar, visar status, avslutar perioden
  tester/
    testprotokoll.md      Det som ska provas innan en kund får länken
  compliance/
    konsekvensbedomning.md  DPIA, intresseavvägning, registerpost
    ai-forordningen.md      Bedömning enligt AI-förordningen
    kundbilaga.md           Bilaga till uppdragsavtalet
    rutiner.md              Checklistor, begäranden, incidenter
  data/                   Gitignorerad. En mapp per kund.
```

## Sanningskälla

Frågorna kommer från fliken *Agentfrågor per roll* i `Superintelligent_Fragepool_Kundresa_v0_1.xlsx`. Från och med nu är `agent/systemprompt.md` det agenten faktiskt säger. Ändras en fråga: ändra i systemprompten, klistra in i ElevenLabs, och uppdatera fliken *Frågepool* så att ID:na (A0–A4, R1–R7, B1–B4, C1–C5, D1–D3, Z1) fortsatt stämmer.

Fält-ID:na i `agent/datainsamling.md` är kontraktet mot Excel-filens MMM-flikar. Byter du namn på ett fält slutar `hamta-samtal.mjs` och all efterbearbetning att hitta det.

## Arbetsgång i chatten

Allt administreras i en Claude Code-session i det här repot. Det finns inget eget system. Thomas säger vad som ska göras, Claude kör skripten och skriver utkasten.

| Thomas säger | Claude gör |
|---|---|
| **Ny intervjuomgång** för *Företag*, sista dag *datum*, och klistrar in eller bifogar e-post och roll | Väljer ett `kund_id`, skriver listan till `data/<kund_id>/mottagare.csv`, kör `lankar.mjs`, kontrollerar minst tio inbjudna och minst tre per roll, och lägger ett mejlutkast per person i Outlook med texten i `kund/utskick.md`. Raderar `mottagare.csv`. |
| **Status** *Företag* | Kör `hamta-samtal.mjs`: dag X av Y, genomförda per roll mot inbjudna, under tio-varning, samtal där agenten gav råd. |
| **Påminn** *Företag* | Mejlutkast bara till dem i `paminnelser.json`. Skilj på dem som inte börjat och dem som avbröt. |
| **Avsluta** *Företag* | Hämtar en sista gång och kör `--avsluta`, som raderar e-postadresserna och kopplingen kod → e-post. |
| **Sammanställ** *Företag* | Fyller MMM per roll ur `sammanstallning.json` och utskrifterna, med tre- och tio-regeln, och granskar citat. |

Mejlen skickas från Thomas Outlook som utkast. Byt avsändare till hello@ innan du skickar, eller be Claude skicka efter att du godkänt listan.

**API-nyckeln** läggs en gång i macOS nyckelring, så att den aldrig hamnar i en fil eller i chatten. Kör i Terminal och klistra in nyckeln när du blir tillfrågad:

```bash
security add-generic-password -a "$USER" -s elevenlabs-api -w
```

Skript för hand, om det behövs:

```bash
node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företag>" <ÅÅÅÅ-MM-DD> <mottagare.csv>
node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>
node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id> --avsluta
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

1. **Superintelligent är personuppgiftsansvarig och kunden får bara aggregat per roll.** Det är det som gör löftet "din chef får inte veta vad du sagt" juridiskt hållbart, och det håller agenten utanför AI-förordningens högriskklass.
2. **Ingen känsloigenkänning.** Expressive mode ska vara av.

## Beslut som är tagna

- Superintelligent är personuppgiftsansvarig.
- Ljud sparas 30 dagar hos ElevenLabs. Utskrifter 60 dagar hos ElevenLabs och högst 24 månader i Microsoft 365, för jämförelsen i steg 5.
- Ingen EU-lagring hos ElevenLabs (kräver Enterprise). Kompenseras med kort lagring där.
- Personliga länkar med slumpkod, minst tio genomförda per företag.
- Allt administreras i chatten.
- Compliance-dokumenten får ligga i det publika repot.

## Öppet

- **Juridisk granskning.** Dokumenten är skrivna mot GDPR, IMY:s och EDPB:s vägledning och AI-förordningen, men ingen jurist har läst dem.
- **Andra branscher än mäklare.** R-blocket finns bara för mäklarroller. `roll=annan` kör A, B, C och D utan rollfrågor.
