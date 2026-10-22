---
name: superintelligent-presentation
description: Skapa och redigera presentationer i Superintelligents formspråk (samma design som www.superintelligent.se). Använd när någon ber om en presentation, ett bildspel, en föreläsning, slides eller ett deck för Superintelligent, eller vill flytta in en äldre presentation i den nya designen.
---

# Superintelligents presentationer

En presentation är en enda HTML-fil. Den öppnas i vilken webbläsare som helst, går att visa i helskärm, skicka som fil och spara som PDF. Designen är densamma som på www.superintelligent.se: mörk bana, frågetecken-block, plattformar, tegelmark och etiketter i pixelfont.

## Så gör du en ny presentation

1. Kopiera `mall.html` till en ny mapp enligt strukturen nedan och döp filen till `index.html`.
2. Ändra bara innehållet i `<main class="deck">` och `<title>`. Allt mellan `TEMA` och `SLUT TEMA` lämnas orört, så att alla presentationer ser likadana ut.
3. Varje bild är en `<section class="slide">`. Använd bildtyperna nedan i stället för att hitta på nya.
4. Avsluta alltid med avslutningsbilden, med talarens LinkedIn som QR-kod.

## Mappstruktur

```
presentationer/
  kund/          Möten och workshops med en kund
  forelasning/   Föreläsningar, konferenser, webbinarier
  akademi/       Kursmaterial till Superintelligent Akademi
  intern/        Internt i teamet
  exempel/       Mallen ifylld, att jämföra mot
```

Varje presentation får en egen mapp som heter `ÅÅÅÅ-MM-kort-namn`, till exempel `presentationer/kund/2026-11-lantmannen-ledningsgrupp/index.html`. Hör presentationen till ett program eller en kurs med flera tillfällen, samlas de i en mapp för programmet: `presentationer/kund/kompetens-5.0/2026-10-modul-4-copilot-premium/`. Bilder och logotyper som presentationen använder ligger i undermappen `material/`.

## Bildtyper

**Försättsblad** (`.cover`). Fortsätter där startsidan på superintelligent.se slutar. Etikett i pixelfont med tillfälle och datum, en rubrik i två rader, en mening om vad publiken går därifrån med, och talaren. Till höger banan: fem plattformar med frågetecken i de fem områdenas färger.

**Innehåll** (`.agenda`). Rubrik till vänster, numrerade avsnitt med tid till höger. Fyra till sex avsnitt. Samma bild kan återkomma mellan avsnitten: lägg `data-current="3"` på `<ol>`, så blir avklarade avsnitt grå och det aktuella gult.

**Avslutning** (`.closing`). Tack, talarens foto, namn och roll, två knappar (Spela spelet, Boka möte) och QR-koden till talarens LinkedIn.

**Innehållsbild** (`.s-title` följt av `.s-body`). Etikett, rubrik och ingress överst, sedan något av:

- `.cards` med två eller tre kort (`style="--n: 2"`). `.is-key` lyfter fram det kort som gäller publiken.
- `.matrix`, en tabell där varje cell har status `ja`, `nej` eller `villkor` och en ruta i grönt, rött eller gult, med `.legend` som förklaring.
- `.links`, en lista med länkar till material, med filtyp i pixelfont.

**Övning** (`.exercise`). Övningens nummer och tid, rubrik, verktyg (`.tools`), tre mål (`.goals`) och resultatet (`.result`). Till höger banan med ett block per övning: klarade grå, aktuell gul och störst, kommande streckade. Publiken ser var i passet de är.

**Budskap** (`.statement`). En mening som står för sig själv: paus, avsnittsbyte, en slutsats. Med `.prompt` för en prompt som publiken ska skriva av.

**Avslutning** (`.closing`). Tack, talarens foto, namn och roll, två knappar (Spela spelet, Boka möte) och QR-koden till talarens LinkedIn.

Fler bildtyper (siffra, jämförelse, citat, bild) läggs till i `mall.html` när de behövs. Lägg dem där, inte bara i en enskild presentation, så att alla får dem.

## Talaranteckningar

Anteckningarna skrivs i HTML-filen, sist i varje bild, i `<aside class="notes">`. De syns aldrig för publiken. Använd `<p>` för text, `<h4>` för rubriker, `<ol>` för steg och `<blockquote>` för prompter. En prompt i `<blockquote>` får en Kopiera-knapp i talarvyn, så att den kan klistras in i chatten direkt.

## Logotyper och bilder som kräver vit botten

