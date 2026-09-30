# Konfigurera agenten i ElevenLabs

Skriven mot ElevenLabs dokumentation per 2026-09-30, inte mot ditt konto. Flikar och etiketter flyttas ibland mellan versioner. Hittar du inte en inställning där det står, sök på namnet i agentens inställningar. Värdena gäller oavsett var fältet ligger.

Räkna med 45 minuter första gången.

## 0. Innan du börjar

- **Rösten.** Kontrollera under Voices att din klon ligger under My Voices och inte har "live moderation" påslaget. Sådana röster går inte att använda i agenter. En Professional Voice Clone tränad på svenska låter klart bättre på svenska än en Instant Clone tränad på engelska. Är din klon gjord på engelskt tal: testa först, och spela in en svensk om den bryter.
- **Biträdesavtal.** Hämta ElevenLabs DPA under kontots inställningar innan första riktiga samtalet.

## 1. Skapa agenten

1. Gå till **ElevenLabs → Agents → + New agent → Blank agent**.
2. Namn: `Superintelligent – Assessmentintervju`.
3. Skapa.

## 2. Fliken Agent

| Inställning | Värde |
|---|---|
| **Agent language** | Swedish |
| **Additional languages** | Inga. Lägg till English först när en kund behöver det. |
| **First message** | Texten under strecket i `agent/forsta-meddelande.md` |
| **System prompt** | Allt under strecket i `agent/systemprompt.md` |
| **Dynamic variables** | Skapas automatiskt när `{{foretag}}` och `{{roll}}` finns i texten. Lägg till `kund_id` för hand. Sätt testvärden: `foretag` = `Testkontoret`, `roll` = `annan`, `kund_id` = `test`. |
| **LLM** | Claude Sonnet 4.6. Snabbare och billigare alternativ: Gemini 2.5 Flash. |
| **Temperature** | 0,3 |
| **Backup LLM** | Default |
| **Knowledge base** | Tom. Agenten ska inte kunna svara på frågor om AI. |
| **Tools** | Bara systemverktyget **End call**. Det brukar vara påslaget från början. Stäng av Language detection, Transfer och Skip turn. |

Om modellvalet: intervjun har många villkor (roll, hoppa över, max en följdfråga, aldrig råd). En liten modell tappar dem efter tio minuter. Börja med Sonnet och byt bara om fördröjningen stör i test. Med EU data residency påslaget är vissa modeller inte valbara.

Om testvärdena: de används bara i förhandsvisningen. Öppnas den publika länken utan `var_foretag` kan samtalet vägra starta. Det provas i testprotokollet, punkt 12.

## 3. Fliken Voice

| Inställning | Värde |
|---|---|
| **Voice** | Din klon |
| **TTS model** | Eleven Turbo v2.5. Svenska kräver en v2.5- eller v3-modell. Flash v2.5 är snabbare men något plattare. |
| **Expressive mode (v3 Conversational)** | Av till att börja med. Prova som eget test, den ändrar både röst och turtagning. |
| **Stability** | 0,50 |
| **Similarity** | 0,80 |
| **Speed** | 0,95. Intervallet är 0,7–1,2. Något under 1,0 ger en lugnare intervjuare. |
| **Pronunciation dictionary** | Lägg till efter första testet, för ord som blir fel: Vitec, Mspecs, Hemnet, Superintelligent. |

## 4. Fliken Analysis

1. **Evaluation criteria**: lägg in de fem raderna i `agent/utvardering.md`.
2. **Data collection**: lägg in de 23 fälten i `agent/datainsamling.md`. Identifier exakt som i filen.
3. **Analysis language**, om fältet finns: Swedish.

Det är det här som gör svaren sökbara i stället för 20 minuter ljud per person.

## 5. Fliken Advanced

| Inställning | Värde | Varför |
|---|---|---|
| **Max conversation duration** | 1800 sekunder | Standard är 600. Med den bryts intervjun efter tio minuter, mitt i block B. |
| **Turn timeout** (Take turn after silence) | 20 sekunder | Folk behöver tänka när de ska minnas gårdagen. |
| **Turn eagerness** | Patient | Annars avbryter agenten i tankepauser. |
| **Soft timeout** | 3,0 sekunder, meddelande `Mm.` | Fyller tystnaden om språkmodellen dröjer. |
| **Interruptions** | På | Personen ska kunna avbryta en lång fråga. |
| **Silence end call timeout** | 60 sekunder eller av | Så att en glömd flik inte kostar 30 minuter. |
| **Keywords** (ASR), om fältet finns | Vitec, Mspecs, Hemnet, Booli, intag, värdering, Copilot, ChatGPT | Förbättrar utskriften av branschord. |

