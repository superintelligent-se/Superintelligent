# Akademins tema

Thinkific-temat för akademi.superintelligent.se, så att kurs- och paketsidorna
följer sajtens designspråk: mörk bana, frågetecken-block, plattformar,
tegelmark och HUD-etiketter i pixelfont. Akademin är träning, och träning är
grönt på sajten.

Det gäller bara **klassiska webbsidor** (Site Builder). Thinkifics
AI-landningssidor tar inte emot temat eller egen kod alls.

```
original/   Thinkifics export, orörd. Empire 1.34.1 (2026-10-19)
tema/       Vår version, det som laddas upp
```

Byggs till zip med `npm run akademi-tema`. Zip-filen hamnar i
`akademi-tema/superintelligent-akademi.zip` och committas inte.

## Vad som är ändrat

Allt eget är märkt `Superintelligent` i koden.

- `manifest.json`: standardvärdena för färger, knappar och typsnitt är
  sajtens, och förinställningen Superintelligent ligger först. Ett importerat
  tema startar på standardvärdena, så hela Akademin blir mörk direkt.
- `styles/_overrides.scss.liquid`: all stil. Först det som gäller hela
  Akademin (typsnitt, knappar, sidhuvud, sidfot), sedan kurs- och paketsidan.
- `snippets/theme_wide_css.liquid`: laddar Hanken Grotesk, IBM Plex Mono och
  Silkscreen. Temats typsnittslista saknar dem.
- `sections/banner_course.liquid`: HUD-etikett, kursens omfattning (kapitel,
  lektioner och pris ur kursen) och frågetecken-blocken när bannern saknar bild.
- `pages/course.liquid`, `pages/bundle.liquid`: tegelmarken före sidfoten.
- Kurssektionernas standardtexter är svenska och vänsterställda, så att nya
  sektioner inte börjar på engelska.

Sidhuvud, sidfot och knappar ändras på hela Akademin. Banan (blocken,
plattformarna, kursplanens numrerade block) bara på kurs- och paketsidor.

## Vad som kommer ur kursen och vad som skrivs per sida

Ur kursens data, utan att någon fyller i något: titel, beskrivning, pris,
köpknappar, kapitel, lektioner och kortet bredvid kursplanen. Instruktören
väljs i sektionen och hämtar namn, titel, bild och text från
instruktörsprofilen.

Per sida i Site Builder: fördelarna (Ikon och text), längre text (Rich text,
Text och bild) och rubriken i den avslutande uppmaningen.

## När Thinkific uppdaterar Empire

Exportera det nya temat, lägg det i `original/` och jämför mot den förra
versionen. Ändringarna i `tema/` är få och märkta, så de förs över för hand.
`_overrides.scss.liquid` och `theme_wide_css.liquid` påverkas sällan.

Thinkific kompilerar SCSS på sin sida, med en äldre Sass. Undvik `min()` och
`max()` med blandade enheter, de tolkas som Sass-funktioner. `clamp()` går bra.
