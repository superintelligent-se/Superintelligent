# Från spelad bana till lead i Teams

Så tas leadet emot, sparas i en Microsoft List i säljkanalen, och så får
spelaren sin sammanfattning per mejl. Allt stannar i er egen Microsoft-miljö.

---

## Rekommendationen

**Ett Power Automate-flöde med HTTP-trigger, ägt av ett konto med en
Power Automate Premium-licens.** Flödet skriver till en Microsoft List som
ligger som flik i säljkanalen, mejlar spelaren sammanfattningen från
support@superintelligent.se och lägger ett kort i kanalen.

Varför den och inte något annat:

- Ingen kod att underhålla och ingen Azure-prenumeration att öppna. Ni har
  redan M365 med adminrättigheter — det är allt som krävs.
- Listan ni vill ha finns redan som Teams-flik. Power Automate skriver rakt
  in i den, och säljarna arbetar där de redan är.
- Mejlet går från er egen brevlåda, med er avsändare och er SPF/DKIM. Ingen
  tredje part ser vare sig namnen eller svaren.
- Byggtid: ungefär en timme, en gång.

**Kostnad: 15 USD per månad.** Premium-licensen behövs bara på det konto som
*äger* flödet — HTTP-triggern är en premiumtrigger, och för automatiska flöden
gäller ägarens licens, inte anroparens. Inga rörliga kostnader per lead, och
inget går att bli överraskad av.

Lägg licensen på ett konto som inte slutar: en delad identitet eller ett
tjänstekonto. Ligger flödet på en privatperson dör insamlingen den dagen
kontot stängs av.

### Om ni hellre vill ha det ännu billigare

**Azure Logic Apps (Consumption)** är samma designer, samma konnektorer och
samma flöde — men betalt per körning i stället för per användare: cirka
0,000125 USD per standardkonnektoranrop. Vid några hundra leads i månaden
landar det på ören. Det kräver en Azure-prenumeration.

Har ni redan Azure: ta Logic Apps, det är strikt billigare och flödet nedan
går att bygga rad för rad på samma sätt. Har ni inte Azure: ta Power Automate.
Att öppna en prenumeration, sätta upp fakturering och lära sig ett andra
portalgränssnitt är inte värt 15 dollar i månaden.

### Vad som valdes bort, och varför

| Alternativ | Varför inte |
|---|---|
| Microsoft Forms | Går inte att skicka till programmatiskt. Formuläret hade fått ersätta slutskärmen, och då är spelet plötsligt ett formulär igen. |
| Azure Functions / Static Web Apps | Billigast av allt (1 miljon anrop gratis per månad), men kräver kod, appregistrering mot Graph och någon som underhåller det. Fel växel för ett kontaktformulär. |
| Dataverse eller ett CRM | Rätt först när säljprocessen kräver det. Flödet nedan får ett extra steg den dagen — spelet behöver inte ändras. |
| Formspree, Netlify Forms och liknande | Namn, företag och svar lämnar er miljö. Det var hela poängen med att stanna i Microsoft. |

---

## Så hänger det ihop

```
Spelet (GitHub Pages)
   │  POST, Content-Type: text/plain, kroppen är JSON
   ▼
Power Automate — HTTP-trigger
   ├─ 1. Grindvakt: nyckel, samtycke, e-post          → annars 400 och stopp
   ├─ 2. Svara 200 direkt                             → spelaren väntar aldrig på oss
   ├─ 3. Dubblettkoll på lead_id                      → samma omgång blir aldrig två rader
   ├─ 4. Skapa post i Microsoft List                  → fliken i säljkanalen
   ├─ 5. Mejla spelaren sammanfattningen              → från support@superintelligent.se
   └─ 6. Lägg ett kort i säljkanalen                  → någon ser leadet inom minuter
```

Två saker i spelets anrop är avsiktliga och får inte "städas bort":

