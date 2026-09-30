# Röstagenten – intervjuer inför fördjupad assessment

En ElevenLabs-agent med Thomas klonade röst som intervjuar medarbetare i 15–20 minuter om hur arbetsdagen ser ut. Det är steg 1b i kundresan: efter att kunden sagt ja till assessment, före assessmentmötet, och en del av det betalda steg 2.

Agenten samlar in fakta (tid, friktion, verktyg). Rådgivaren tolkar. Mötestiden går då till tolkning och beslut i stället för datainsamling.

## Principer som inte får brytas

**Medarbetaren får aldrig analysen.** Samma princip som i spelet. Agenten ger inga råd, inga bedömningar, inga poäng och inga jämförelser. Frågar någon vad svaren betyder är svaret: "Det går rådgivaren igenom med er ledning."

**Agenten säger att den är en AI och att rösten är klonad.** Rösten är Thomas, men det är inte Thomas som pratar. Det ska sägas i första meningen, varje samtal.

**Rapportering per roll, aldrig per person.** Länken är densamma för alla i en roll och innehåller inget namn. Agenten frågar inte efter namn. Färre än tre intervjuer i en roll slås ihop med närliggande roll innan något visas för kunden. Utan det svarar folk som de tror att chefen vill höra, särskilt på C3 (privata AI-konton) och B1 (energitjuvar).

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
    lankar.mjs            Skriver ut en länk per roll för en kund
    utskick.md            Mejlmall till medarbetarna
  scripts/
    hamta-samtal.mjs      Hämtar utskrifter och svar via API till data/
  tester/
    testprotokoll.md      Det som ska provas innan en kund får länken
  data/                   Gitignorerad. En mapp per kund.
```

## Sanningskälla

Frågorna kommer från fliken *Agentfrågor per roll* i `Superintelligent_Fragepool_Kundresa_v0_1.xlsx`. Från och med nu är `agent/systemprompt.md` det agenten faktiskt säger. Ändras en fråga: ändra i systemprompten, klistra in i ElevenLabs, och uppdatera fliken *Frågepool* så att ID:na (A0–A4, R1–R7, B1–B4, C1–C5, D1–D3, Z1) fortsatt stämmer.

Fält-ID:na i `agent/datainsamling.md` är kontraktet mot Excel-filens MMM-flikar. Byter du namn på ett fält slutar `hamta-samtal.mjs` och all efterbearbetning att hitta det.

## Arbetsgång per kund

1. Bestäm ett `kund_id` utan personuppgifter, till exempel `sf-lund-2026-10`.
2. `node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>"` ger en länk per roll.
3. Kontaktpersonen hos kunden skickar länkarna med texten i `kund/utskick.md`. Det ska komma från kunden, inte från oss, så att medarbetarna vet att det är sanktionerat.
4. Efter sista svarsdag: `node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>`.
5. Fyll MMM Calculator per roll ur `data/<kund_id>/`. Kontrollera antal per roll mot tre-regeln.
6. Radera kundens samtal i ElevenLabs när assessmenten är levererad, eller låt retention göra det.

## Öppet, kräver beslut av Thomas

- **Personuppgiftsansvar.** Röstinspelningar är personuppgifter. Vem är ansvarig, kunden eller Superintelligent? Det avgör om det behövs ett biträdesavtal med kunden. Biträdesavtal (DPA) med ElevenLabs behövs oavsett.
- **Ljud eller bara text.** Förslaget i KONFIGURATION.md är ljud i 30 dagar och utskrift i 180. Räcker utskriften, stäng av ljudet helt.
- **EU-lagring.** ElevenLabs EU data residency är ett Enterprise-tillval. Utan det behandlas datan även utanför EU. Det ska stå i informationen till medarbetarna och i integritetspolicyn.
- **Integritetspolicyn** (`docs/policy/integritetspolicy.html`) nämner inte röstintervjuer. Den behöver ett stycke innan första kunden.
- **Andra branscher än mäklare.** R-blocket finns bara för mäklarroller. `roll=annan` kör A, B, C och D utan rollfrågor.