### Data Retention och ljud

| Inställning | Värde |
|---|---|
| **Store call audio** | På |
| **Audio retention** | 30 dagar |
| **Conversation (transcript) retention** | 180 dagar |

Standard är två år, vilket är svårt att motivera för intervjuer med anställda. Ändrar du siffrorna: ändra även i `kund/utskick.md`. Räcker utskriften, stäng av ljudet. Se Öppet i README.

Zero Retention Mode ska vara **av**. Med det påslaget sparas ingenting, och då finns inga svar att hämta.

## 6. Fliken Security

| Inställning | Värde | Varför |
|---|---|---|
| **Enable authentication** | Av | Den publika länken fungerar så vitt jag kan utläsa bara för en publik agent. Dokumentationen säger inte uttryckligen vad som händer med länken när autentisering slås på. |
| **Allowlist** | Tom | Gäller inbäddning på egen sajt. |
| **Enable overrides** | Allt av | Annars kan den som ändrar länken byta systemprompt, röst eller första meddelande. Dynamiska variabler räcker. |
| **Daily call limit / Concurrency**, om de finns | 100 per dag, 5 samtidiga | Länken är öppen. Det här är taket för vad en spridd länk kan kosta. |

Eftersom agenten är publik kan vem som helst med länken prata med den. Det är en kostnadsrisk, inte en datarisk: länken ger ingen åtkomst till andras samtal.

## 7. Fliken Widget

| Inställning | Värde |
|---|---|
| **Interface → Input** | Voice only |
| **Feedback collection** | None |
| **Terms and conditions** | På, med texten nedan. Kontrollera i test att den visas på den delade sidan och inte bara i den inbäddade widgeten. |
| **Shareable page → Description** | `Ett samtal på ungefär 15 minuter om hur din arbetsdag ser ut. Du pratar med en AI.` |

Text till Terms:

```
Du pratar med en AI från Superintelligent. Rösten är en AI-kopia av Thomas Dalebrings röst.

Samtalet spelas in och skrivs ut. Svaren sammanställs per roll, inte per person. Ljudet raderas efter 30 dagar och utskriften senast efter 180 dagar. Tekniken levereras av ElevenLabs.

Säg inga namn på kunder. Du kan avbryta när du vill.
```

## 8. Hämta länken

1. Klicka **Publish** om agenten har opublicerade ändringar.
2. Agent-ID står under agentens namn, eller i adressfältet: `agent_...`.
3. Bygg länkarna:

```bash
node rostagent/kund/lankar.mjs <agent_id> <kund_id> "<Företagsnamn>"
```

En länk ser ut så här:

```
https://elevenlabs.io/app/talk-to?agent_id=agent_XXXX&var_foretag=Testkontoret&var_roll=maklare&var_kund_id=test
```

`var_`-prefixet gör att ElevenLabs läser parametern som en dynamisk variabel. `foretag` och `roll` går in i prompten. `kund_id` används aldrig i prompten men sparas på samtalet, och det är det `hamta-samtal.mjs` filtrerar på.

## 9. Testa

Kör `tester/testprotokoll.md` innan någon kund får en länk.

## 10. Hämta svaren

Svaren finns på tre ställen:

- **I gränssnittet**: Agents → agenten → Conversations. Varje samtal har ljud, utskrift, de 23 fälten och utvärderingen.
- **Via skriptet**: skapa en API-nyckel (Developers → API keys) med läsrätt till ElevenAgents.

```bash
ELEVENLABS_API_KEY=... node rostagent/scripts/hamta-samtal.mjs <agent_id> <kund_id>
```

- **Via webhook**, senare: Agents → Settings → Post-call webhook skickar varje avslutat samtal till en adress, till exempel ett Power Automate-flöde som lägger svaren i kundens Planner-kort. Bygg det först när flödet för hand fungerar. Webhooken stängs av automatiskt efter tio misslyckade leveranser i rad, och den signeras med HMAC i rubriken `ElevenLabs-Signature`, som flödet måste kontrollera eftersom adressen annars tar emot vad som helst.

## Kostnad

Agentsamtal debiteras per minut ur abonnemanget, plus språkmodellens kostnad. En intervju är 15–20 minuter. Tio medarbetare är alltså runt tre timmar samtalstid. Kontrollera minutpriset på din plan under Subscription innan du prissätter steg 2.