**`Content-Type: text/plain` trots att kroppen är JSON.** Det gör anropet till
en *simple request*, och då hoppar webbläsaren över OPTIONS-preflighten. Varken
Power Automate eller Logic Apps svarar korrekt på en preflight, så byter någon
tillbaka till `application/json` slutar alla inskick att fungera — och felet
syns bara i webbläsarkonsolen, aldrig i flödets körhistorik. Flödet läser
kroppen med `json(string(triggerBody()))` och får samma objekt ändå.

**Varje lead bär ett `lead_id`.** Spelet gör upp till tre försök om nätet
strular. Landar anropet men svaret inte kommer tillbaka ser det likadant ut som
ett rent fel, så ett omtag kan skicka samma lead igen. Dubblettkollen i steg 3
gör att det ändå bara blir en rad. Ett extra försök är billigare än ett tappat
lead.

---

## Steg 1 — Listan

Skapa en Microsoft List i säljteamet: **Teams → säljkanalen → + → Lists →
Skapa en lista → Tom lista**. Döp den till `Leads – Superintelligent Game`.
Den blir en flik i kanalen direkt.

Namnge kolumnerna exakt som nedan. Håll dem fria från å, ä och ö: SharePoint
kodar om sådana tecken i det interna namnet (`Ägarskap` blir
`_x00c4_garskap`), och det interna namnet är det uttrycken använder.
Visningsnamnet går att ändra efteråt.

| Kolumn | Typ | Vad den är till för |
|---|---|---|
| `Title` | Enkel rad (finns redan) | `Företag — Namn`. Det som syns i fliken. |
| `Namn` | Enkel rad | |
| `Foretag` | Enkel rad | |
| `Epost` | Enkel rad | |
| `Mobil` | Enkel rad | Frivilligt i spelet, ofta tomt. |
| `Roll` | Val: VD / Ledning, Chef, Medarbetare, Entreprenör | Vem som spelade. Styr tonen i första samtalet. |
| `Genvag` | Ja/Nej | Ja = tog röret. Inga svar finns, och de vet redan att de behöver hjälp. |
| `Status` | Val: Ny, Kontaktad, Bokad, Avfärdad — standard `Ny` | Säljarnas egen kolumn. Flödet rör den aldrig efter skapandet. |
| `MyntAgarskap` | Tal | 0–5 |
| `MyntFormaga` | Tal | 0–5 |
| `MyntData` | Tal | 0–5 |
| `MyntPolicy` | Tal | 0–5 |
| `MyntMojlighet` | Tal | 0–5 |
| `Utrustning` | Flera rader, oformaterad | Vilken utrustning de fick. Snabbläst bild av var de står. |
| `Svar` | Flera rader, oformaterad | Alla 15 frågor med svar och poäng. Rådgivarens underlag inför mötet. |
| `Poang` | Flera rader, oformaterad | Dimensionspoängen som JSON. |
| `Speltid` | Tal | Sekunder. Lång speltid betyder ofta att någon läste frågorna på riktigt. |
| `Kalla` | Enkel rad | Vilken URL de spelade på. |
| `LeadId` | Enkel rad | Dubblettnyckeln. **Indexera den**: Listinställningar → Indexerade kolumner. |
| `MejlSkickat` | Ja/Nej | Sätts av flödet när sammanfattningen gått iväg. |
| `Rawjson` | Flera rader, oformaterad | Hela inskicket. Försäkring — inget går förlorat om kolumnerna ändras senare. |

Spara en vy `Nya leads` filtrerad på `Status = Ny`, sorterad på `Skapad`
fallande. Det är den vyn säljarna ska ha uppe.

---

## Steg 2 — Flödet

**make.powerautomate.com → Skapa → Automatiserat molnflöde → Hoppa över →**
sök upp triggern **När en HTTP-begäran tas emot**.

Undvik å, ä och ö i namnen på stegen också — namnen dyker upp mitt i
uttrycken, och det blir snabbt svårläst.

### 2.1 Triggern

- **Vem kan utlösa flödet:** `Alla` (spelet är en publik sida utan inloggning).
- **Metod:** `POST`.
- Lämna JSON-schemat tomt. Kroppen kommer som `text/plain` och parsas i nästa steg.