Logotyper, EU-märkningar och skärmklipp är oftast gjorda för ljus botten. Två lösningar, inga andra:

- **Ljus fot** för presentationer som måste bära logotyper på varje bild, till exempel EU-märkningen "Medfinansieras av Europeiska unionen" i ett ESF-projekt. Sätt `data-fot="ljus"` på `<main class="deck">`. Sidfoten blir en vit list i hela bredden där logotyperna står i sina egna färger, och marken och banan står på listen. Lägg logotyperna i sidfoten på varje bild: `<span class="end"><span class="partners"><img …></span><span class="num"></span></span>`. På försättsbladet står hela partnerraden där i stället (`<img class="wide">`).
- **Vit ruta** (`.on-white`) runt en enskild bild inne på en bild, till exempel en badge eller ett skärmklipp.

Utan logotypkrav är foten mörk som på sajten.

## Flytta in en gammal presentation

1. Läs ut text, tabeller och anteckningar ur filen (för .pptx: `python-pptx`). Text som sitter i bilder läses av från en renderad version.
2. Behåll innehållet och ordningen, men skriv om rubrikerna så att de säger slutsatsen. Fyll inte på med nytt sakinnehåll.
3. Byt varje gammal bild mot närmaste bildtyp ovan. Illustrationer i den gamla stilen tas bort, banan och blocken ersätter dem.
4. Dolda bilder, till exempel ett körschema, blir talaranteckningar på försättsbladet.
5. Partnerlogotyper och obligatoriska märkningar följer med.

## QR-koden

Två sätt, båda fungerar:

- Lämna `<div class="qr" data-qr="https://www.linkedin.com/in/NAMN/">` tom. Koden ritas när presentationen öppnas. Kräver internet.
- Klistra in en färdig `<svg>` i `.qr`. Fungerar utan internet. Med Node: `node verktyg/qr.mjs https://www.linkedin.com/in/NAMN/` (kräver paketet `qrcode`).

LinkedIn för laget: Thomas `dalebring`, Christofer `chrisnassil`, Tomas `tomas-s%C3%B6derling-b2045a50`, Martin `martin-andersson-853049158`, Ludwig `ludwig-kocon-aa968128a`. Foton finns på https://www.superintelligent.se/om-oss/laget/.

## Formspråket

- Färgerna har betydelse. Grönt är bottom-up och träning, lila är top-down och rådgivning, gult är spelet och nästa steg. De fem områdena: grön ägarskap, gul förmåga, blå data, orange regler, lila möjligheter.
- Tre typsnitt: Hanken Grotesk för rubriker och text, Silkscreen (pixelfont) bara för korta etiketter i versaler, IBM Plex Mono för metadata som datum, tider och adresser.
- Frågetecken-blocken (`.qb`) bär numrering. Använd dem bara när ordningen betyder något.
- En tanke per bild. Rubriken säger slutsatsen, inte ämnet: "Hälften av tiden går till att leta information" i stället för "Informationssökning".
- Högst sex rader text på en bild. Det som ska sägas men inte synas skrivs som kommentar i HTML-koden ovanför bilden.
- Svenska, du-tilltal till publiken, inga engelska modeord när det finns ett svenskt.

## Visa och dela

- **Talarvyn**: tryck P. Ett eget fönster öppnas med aktuell bild, nästa bild, anteckningarna, tid sedan start och klockan. Båda fönstren bläddrar och följs åt. Tillåt popup-fönster första gången.
- **På plats med projektor**: koppla in projektorn som utökad skärm, inte spegling. Öppna presentationen, tryck P, dra presentationsfönstret till projektorn och tryck F där. Talarvyn stannar på datorns skärm.
- **I Teams**: dela presentationsfönstret, inte hela skärmen. Talarvyn syns då bara för dig.
- Bläddra med piltangenterna, mellanslag eller en klickare, i vilket fönster som helst. N visar anteckningarna i presentationsfönstret, om du bara har en skärm.
- **En fil att ta med**: `npm run presentation -- <presentationens mapp>` packar presentationen till en enda fil med bilder och typsnitt inbäddade, till exempel `2026-10-modul-4-copilot-premium.html` i samma mapp. Den fungerar utan internet och kan mejlas eller laddas ner. Kör kommandot igen efter varje ändring. Utan Node: lägg bilderna som `data:`-adresser direkt i `src`.
- **PDF**: öppna i Chrome, skriv ut, välj Spara som PDF. Varje bild blir en sida i 16:9. Bra som reserv och att skicka efteråt.
