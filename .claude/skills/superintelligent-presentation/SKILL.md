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

Varje presentation får en egen mapp som heter `ÅÅÅÅ-MM-kort-namn`, till exempel `presentationer/kund/2026-11-lantmannen-ledningsgrupp/index.html`. Bilder som presentationen använder ligger i samma mapp.

## Bildtyper

**Försättsblad** (`.cover`). Fortsätter där startsidan på superintelligent.se slutar. Etikett i pixelfont med tillfälle och datum, en rubrik i två rader, en mening om vad publiken går därifrån med, och talaren. Till höger banan: fem plattformar med frågetecken i de fem områdenas färger.

**Innehåll** (`.agenda`). Rubrik till vänster, numrerade avsnitt med tid till höger. Fyra till sex avsnitt. Samma bild kan återkomma mellan avsnitten: lägg `data-current="3"` på `<ol>`, så blir avklarade avsnitt grå och det aktuella gult.

**Avslutning** (`.closing`). Tack, talarens foto, namn och roll, två knappar (Spela spelet, Boka möte) och QR-koden till talarens LinkedIn.

Fler bildtyper (budskap, siffra, jämförelse, citat, bild) läggs till i `mall.html` när de behövs. Lägg dem där, inte bara i en enskild presentation, så att alla får dem.

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

- Bläddra med piltangenterna, mellanslag eller en klickare. F ger helskärm. Adressen slutar på bildens nummer, till exempel `#3`.
- PDF: öppna i Chrome, skriv ut, välj Spara som PDF. Varje bild blir en sida i 16:9.
- Typsnitten hämtas från Google Fonts. Utan internet visas systemtypsnitt, så öppna presentationen en gång före föreläsningen.
