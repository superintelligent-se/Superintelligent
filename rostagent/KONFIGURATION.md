# Konfigurera agenten i ElevenLabs

Skriven mot ElevenLabs dokumentation per 2026-09-30, inte mot ditt konto. Flikar och etiketter flyttas ibland mellan versioner. Hittar du inte en inställning där det står, sök på namnet i agentens inställningar. Värdena gäller oavsett var fältet ligger.

Räkna med 45 minuter första gången.

## 0. Innan du börjar

- **Rösten.** Kontrollera under Voices att din klon ligger under My Voices och inte har "live moderation" påslaget. Sådana röster går inte att använda i agenter. En Professional Voice Clone tränad på svenska låter klart bättre på svenska än en Instant Clone tränad på engelska. Är din klon gjord på engelskt tal: testa först, och spela in en svensk om den bryter.
- **v4 för din PVC.** En befintlig PVC uppgraderas inte av sig själv. Gå till My Voices, håll muspekaren över rösten och klicka på plusset vid Eleven v4. Bocken betyder att den redan är tränad på modellen. Ett utropstecken vid rösten betyder att nya modeller finns att träna på. Du får mejl när det är klart. Träningen görs på de inspelningar som redan ligger på rösten.
- **Stäng av träning på era data.** På vanliga abonnemang får ElevenLabs använda innehåll för att träna sina modeller tills det stängs av. Gå till kontots inställningar → **Data use** och stäng av. Avstängningen gäller bara framåt, så gör det innan första riktiga samtalet. Informationen till medarbetarna säger att det är avstängt.
- **Biträdesavtal.** ElevenLabs DPA (elevenlabs.io/dpa) ingår i deras villkor. Spara en daterad kopia, och av underbiträdeslistan på compliance.elevenlabs.io.
- **Tvåstegsinloggning** på ElevenLabs-kontot.

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
| **Dynamic variables** | Inga. Har du lagt till `foretag`, `roll`, `kund_id` eller `deltagare` tidigare, ta bort dem. Agenten frågar efter företag, webbadress och roll i början av samtalet. |
| **LLM** | GPT-6 Luna |
| **Temperature** | 0,3 |
| **Backup LLM** | Default |
| **Knowledge base** | Tom. Agenten ska inte kunna svara på frågor om AI. |
| **Tools** | Bara systemverktyget **End call**. Det brukar vara påslaget från början. Stäng av Language detection, Transfer och Skip turn. |

Om modellvalet: GPT-6 Luna är vald för pris och prestanda. Intervjun har många villkor (rollgrupp, hoppa över, max en följdfråga, aldrig råd), och en mindre modell kan tappa dem efter tio minuter. Testprotokollet, punkt 2 och 4, visar om den håller. Gör den inte det, prova GPT-6 Sol eller Claude Sonnet.

## 3. Fliken Voice

| Inställning | Värde |
|---|---|
| **Voice** | Din klon |
| **TTS model** | Eleven v4 Turbo, om din PVC är fintränad på v4 (se avsnitt 0). Annars Eleven Turbo v2.5 tills den är det. |
| **Expressive mode** | **Av, och får inte slås på.** Funktionen anpassar tonen efter hur användaren låter. Med medarbetare blir det känsloigenkänning på arbetsplatsen, som är förbjudet enligt AI-förordningen art. 5.1 f. Se `compliance/ai-forordningen.md`. |
| **Stability** | 0,50. Lägre ger mer uttryck men mindre stadig röst. |
| **Similarity** | 0,80 |
| **Speed** | 0,95 på v2.5. v4 har inget hastighetsreglage, där styr prompten tempot. |
| **Pronunciation dictionary** | Lägg till efter första testet, för ord som blir fel: Vitec, Mspecs, Hemnet, Superintelligent. |

## 4. Fliken Analysis

1. **Evaluation criteria**: lägg in de fem raderna i `agent/utvardering.md`.
2. **Data collection**: lägg in de 25 fälten i `agent/datainsamling.md`. Identifier exakt som i filen.
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
| **Conversation (transcript) retention** | 60 dagar |

