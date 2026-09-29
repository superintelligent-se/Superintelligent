# The Superintelligent Game

Ett 2D-plattformsspel som ersätter en AI-mognadsassessment. Besökaren springer, hoppar upp i frågetecken och svarar på 15 frågor. Syftet är lead-generering för Superintelligent — inte att vara ett bra spel i sig.

Live: https://superintelligent-se.github.io/Superintelligent/

## Principer som inte får brytas

**Spelaren får aldrig analysen.** Mynten och utrustningen visar att något händer, men aldrig vad svaren betyder, vilken nivå man ligger på eller vad man borde göra. Tolkningen tillhör rådgivaren och är hela affärsmodellen. Ett förslag som visar spelaren dess "AI-mognadspoäng" är fel svar.

Bekräftelsemejlet till besökaren är en återblick, inte en analys: mynten, utrustningen och kommentaren efter varje svar — exakt det spelaren redan sett på banan — plus en uppmaning att boka. Ingen nivå, ingen totalpoäng, inga slutsatser eller råd. Kommentarerna i `gameData.js` ska därför fortsatt bara konstatera, aldrig tipsa.

**Hoppbonusen är kosmetisk.** Den står på slutskärmen och skickas aldrig med i leadet, just för att den inte ska förväxlas med ett resultat.

**Ingen får fastna.** Marken löper obruten hela banan och alla frågetecken går att hoppa över. Fastnar någon når de aldrig slutskärmen, och då är leadet borta. Ändras banan måste varje plattform och block räknas mot hopphöjden (enkelhopp 104 px, dubbelhopp 184 px, med jetpack ett tredje hopp).

**Frågorna bor i koden.** `src/data/gameData.js` är sanningskällan. `docs/fragor-och-svar.md` genereras ur den — redigera aldrig dokumentet och förvänta dig att spelet följer med.

**Formuläret litar aldrig på fritext.** Flödets adress står öppet i källkoden. Besökarens mejl byggs därför av färdiga bitar i `lead-mail.json` (genereras ur `gameData.js` av `scripts/build-mail-data.mjs` vid dev/build) som väljs med index — spelet skickar aldrig mejltext. Annars kan vem som helst få hello@ att mejla valfritt innehåll till valfri adress.

## Affärskontexten

Superintelligent säljer AI-rådgivning (top-down) och AI-träning (bottom-up). Spelet ersätter steg 1–2 i deras kundresa: kostnadsfritt första möte och fördjupad assessment.

**Mäklarbranschen är fokus för säljarbetet.** Spelet börjar därför med ett branschval: mäklare eller annan bransch. Valet styr rolluppsättningen — mäklare får Franchiseägare/Ägare, Kontorschef, VD, Teamledare och Annat (fritext), övriga får VD/Ledning, Chef, Medarbetare, Entreprenör. Frågorna är gemensamma; skulle de branschanpassas krävs en egen uppsättning i `gameData.js` och att `lead-mail.json` följer med.

Roller har `avatar` skild från `id` så flera roller kan dela pixelfigur. Fritexten i Annat är det enda fria fältet före spelet — den saneras i `cleanRoleText()` och går bara till leadet, aldrig till besökarens mejl.

De fem dimensionerna är ordnade som banan, och ordningen är medveten:

| # | Dimension | Färg | Utrustning vid 3 mynt av 5 |
|---|---|---|---|
| 1 | AI-ägarskap | Grön | AI-lead som följer dig |
| 2 | AI-förmåga | Gul | Fart |
| 3 | Data & kunskapsgrund | Blå | Datakub |
| 4 | Regler & policy | Orange | Sköld |
| 5 | Möjlighets-AI | Lila | Jetpack (tredje hopp) |

Ägarskapet först: har ingen ansvaret spelar resten mindre roll. Den frågan sitter på första blocket, före röret, så genvägen aldrig tas utan att den ställts.

Svarar man lågt får man ingen utrustning och springer oskyddad — det är metaforen, inte en bugg. Ändrar man ner ett svar tas utrustningen tillbaka.

**Röret** efter första frågetecknet hoppar över hela banan. Den som tar det säger "vi vet redan att vi behöver hjälp". Leadet märks `genvag: JA` och slutskärmen får egen text, eftersom det inte finns några svar att analysera.

ROI-mätning är medvetet utelämnad ur spelet — den har inget bra snabbsvar och hör hemma i samtalet.

## Fallgropar som kostat tid