URL:en finns först efter att flödet har sparats. Den är hemlig i den meningen
att den innehåller en signatur — men den ligger i spelets JS-fil och är därmed
offentlig. Det är grindvakten nedan som gör jobbet, inte URL:en.

### 2.2 `Lead` — Skriv (Compose)

```
json(string(triggerBody()))
```

Resten av flödet läser fälten som `outputs('Lead')?['epost']` och så vidare.
Se `docs/flode/exempel-lead.json` för hela strukturen.

### 2.3 `Namn_sakert` — Skriv (Compose)

```
replace(replace(replace(string(outputs('Lead')?['namn']), '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
```

Namnet kommer från ett publikt formulär och ska aldrig gå oescapat in i ett
mejl. Ordningen spelar roll: `&` först, annars escapas de escapade tecknen en
gång till.

### 2.4 `Grindvakt` — Villkor

Lägg fyra villkor, alla måste vara sanna (`Och`). Vänsterled är uttrycket,
operatorn `är lika med`, högerled `true`:

```
equals(outputs('Lead')?['nyckel'], 'superintelligent-game')
equals(outputs('Lead')?['samtycke'], true)
not(empty(outputs('Lead')?['epost']))
less(length(string(outputs('Lead')?['namn'])), 100)
```

Nyckeln stoppar ingen som läser koden, men sorterar bort bottar som skjuter
blint mot allt de hittar. Längdkontrollen fångar den uppenbara sortens skräp.

**I `Om nej`:** lägg en **Svara**-åtgärd med statuskod `400` och sedan
**Avsluta** (status `Cancelled`). Inget mer ska hända.

Resten av stegen ligger i `Om ja`.

### 2.5 `Svara_ok` — Svara

Lägg den **först** i ja-grenen, före allt arbete. Då väntar spelaren aldrig på
SharePoint eller Outlook — den ser sitt kvitto direkt, och resten sker efteråt.

- Statuskod: `200`
- Huvuden:
  | Nyckel | Värde |
  |---|---|
  | `Access-Control-Allow-Origin` | `https://superintelligent-se.github.io` |
  | `Content-Type` | `application/json` |
- Brödtext: `{"ok": true}`

Byts spelet till egen domän måste `Access-Control-Allow-Origin` bytas med.

### 2.6 `Hamta_lead` — SharePoint: Hämta objekt

- Webbplatsadress och lista: den ni skapade i steg 1.
- **Filterfråga:** `LeadId eq '@{outputs('Lead')?['lead_id']}'`
- **Antal överst:** `1`

### 2.7 `Nytt_lead` — Villkor

```
equals(length(body('Hamta_lead')?['value']), 0)
```

**Om nej:** **Avsluta** med status `Succeeded`. Leadet är redan hanterat, det
här var ett omtag.

Allt nedan ligger i `Om ja`.

### 2.8 `Svarslista` — Dataåtgärder: Välj

- **Från:** `outputs('Lead')?['svar']`
- Slå om kartan till textläge (ikonen `T` uppe till höger i rutan), annars får
  ni objekt i stället för rader:

```
@{item()?['dimension']} · @{item()?['fraga']} → @{item()?['svar']} (@{item()?['poang']} p)
```

### 2.9 `Utrustningslista` — Dataåtgärder: Välj (textläge)

- **Från:** `outputs('Lead')?['hud']?['dimensioner']`

```
@{if(item()?['utrustning_vunnen'], item()?['utrustning'], concat('— ingen utrustning: ', item()?['namn']))}
```

Raderna utan utrustning är minst lika intressanta som de med. Det är där
samtalet börjar.

### 2.10 `Skapa_post` — SharePoint: Skapa objekt

