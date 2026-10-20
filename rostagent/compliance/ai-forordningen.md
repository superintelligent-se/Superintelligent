# AI-förordningen – bedömning av intervjuagenten

Superintelligent Group AB · Version 1, 20 oktober 2026
Gäller agenten som beskrivs i `rostagent/`. Ses över när agentens syfte, frågor, modell eller funktioner ändras.

## 1. Vår roll

Superintelligent konfigurerar agenten och tar den i bruk under eget namn. Vi är därför **leverantör** av AI-systemet "Superintelligents intervjuare" i förordningens mening (art. 3.3), och samtidigt **tillhandahållare** (deployer) när vi använder det i kunduppdrag. ElevenLabs och språkmodellens leverantör är leverantörer av de modeller och plattformar systemet bygger på.

## 2. Förbjudna metoder (art. 5) – gäller sedan 2 februari 2025

**Känsloigenkänning på arbetsplatsen, art. 5.1 f.** AI-system som härleder känslor hos fysiska personer på arbetsplatsen utifrån biometriska uppgifter, som röst, är förbjudna. Intervjuer med medarbetare om deras arbete räknas som arbetsplatssammanhang.

Det här är den enda punkt i förordningen där agenten kan hamna fel, och därför gäller:

- **Expressive mode ska vara av.** ElevenLabs beskriver att funktionen anpassar tonen efter hur användaren låter, till exempel lugnare när någon låter orolig. Det är att härleda känsla ur röst.
- **Attityd (C5) är självrapporterad.** Personen väljer själv nyfiken, neutral, orolig eller skeptisk. Fältet `attityd` får bara fyllas med det personen säger i ord, aldrig utifrån tonfall.
- **Inga utvärderingar eller fält om känsloläge, stress eller engagemang** utöver det personen själv säger.
- **ElevenLabs turtagning** använder enligt deras dokumentation röstsignaler (prosodi) för att avgöra när agenten ska tala. Det används för att tajma svaren, inte för att härleda eller redovisa känslor, och bedöms därför inte som känsloigenkänning. Ändras det, eller börjar ElevenLabs redovisa känsloläge, ska bedömningen göras om.

**Övriga förbud** (manipulation, social poängsättning, biometrisk kategorisering m.fl.) är inte tillämpliga.

## 3. Högrisk (art. 6 och bilaga III)

Bilaga III punkt 4 b gör AI-system till högrisk om de är avsedda att fatta beslut som påverkar villkor i anställning, fördela arbetsuppgifter utifrån individuellt beteende eller personliga egenskaper, eller **övervaka och utvärdera prestation och beteende hos personer** i anställning.

Agenten är **inte** avsedd för något av det:

- Den mäter hur arbetstiden används per roll, inte hur väl en person utför sitt arbete.
- Inget namn samlas in i samtalet. Den personliga koden används bara för påminnelser och dubblettkontroll, finns bara hos Superintelligent och raderas efter perioden. Resultat redovisas bara aggregerat per roll med minst tre deltagare och minst tio per företag.
- Kunden får aldrig individuella svar.
- Inga beslut om enskilda fattas, varken av systemet eller med det som underlag.

Bedömningen bygger på att begränsningarna hålls. **Systemet blir högrisk om** det börjar användas för att bedöma enskilda, om kunden får individuella svar, eller om resultat används i personalbeslut. Därför står de begränsningarna i `kundbilaga.md` som avtalsvillkor och inte bara som rutin.

Bedömningen dokumenteras här enligt art. 6.4, oavsett när kraven för högrisksystem i bilaga III börjar tillämpas.

## 4. Transparens (art. 50) – gäller från 2 augusti 2026

| Krav | Uppfyllt genom |
|---|---|
| **Art. 50.1** Den som interagerar med ett AI-system ska informeras om det, senast vid första interaktionen. | Första meningen i varje samtal: "Jag är en AI-assistent från Superintelligent." Också i inbjudan, i informationen och i villkorstexten på samtalssidan. Utvärderingskriteriet `samtycke_forst` och testprotokollet kontrollerar. |
| **Art. 50.4** Ljud som skapats av AI och som efterliknar en verklig person (deepfake) ska redovisas. | "Rösten du hör är en AI-kopia av Thomas Dalebrings röst, men det är inte Thomas du pratar med." Sägs i första meddelandet och när någon frågar. |
| **Art. 50.2** Maskinläsbar märkning av syntetiskt ljud. | Åligger leverantören av den generativa modellen, ElevenLabs. Inget att göra för oss. |

Thomas har själv skapat och godkänt klonen av sin röst för det här ändamålet. Klonen används inte i andra sammanhang än de som beskrivs i `rostagent/`.

## 5. AI-kunnighet (art. 4) – gäller sedan 2 februari 2025

Alla på Superintelligent som konfigurerar agenten eller läser intervjuresultat ska känna till:

- att agenten inte får bedöma enskilda eller känslor, och varför,
- tre-regeln och att citat ska granskas innan de lämnas till kund,
- att Expressive mode och liknande funktioner inte får slås på utan ny bedömning,
- att språkmodellens sammanfattningar kan vara fel och ska stämmas av mot utskriften.

Genomgången dokumenteras i `rutiner.md`.

## 6. Mänsklig kontroll

En rådgivare läser utskrifterna, kontrollerar fälten mot utskriften och gör sammanställningen. Inget går direkt från agenten till kunden.

## 7. Det som kräver ny bedömning

- Ny funktion i ElevenLabs som analyserar röst, känsla eller sentiment.
- Ändrade frågor som rör prestation, personlighet eller hälsa.
- Att kunden ska få individuella svar.
- Användning utanför kunduppdrag, till exempel rekrytering.
