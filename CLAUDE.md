# The Superintelligent Game

Ett 2D-plattformsspel som ersätter en AI-mognadsassessment. Besökaren springer, hoppar upp i frågetecken och svarar på 15 frågor. Syftet är lead-generering för Superintelligent — inte att vara ett bra spel i sig.

Live: https://superintelligent-se.github.io/Superintelligent/

## Principer som inte får brytas

**Spelaren får aldrig analysen.** Mynten och utrustningen visar att något händer, men aldrig vad svaren betyder, vilken nivå man ligger på eller vad man borde göra. Tolkningen tillhör rådgivaren och är hela affärsmodellen. Ett förslag som visar spelaren dess "AI-mognadspoäng" är fel svar.

**Hoppbonusen är kosmetisk.** Den står på slutskärmen och skickas aldrig med i leadet, just för att den inte ska förväxlas med ett resultat.

**Ingen får fastna.** Marken löper obruten hela banan och alla frågetecken går att hoppa över. Fastnar någon når de aldrig slutskärmen, och då är leadet borta. Ändras banan måste varje plattform och block räknas mot hopphöjden (enkelhopp 104 px, dubbelhopp 184 px, med jetpack ett tredje hopp).

**Frågorna bor i koden.** `src/data/gameData.js` är sanningskällan. `docs/fragor-och-svar.md` genereras ur den — redigera aldrig dokumentet och förvänta dig att spelet följer med.

## Affärskontexten

Superintelligent säljer AI-rådgivning (top-down) och AI-träning (bottom-up). Spelet ersätter steg 1–2 i deras kundresa: kostnadsfritt första möte och fördjupad assessment.

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

## Öppet, kräver beslut eller uppgifter från Thomas

- `FORM_ENDPOINT` i `src/ui.js` är tom — leads loggas bara i webbläsarkonsolen. Ska gå till support@superintelligent.se, förslagsvis via Power Automate så datan stannar i deras Microsoft-miljö.
- `BOOKING_URL` och `TRAINING_URL` i `src/ui.js` är platshållare.
- Egen subdomän är beslutad men uppskjuten. Vid byte: `base` i `vite.config.js` ska bli `/`, plus CNAME-fil och DNS-post.

## Arbetssätt

Varje ny session är ett eget uppdrag, inte en fortsättning. Den här filen plus koden och commit-historiken ska räcka som ingång — behöver du fråga vad som gjordes och varför, läs `git log`, meddelandena förklarar avsikten.

Starta ny session vid varje nytt arbetsområde. Långa felsökningsserier är dyra i kontext och hör hemma i en egen session.