| Fält | Värde |
|---|---|
| `Title` | `@{outputs('Lead')?['foretag']} — @{outputs('Lead')?['namn']}` |
| `Namn` | `outputs('Lead')?['namn']` |
| `Foretag` | `outputs('Lead')?['foretag']` |
| `Epost` | `outputs('Lead')?['epost']` |
| `Mobil` | `outputs('Lead')?['mobil']` |
| `Roll` | `outputs('Lead')?['roll']` |
| `Genvag` | `not(equals(outputs('Lead')?['genvag'], 'nej'))` |
| `Status` | `Ny` |
| `MyntAgarskap` | `outputs('Lead')?['hud']?['dimensioner'][0]?['mynt']` |
| `MyntFormaga` | `outputs('Lead')?['hud']?['dimensioner'][1]?['mynt']` |
| `MyntData` | `outputs('Lead')?['hud']?['dimensioner'][2]?['mynt']` |
| `MyntPolicy` | `outputs('Lead')?['hud']?['dimensioner'][3]?['mynt']` |
| `MyntMojlighet` | `outputs('Lead')?['hud']?['dimensioner'][4]?['mynt']` |
| `Utrustning` | `join(body('Utrustningslista'), decodeUriComponent('%0A'))` |
| `Svar` | `join(body('Svarslista'), decodeUriComponent('%0A'))` |
| `MejlSkickat` | `Nej` — sätts till `Ja` i steg 3.6 |
| `Poang` | `string(outputs('Lead')?['dimensionspoang'])` |
| `Speltid` | `outputs('Lead')?['speltid_sekunder']` |
| `Kalla` | `outputs('Lead')?['kalla']` |
| `LeadId` | `outputs('Lead')?['lead_id']` |
| `Rawjson` | `string(outputs('Lead'))` |

> **Indexen 0–4 följer ordningen i `DIMENSIONS` i `src/data/gameData.js`:**
> ägarskap, förmåga, data, policy, möjlighet. Ändras ordningen där måste den
> ändras här. Det är den enda kopplingen mellan kod och flöde som inte upptäcks
> av sig själv — kolumnerna fylls glatt med fel siffror.

---

## Steg 3 — Mejlet till spelaren

Det här är den del som ändrar affären, så det är värt att vara noga med vad som
får stå där.

**Spelaren får:** sina mynt precis som de stod i HUD:en, vilken utrustning de
tog, och **en övergripande kommentar per dimension**.

**Spelaren får inte:** enskilda frågor, enskilda svar, poäng, nivåer, eller vad
de borde göra. Den tolkningen är det ni säljer, och den görs i mötet. Sitter
den i ett mejl finns det ingen anledning att boka mötet.

Texterna finns redan färdiga i `src/data/gameData.js` (`summaryBands` per
dimension, `SUMMARY_OPENERS`, `SUMMARY_CLOSER`) och kommer med i inskicket
under `sammanfattning`. Flödet skriver ingen text själv — det sätter ihop den
som redan är skriven och granskad. Ska en formulering ändras, ändras den i
koden, inte i flödet.

### 3.1 `Myntrader` — Välj (textläge)

- **Från:** `outputs('Lead')?['hud']?['dimensioner']`

```
<tr><td style="padding:5px 0;color:@{item()?['farg']};font-weight:600;">@{item()?['namn']}</td><td style="padding:5px 0;text-align:right;letter-spacing:3px;color:@{item()?['farg']};">@{substring('●●●●●', 0, item()?['mynt'])}@{substring('○○○○○', 0, sub(5, item()?['mynt']))}</td></tr>
```

### 3.2 `Bygg_myntrader` — Skriv

```
join(body('Myntrader'), '')
```

### 3.3 `Dimensionsrader` — Välj (textläge)

- **Från:** `outputs('Lead')?['sammanfattning']?['dimensioner']`

```
<div style="margin:14px 0 0;padding-left:12px;border-left:3px solid @{item()?['farg']};"><p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#f2f5fa;">@{item()?['namn']} <span style="font-weight:400;color:#8892b0;">— @{item()?['mynt']} av @{item()?['av']} mynt</span></p><p style="margin:0;font-size:14px;line-height:1.55;color:#c7d0e4;">@{replace(replace(replace(item()?['kommentar'], '&', '&amp;'), '<', '&lt;'), '>', '&gt;')}</p></div>
```

