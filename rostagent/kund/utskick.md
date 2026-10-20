# Utskick till medarbetarna

Skickas av Superintelligent, ett mejl per person med den personens länk. Claude lägger utkasten i Outlook (se README, *Arbetsgång i chatten*). Kunden har informerat medarbetarna innan, så att mejlet är väntat. Byt ut det inom hakparentes.

---

**Ämne:** 15 minuter om din arbetsdag – senast [DATUM]

Hej,

[KUND] har tagit hjälp av oss på Superintelligent för att kartlägga hur arbetstiden används. Målet är att hitta det tråkiga och tidskrävande arbetet som går att få bort.

Du är inbjuden att prata med vår AI-intervjuare i ungefär 15 minuter, när det passar dig före [DATUM]. Den frågar vad du gjorde igår, vad som tar tid och energi, och hur du använder AI i dag. Det finns inga rätta svar, och ungefärliga tider räcker.

**[Starta intervjun]([PERSONLIG LÄNK])**

Länken är personlig. Dela den inte.

Genom att klicka och starta samtalet bekräftar du att du har läst [informationen om AI-intervjun](https://superintelligent-se.github.io/Superintelligent/policy/ai-intervju.pdf). Det viktigaste:

- **Det är frivilligt.** Du kan avstå eller avbryta när du vill, och det får inga följder för dig. [KUND] får inte veta vem som har deltagit.
- **Du pratar med en AI**, inte en människa. Rösten är en AI-kopia av Thomas Dalebring på Superintelligent.
- **Per roll, inte per person.** Vi på Superintelligent ansvarar för intervjuerna. [KUND] får bara en sammanställning per roll och får aldrig höra eller läsa vad just du har sagt. Länken innehåller en slumpkod så att vi bara påminner den som inte hunnit delta. Kopplingen till din adress raderas när intervjuperioden är slut.
- **Inspelning.** Samtalet spelas in och skrivs ut. Ljudet raderas efter 30 dagar. Utskriften sparas i högst två år, utan koppling till dig.
- **Säg inga namn** på kunder eller kollegor.

Länken fungerar i mobil och dator. Webbläsaren ber om lov att använda mikrofonen. Sitt gärna ostört och använd hörlurar.

Frågor om hur uppgifterna hanteras: svara på det här mejlet eller skriv till hello@superintelligent.se.

Vänliga hälsningar
Thomas Dalebring
Superintelligent

---

## Att tänka på

- **Klicket är en bekräftelse, inte ett samtycke.** Det betyder "jag har läst informationen och vill delta". Den rättsliga grunden är berättigat intresse, eftersom samtycke från anställda sällan räknas som frivilligt. Skriv därför aldrig "genom att klicka samtycker du till" eller "godkänner du alla villkor". Bakgrund i `compliance/konsekvensbedomning.md` avsnitt 4.
- **Informationen ska nås före klicket**, därför länken till PDF:en ovanför knappen. Samma text visas också på samtalssidan och sägs av agenten.
- **"[KUND] får inte veta vem som har deltagit"** är vårt löfte och kundens åtagande (kundbilagan 4.4 och 5.6). Stryk inte meningen.
- Lagringstiderna ska stämma med Data Retention i agenten och med `docs/policy/ai-intervju.html`.
- Kunden ska ha informerat facket enligt MBL innan utskicket går (kundbilagan, punkt 4.2).

## Påminnelse

**Ämne:** Påminnelse: 15 minuter om din arbetsdag – senast [DATUM]

Hej, en påminnelse om AI-intervjun för [KUND]. Den är öppen till och med [DATUM] och tar ungefär 15 minuter. Det är frivilligt. [Har du redan börjat men inte blivit klar kan du starta om med samma länk.]

**[Starta intervjun]([PERSONLIG LÄNK])**

[Information om AI-intervjun](https://superintelligent-se.github.io/Superintelligent/policy/ai-intervju.pdf)

Skickas bara till dem i `paminnelser.json`, högst två gånger. Meningen inom hakparentes bara till dem med `paborjat: true`.