**Phaser sover när förhandsgranskningspanelen är dold.** Skärmdumpar visar då den senast ritade bildrutan, inte nuläget. Tre gånger har det sett ut som att något är trasigt när det fungerade. Verifiera i stället genom att stega fysiken manuellt (`scene.physics.world.step(1/60)` i loop, `scene.update()` för input) eller väck loopen och vänta på två `requestAnimationFrame`.

**Phaser fångar W, A, S, D och mellanslag globalt** på `window` med `preventDefault`. Det gjorde att de bokstäverna inte gick att skriva i lead-formuläret. Att sätta `input.keyboard.enabled = false` räcker inte — fångsten sitter i managern och kräver `clearCaptures()`. Gränssnittet signalerar via `game-input`-eventet.

**Escape i en dialog måste `stopPropagation()`.** Annars stänger samma tryck dialogen och når sedan scenens Escape-lyssnare, som direkt öppnar omstartsfrågan.

**Banan scrollar inte vertikalt.** Världen är 540 px hög precis som kameran, så inget spelinnehåll får hamna ovanför y ≈ 150 — där ligger HUD och ljudknapp.

**Dialoger ligger utanför `#stage`** och är `position: fixed`. Låg de inuti spelrutan blev de 211 px höga på en telefon i stående läge.

**HUD:en är DOM men hör till spelbilden** och skalas med `--stage-scale`, satt i JS mot spelytans bredd.

## Arkitektur

```
src/data/gameData.js   Dimensioner, roller, 15 frågor med 60 svar och kommentarer
src/state.js           Svar, poäng, mynt, lead-payload
src/scenes/PlayScene.js Banan, zoner, utrustning, röret, masten, raketen
src/ui.js              Alla DOM-dialoger, HUD, lead-formulär, mobilinit
src/config.js          Boknings- och träningslänkar, delas med mejlet
scripts/               lead-mail.json och policy-PDF:er
src/touch.js           Touch matas in i samma ställen som tangentbordet
src/avatars.js         Fyra pixelfigurer, 10x14 rutnät
src/pixelart.js        Delad pixelritare, mynt och utrustning
src/audio.js           Ljud syntetiserat med WebAudio, inga ljudfiler
```

Touch och tangentbord möts i `PlayScene.update()`. Mobil är inte en egen version — det finns ett inmatningslager och några media queries, inget annat dupliceras.

## Köra och testa

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

Push till `main` bygger och publicerar till GitHub Pages via Actions. Verifiera alltid med `gh run watch` att deployen gick igenom.

Mobil testas med `resize_window` (mobile-preset ger `pointer: coarse`). Liggande telefon är ofta 844–932 px bred, så brytpunkter måste utgå från `pointer: coarse`, inte bredd.

## Leadflödet

Formuläret postar till Power Automate-flödet **Spelet: nytt lead** (miljön HUMANOR AB (default), körs med Thomas anslutningar). Flödet hämtar `lead-mail.json` från den publicerade sajten, svarar spelet med 200 och skapar sedan ett kort i Planner-tavlan i Teams-kanalen Sälj (det är CRM:et), postar i Sälj, mejlar alla svar till hello@ och skickar återblicken till besökaren från hello@.

hello@ är en delad postlåda, inte Teams-gruppens adress (team@) — den skickar till alla i teamet och går inte att skicka från via flödet. Thomas, Tomas och Christofer har Full Access och Send As, och skickade svar sparas i postlådan så alla ser vem som svarat. info@ är alias på Thomas egen postlåda.

Ändras frågorna måste sajten deployas innan mejlen följer med — flödet läser alltid den publicerade filen.

Policydokumenten skrivs i `docs/policy/*.html` och renderas till `public/policy/*.pdf` med `npm run policies` (kräver Chrome lokalt). PDF:erna committas.

## Öppet, kräver beslut eller uppgifter från Thomas

- `BOOKING_URL` och `TRAINING_URL` i `src/config.js` är platshållare. De används både i spelet och i mejlet.
- Policyerna är standardmallar — låt någon med juridisk koll läsa dem.
- Egen subdomän är beslutad men uppskjuten. Vid byte: `base` i `vite.config.js` ska bli `/`, plus CNAME-fil och DNS-post. Glöm inte URL:en till `lead-mail.json` i flödet.

## Arbetssätt

Varje ny session är ett eget uppdrag, inte en fortsättning. Den här filen plus koden och commit-historiken ska räcka som ingång — behöver du fråga vad som gjordes och varför, läs `git log`, meddelandena förklarar avsikten.

Starta ny session vid varje nytt arbetsområde. Långa felsökningsserier är dyra i kontext och hör hemma i en egen session.