Standard är två år. Vi har ingen EU-lagring hos ElevenLabs, så datan ska ligga där så kort som möjligt. Utskrifterna hämtas till Microsoft 365 inom EU med `hamta-samtal.mjs` och sparas där i högst 24 månader. 60 dagar ger marginal att hämta efter sista svarsdag.

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
Du pratar med en AI från Superintelligent. Rösten är en AI-kopia av Thomas Dalebrings röst, men det är inte Thomas.

Deltagandet är frivilligt och du kan avbryta när du vill. Samtalet spelas in och skrivs ut. Svaren sammanställs per roll, inte per person, och din arbetsgivare får aldrig ta del av inspelningen eller utskriften. Ljudet raderas efter 30 dagar. Utskriften sparas i högst två år, utan ditt namn. Har din arbetsgivare inget uppdrag hos oss lämnas ingenting ut, och samtalet raderas.

Säg inga namn på kunder eller kollegor.

Genom att starta samtalet bekräftar du att du har tagit del av informationen om AI-intervjun:
https://superintelligent-se.github.io/Superintelligent/policy/ai-intervju.pdf
```

Ändras siffrorna i Data Retention ska de ändras här, i `kund/utskick.md` och i `docs/policy/ai-intervju.html`.

## 8. Länken

1. Klicka **Publish** om agenten har opublicerade ändringar.
2. Agent-ID står under agentens namn, eller i adressfältet: `agent_...`. Skriv in det i `rostagent/config.json`. Det är inte hemligt, det står i länken.
3. Länken är densamma för alla, alltid:

```
https://elevenlabs.io/app/talk-to?agent_id=agent_XXXX
```

Den kan skickas i mejl, läggas på hemsidan eller i ett intranät. Den bär ingen information om företag eller person. Det frågar agenten efter.

**På hemsidan** kan agenten bäddas in med ElevenLabs widget i stället för att länka:

```html
<elevenlabs-convai agent-id="agent_XXXX"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async></script>
```

Widgeten hämtar skript från ElevenLabs när sidan laddas. Lägg den därför på en egen sida, till exempel `/intervju/`, och inte på startsidan. Då behöver cookiepolicyn bara uppdateras för den sidan.

**Vem som helst kan starta en intervju.** Det är avsiktligt, men det betyder två saker. Kostnaden styrs av det dagliga samtalstaket under Security. Och någon kan uppge ett företag hen inte jobbar på. `hamta-samtal.mjs` varnar om ett företag får fler genomförda än antalet inbjudna.

## 9. Testa

Kör först kontrollskriptet. Det läser agentens inställningar via API:t och visar avvikelser mot den här guiden, inklusive om systemprompten, första meddelandet, datainsamlingen och utvärderingen är identiska med filerna i `agent/`:

```bash
node rostagent/scripts/kontrollera-agent.mjs
```

Kör sedan `tester/testprotokoll.md` innan någon kund får länken.

## 10. Hämta svaren

Svaren finns på tre ställen:

- **I gränssnittet**: Agents → agenten → Conversations. Varje samtal har ljud, utskrift, de 25 fälten och utvärderingen. Här lyssnar du när företag eller webbadress är osäkra. Ljudet finns i 30 dagar.
- **Via skriptet**: skapa en API-nyckel (Developers → API keys) med läsrätt till ElevenAgents.

```bash
node rostagent/scripts/hamta-samtal.mjs <domän>
```

- **Via webhook**, senare: Agents → Settings → Post-call webhook skickar varje avslutat samtal till en adress, till exempel ett Power Automate-flöde som lägger svaren i kundens Planner-kort. Bygg det först när flödet för hand fungerar. Webhooken stängs av automatiskt efter tio misslyckade leveranser i rad, och den signeras med HMAC i rubriken `ElevenLabs-Signature`, som flödet måste kontrollera eftersom adressen annars tar emot vad som helst.

## Kostnad

Agentsamtal debiteras per minut ur abonnemanget, plus språkmodellens kostnad. En intervju är 15–20 minuter. Tio medarbetare är alltså runt tre timmar samtalstid. Kontrollera minutpriset på din plan under Subscription innan du prissätter steg 2.
