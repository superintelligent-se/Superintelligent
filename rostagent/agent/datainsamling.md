# Datainsamling

Läggs in i **Analysis → Data collection → Add item**, ett fält i taget. ElevenLabs tillåter 25 fält per agent på vanliga abonnemang (40 på Enterprise). Här är 23.

Identifier ska skrivas exakt som nedan. De är kontraktet mot `scripts/hamta-samtal.mjs` och MMM-flikarna i Excel.

Varje beskrivning skickas till en språkmodell som läser utskriften efter samtalet. Den ser inte systemprompten, så beskrivningen måste stå på egna ben.

| # | Identifier | Typ | Description (klistra in) |
|---|---|---|---|
| 1 | `samtycke` | Boolean | true om personen uttryckligen sa ja till att genomföra intervjun efter första meddelandet. false om personen sa nej, tvekade eller avbröt direkt. |
| 2 | `roll` | String | Personens roll. Exakt ett av: agare, chef, maklare, saljstod, annan. Använd det personen själv säger om det avviker från länken. Skriv annan om det inte framgår. |
| 3 | `typisk_dag` | Boolean | true om personen sa att gårdagen var en vanlig arbetsdag. false om en annan dag användes i stället. |
| 4 | `uppgifter_json` | String | Alla arbetsuppgifter personen beskrev från sin arbetsdag och vecka, som en JSON-lista på en rad. Varje post: {"uppgift": kort beskrivning, "min_per_dag": heltal eller null, "ggr_per_vecka": tal eller null, "min_per_gang": heltal eller null, "system": systemets namn eller null}. Använd min_per_dag för sådant som gjordes igår, och ggr_per_vecka plus min_per_gang för veckouppgifter. Gissa aldrig en siffra som personen inte sa. Skriv [] om inga uppgifter beskrevs. |
| 5 | `tid_confidence` | Integer | Personens eget svar på hur säker hen är på tiderna, 1 till 5. Skriv 0 om frågan inte besvarades. |
| 6 | `rollsvar_json` | String | Svaren på de rollspecifika frågorna som ställdes efter genomgången av dagen och före frågorna om energi och friktion. JSON-objekt på en rad med nycklarna R1, R2 och så vidare i den ordning frågorna ställdes. Varje värde är en kort sammanfattning av svaret med alla siffror bevarade. Skriv {} om inga sådana frågor ställdes. |
| 7 | `energitjuv` | String | Den del av dagen som personen sa tar mest energi. En mening. Tom sträng om obesvarad. |
| 8 | `dubbelregistrering` | String | Hur ofta och var personen skriver in samma information på mer än ett ställe. Nämn systemen. Tom sträng om obesvarad. |
| 9 | `leta_vanta_min` | Integer | Antal minuter igår som gick till att leta information eller vänta på svar. Räkna om timmar till minuter. -1 om ingen siffra gavs. |
| 10 | `avbrott_antal` | Integer | Antal gånger igår personen blev avbruten av en fråga eller själv behövde fråga någon. -1 om ingen siffra gavs. |
| 11 | `ai_verktyg` | String | AI-verktyg personen använder i jobbet, kommaseparerade, till exempel "ChatGPT, Copilot". Skriv "inga" om personen inte använder något. |
| 12 | `ai_frekvens` | String | Hur ofta personen använder AI i jobbet. Exakt ett av: dagligen, varje_vecka, ibland, aldrig, okant. |
| 13 | `ai_exempel` | String | Det senaste konkreta tillfället personen använde AI i jobbet: vad som gjordes och om resultatet blev bra. Två meningar. Tom sträng om inget exempel gavs. |
| 14 | `ai_niva` | String | Klassning av personens faktiska AI-användning utifrån det hen beskrev. Exakt ett av: ingen (använder inte AI), chatt (ställer enstaka frågor till en chattbot), produktivitet (använder AI regelbundet i flera arbetsuppgifter), agent (har byggt eller konfigurerat egna agenter eller automatiseringar). |
| 15 | `privat_ai_konto` | String | Om personen använder ett privat AI-konto till jobbuppgifter. Exakt ett av: ja, ibland, nej, ej_svar. |
| 16 | `vet_vem_fraga` | String | Om personen vet vem hen ska fråga om ett AI-verktyg är okej att använda. Exakt ett av: ja, nej, osaker, ej_svar. Om ja och en roll eller funktion nämndes, lägg till den efter ett kolon, till exempel "ja: kontorschefen". Skriv aldrig ett personnamn. |
| 17 | `attityd` | String | Personens inställning till att använda mer AI i jobbet. Exakt ett av: nyfiken, neutral, orolig, skeptisk, ej_svar. |
| 18 | `ta_bort_uppgift` | String | Den återkommande uppgift personen helst skulle ta bort för alltid. Tom sträng om obesvarad. |
| 19 | `fem_timmar` | String | Vad personen skulle lägga fem extra timmar i veckan på. Tom sträng om obesvarad. |
| 20 | `arbetsflode` | String | Det arbetsflöde personen tror skulle gå mycket snabbare med rätt verktyg. Tom sträng om obesvarad. |
| 21 | `ovrigt` | String | Det personen tog upp när hen fick frågan om något borde ha frågats. Tom sträng om inget. |
| 22 | `citat` | String | Upp till tre ordagranna citat från personen som bäst beskriver tidstjuvar, frustration eller möjligheter. Separera med " \| ". Ta aldrig med citat som innehåller namn på personer, kunder eller adresser, eller som gör det möjligt att förstå vem som sa det. |
| 23 | `komplett` | Boolean | true om samtalet nådde frågan om vad personen skulle lägga fem extra timmar på. false om det avbröts tidigare. |

## Varför två fält är JSON i en sträng

Datainsamlingen har bara fyra typer: String, Boolean, Integer och Number. En lista med arbetsuppgifter går inte att uttrycka på annat sätt än som text. `hamta-samtal.mjs` tolkar strängen och varnar om den inte är giltig JSON. Då finns hela utskriften sparad bredvid, och det är den som gäller.

## Det som inte samlas in

Inget namn, ingen e-post, inget telefonnummer. Företag och `kund_id` kommer från länken och följer med varje samtal som dynamiska variabler.
