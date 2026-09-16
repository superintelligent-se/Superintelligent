# The Superintelligent Game

En gamifierad AI-mognadsassessment. Istället för ett frågeformulär springer besökaren genom en 2D-bana och slår upp frågetecken. Ersätter steg 1–2 i kundresan (kostnadsfritt första AI-möte + fördjupad assessment).

**Designprincip:** spelaren ser bara staplar röra sig i realtid — aldrig tolkningen. Analysen går till rådgivaren, som tar den vidare i mötet.

## Dimensioner

| Dimension | Axel |
|---|---|
| Regler & policy | Bas |
| Data & kunskapsgrund | Bas |
| AI-förmåga | Bottom-up (grön) |
| AI-ägarskap | Top-down (lila) |
| Möjlighets-AI | Top-down (lila) |

ROI-mätning samlas medvetet in efteråt, i rådgivningssamtalet — inte i spelet.

Banan är indelad i fem zoner, en per dimension, med tre frågetecken i varje. Svaren ger mynt i HUD:en, och tre mynt av fem i en dimension ger utrustning på figuren: sköld, datakub, fart, en AI-lead som springer bredvid dig, och en jetpack som ger ett tredje hopp. Svarar ni att allt saknas får ni ingen utrustning — det är metaforen, inte en bugg.

## Stack

Phaser 3 (spelmotor) + Vite (bygge). Helt client-side, ingen backend krävs.

## Utveckling

```bash
npm install
npm run dev
```

Styrning: piltangenter/WASD för att springa, mellanslag/uppåt för att hoppa. Hoppa upp i ett frågetecken underifrån för att öppna en fråga.

## Koppla på lead capture

Leads samlas via extern formtjänst. Klistra in endpointen i `FORM_ENDPOINT` överst i [src/ui.js](src/ui.js). Utan endpoint körs spelet i testläge och loggar svaren i webbläsarkonsolen.

Payloaden innehåller kontaktuppgifter, vald roll, speltid, alla råsvar och dimensionspoäng.

## Bygg & publicera

```bash
npm run build
```

Push till `main` triggar [.github/workflows/deploy.yml](.github/workflows/deploy.yml) som bygger och publicerar till GitHub Pages.

**Engångsinställning på GitHub:** Settings → Pages → Source: "GitHub Actions". Byter repot namn måste `REPO_NAME` i [vite.config.js](vite.config.js) uppdateras.

## Innehåll

Frågebank, roller och dimensioner ligger samlat i [src/data/gameData.js](src/data/gameData.js) — redigera texterna där utan att röra spellogiken.