### 3.4 `Bygg_dimensioner` — Skriv

```
join(body('Dimensionsrader'), '')
```

### 3.5 `Tog_roret` — Villkor

```
equals(outputs('Lead')?['genvag'], 'nej')
```

**Om ja** — skicka sammanfattningen. Åtgärd: **Skicka ett e-postmeddelande från
en delad brevlåda (V2)**.

- **Ursprunglig brevlådeadress:** `support@superintelligent.se`
- **Till:** `outputs('Lead')?['epost']`
- **Ämne:** `Din sammanfattning från The Superintelligent Game`
- **Brödtext:** slå på kodvyn (`</>`) och klistra in
  `docs/flode/mejl-till-spelaren.html`. Byt `{{MYNTRADER}}` mot
  `outputs('Bygg_myntrader')` och `{{DIMENSIONER}}` mot
  `outputs('Bygg_dimensioner')`.

**Om nej** — den som tog röret har inga svar och ska inte lovas en
sammanfattning som inte finns. Skicka ett kort kvitto i stället: *"Tack — vi
har dina uppgifter och hör av oss. Frågorna tar vi när vi ses."*

### 3.6 `Kvittera_mejl` — SharePoint: Uppdatera objekt

Efter mejlet, i båda grenarna: sätt `MejlSkickat` till `Ja` på posten
`body('Skapa_post')?['ID']`. Då syns det i fliken vem som fått sitt mejl, och
en misslyckad utskickning går att upptäcka utan att gräva i körhistoriken.

> **Delad brevlåda kräver behörighet.** Kontot som äger flödet måste ha
> Skicka som-rättighet på `support@superintelligent.se`. Sätts i
> Exchange admin center → Delade brevlådor → Delegering. Utan den kastar
> åtgärden ett `ErrorAccessDenied` — och det märks först på första riktiga leadet.

---

## Steg 4 — Kortet i säljkanalen

Åtgärd: **Microsoft Teams → Publicera adaptivt kort i en chatt eller kanal**.
Publicera som `Flow bot`, i `Kanal`, i säljteamet.

```json
{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "text": "Nytt lead från spelet", "weight": "Bolder", "size": "Medium" },
    { "type": "TextBlock", "text": "@{outputs('Lead')?['foretag']} — @{outputs('Lead')?['namn']}", "size": "Large", "wrap": true },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Roll", "value": "@{outputs('Lead')?['roll']}" },
        { "title": "E-post", "value": "@{outputs('Lead')?['epost']}" },
        { "title": "Mobil", "value": "@{outputs('Lead')?['mobil']}" },
        { "title": "Genväg", "value": "@{outputs('Lead')?['genvag']}" },
        { "title": "Mynt", "value": "Ägarskap @{outputs('Lead')?['hud']?['dimensioner'][0]?['mynt']} · Förmåga @{outputs('Lead')?['hud']?['dimensioner'][1]?['mynt']} · Data @{outputs('Lead')?['hud']?['dimensioner'][2]?['mynt']} · Policy @{outputs('Lead')?['hud']?['dimensioner'][3]?['mynt']} · Möjlighet @{outputs('Lead')?['hud']?['dimensioner'][4]?['mynt']}" }
      ]
    }
  ],
  "actions": [
    { "type": "Action.OpenUrl", "title": "Öppna listan", "url": "BYT-TILL-LISTANS-URL" }
  ]
}
```

Kortet ska räcka för att avgöra vem som ringer, utan att någon behöver öppna
listan. Detaljerna finns i listan när samtalet ska förberedas.

---

## Steg 5 — Koppla in spelet

Spara flödet, kopiera HTTP POST-URL:en från triggern och sätt den i
`src/ui.js`:

```js
const FORM_ENDPOINT = 'https://prod-XX.westeurope.logic.azure.com:443/workflows/...';
```

Pusha till `main`. GitHub Actions bygger och publicerar, och
`npm run build` bakar in URL:en i JS-filen.

### Testa innan ni litar på det

**1. Utan webbläsare** — visar att flödet självt fungerar:

