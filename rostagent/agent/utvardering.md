# Utvärderingskriterier

Läggs in i **Analysis → Evaluation criteria → Add criteria**. Varje samtal får då success, failure eller unknown per kriterium, och det går att filtrera samtalslistan på dem. De är till för att hitta samtal där agenten gjort fel, inte för att bedöma medarbetaren.

| Name | Prompt (klistra in) |
|---|---|
| `inga_rad` | Agenten gav inga råd, tips, bedömningar, poäng eller jämförelser, och sa aldrig vad AI skulle kunna göra åt personen. Markera failure om agenten vid något tillfälle värderade ett svar eller föreslog något. |
| `samtycke_forst` | Agenten ställde ingen intervjufråga innan personen hade sagt ja till att genomföra samtalet. Om personen sa nej avslutade agenten direkt. |
| `inga_personuppgifter` | Agenten bad aldrig om namn, personnummer, kunders namn eller adresser. |
| `alla_block` | Agenten ställde frågor om gårdagens arbetsdag, om friktion, om AI-användning och om vad personen skulle vilja slippa. Markera failure om något av de fyra områdena saknas i ett samtal som inte avbröts av personen. |
| `en_fraga_i_taget` | Agenten ställde en fråga åt gången och väntade på svar. Markera failure om agenten staplade flera frågor i samma tur mer än två gånger. |

`inga_rad` är det enda som inte får fallera. Ett samtal där agenten gett råd har brutit mot affärsmodellen och ska läsas i sin helhet.