```bash
curl -i -X POST "<FLÖDETS-URL>" \
  -H "Content-Type: text/plain;charset=UTF-8" \
  --data-binary @docs/flode/exempel-lead.json
```

Förväntat: `HTTP/1.1 200`, huvudet `Access-Control-Allow-Origin` i svaret, en
ny rad i listan och ett mejl till `anna@acme.se` — byt adressen i filen till er
egen först, annars går testmejlet till ingenstans.

Kör kommandot **två gånger**. Andra gången ska det fortfarande bli `200` men
**ingen ny rad** — det är dubblettkollen som bevisar sig.

**2. Från webbläsaren** — visar att CORS är på plats. Spela igenom banan på den
publicerade sidan med utvecklarkonsolen öppen. Kommer statusraden *"Tack!
Sammanfattningen är på väg"* fungerar allt.

Får ni i stället felrutan men leadet ändå dyker upp i listan, är det
`Access-Control-Allow-Origin` som inte nått fram: kontrollera stavningen av
origin i `Svara_ok`, och att `Svara_ok` verkligen körs före grenarna som kan
misslyckas. Leadet är räddat av omtagen och dubblettkollen, men spelaren fick
fel besked — och det kostar bokningar.

---

## Säkerhet

Endpointen är publik. Den ligger i en JS-fil som vem som helst kan läsa, och
det går inte att gömma. Det som skyddar är vad som händer efter anropet:

- **Grindvakten** kastar allt utan rätt nyckel, utan samtycke eller utan e-post.
- **Honungsfällan** i formuläret (`webbplats`) är dold för människor men fylls i
  av formulärbottar. Spelet skickar då ingenting alls.
- **Dubblettkollen** gör att samma `lead_id` aldrig blir två rader.
- **Mejlet går bara till adressen i samma inskick.** Ingen kan använda flödet
  för att skicka post till någon annan.
- **All text HTML-escapas** innan den hamnar i mejlet.

Blir endpointen ändå missbrukad: gå in i triggern och välj **Generera ny
åtkomstnyckel**. Den gamla URL:en slutar fungera direkt — glöm inte att
uppdatera `FORM_ENDPOINT` och pusha, annars slutar riktiga leads komma in
samtidigt.

Vill ni ha ett hårdare skydd senare är nästa steg Azure Front Door eller API
Management framför flödet, med hastighetsbegränsning per IP. Det är rätt
åtgärd när ni faktiskt ser missbruk, inte innan.

## Dataskydd

Ni samlar in namn, företag, e-post, eventuellt mobilnummer och 15 svar om
organisationen. Det är personuppgifter och kräver några beslut:

- **Rättslig grund:** samtycke. Kryssrutan på slutskärmen är obligatorisk och
  följer med i inskicket som `samtycke: true`. Grindvakten släpper inte igenom
  ett lead utan den — det är det som gör samtycket till mer än en formulering.
- **Ändamål:** skicka sammanfattningen och ta kontakt om ett första samtal.
  Inget annat. Använd inte listan till utskick som personen inte bad om.
- **Lagring:** i er egen M365-tenant. Med EU Data Boundary stannar datan inom EU.
- **Gallring:** bestäm en gräns — ett år efter senaste kontakt är rimligt — och
  lägg ett schemalagt flöde som tar bort äldre poster. Det är fem minuters
  arbete och det som skiljer en policy från en avsikt.
- **Radering på begäran:** mejlet säger att det räcker att svara på det. Då
  måste någon faktiskt radera raden ur listan när det händer.

Länka till er integritetspolicy från slutskärmen när den finns.

## Kostnad, sammanställt

| Post | Kostnad |
|---|---|
| Power Automate Premium, ett ägarkonto | 15 USD/månad |
| Microsoft List | 0 — ingår i M365 |
| Mejl från delad brevlåda | 0 — ingår i M365 |
| Teams-kort | 0 — ingår i M365 |
| Per lead | 0 |

Med Logic Apps i stället: ingen fast avgift, ören per lead, men en
Azure-prenumeration att förvalta.
