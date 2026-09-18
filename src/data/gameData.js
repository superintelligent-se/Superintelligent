// prop förklarar figurens attribut med ett ögonkast — det sitter på rollen,
// aldrig på personen.
export const ROLES = [
  {
    id: 'vd',
    label: 'VD / Ledning',
    blurb: 'Du sätter riktningen för hela bolaget.',
    prop: 'Krona — du bestämmer vart vi ska',
  },
  {
    id: 'chef',
    label: 'Chef',
    blurb: 'Du leder ett team eller en avdelning.',
    prop: 'Headset — i möten hela dagen',
  },
  {
    id: 'medarbetare',
    label: 'Medarbetare',
    blurb: 'Du gör jobbet där AI möter vardagen.',
    prop: 'Kaffemugg — du får saker gjorda',
  },
  {
    id: 'entreprenor',
    label: 'Entreprenör',
    blurb: 'Du är hela organisationen — och dess AI-lead.',
    prop: 'Keps — du bär alla hattar själv',
  },
];

// Varje dimension är också en zon på banan: egen färgton, egen skylt och
// tre frågetecken. tint är zonens bakgrund, gear den utrustning du vinner.
// Ordningen här är ordningen på banan. Ägarskapet först: har ni ingen som
// äger AI-frågan spelar resten mindre roll — och den frågan möter spelaren
// innan röret, så genvägen aldrig tas utan att den är ställd.
// Varje dimension har en egen färg: mynten i HUD:en, zonens ton och
// utrustningen hör ihop visuellt.
//
// summaryBands är det enda spelaren får läsa om sitt eget resultat. En text
// per dimension, vald på antal mynt — aldrig per fråga, aldrig en siffra och
// aldrig ett råd. Den detaljerade tolkningen är rådgivarens och ges i mötet.
// tillMynt är övre gränsen: första bandet vars tillMynt >= myntet vinner.
export const DIMENSIONS = [
  {
    id: 'agarskap',
    label: 'AI-ägarskap',
    color: '#2e9e63',
    tint: 0x0e2a1b,
    tagline: 'Vem håller i rodret?',
    gear: 'companion',
    gearLabel: 'AI-lead: någon går bredvid dig',
    gearWhy:
      'Någon äger AI-frågan hos er. Den personen är skillnaden mellan riktning och drift.',
    summaryBands: [
      { tillMynt: 1, text:
        'Ingen äger AI-frågan hos er ännu. Det är därför initiativ startar och sedan rinner ut — inte för att viljan saknas.' },
      { tillMynt: 2, text:
        'Frågan är väckt men ingen bär den. Det som är allas ansvar blir sällan någons.' },
      { tillMynt: 3, text:
        'Någon har tagit på sig AI-frågan, men mandatet eller tiden räcker inte hela vägen. Det syns i hur snabbt beslut faktiskt fattas.' },
      { tillMynt: 5, text:
        'Ägarskapet finns och det märks. Det är den enskilt största skillnaden mellan bolag som rör sig och bolag som pratar.' },
    ],
  },
  {
    id: 'formaga',
    label: 'AI-förmåga',
    color: '#fbbf24',
    tint: 0x2a2109,
    tagline: 'Vad kan ni redan idag?',
    gear: 'trail',
    gearLabel: 'Fart: hela organisationen är med',
    gearWhy:
      'Tillräckligt många använder AI dagligen. Då sprider sig nya arbetssätt av sig själva.',
    summaryBands: [
      { tillMynt: 1, text:
        'AI är fortfarande teori hos er. Avståndet till dem som använder det dagligen växer varje månad.' },
      { tillMynt: 2, text:
        'Förmågan sitter hos några eldsjälar. Den är deras, inte organisationens — och den går hem klockan fem.' },
      { tillMynt: 3, text:
        'En bra bit av organisationen har hittat sitt sätt. Resten ser det men har inte börjat.' },
      { tillMynt: 5, text:
        'Bred daglig användning. Det är där nya arbetssätt börjar sprida sig utan att någon driver dem.' },
    ],
  },
  {
    id: 'data',
    label: 'Data & kunskapsgrund',
    color: '#4f7fd6',
    tint: 0x0d2738,
    tagline: 'Vad har ni att jobba med?',
    gear: 'datacube',
    gearLabel: 'Datakub: ni hittar er egen data',
    gearWhy:
      'Er data går att hitta och använda. Det är där de flesta AI-projekt fastnar.',
    summaryBands: [
      { tillMynt: 1, text:
        'Datan finns men går inte att nå. Det är här de flesta AI-projekt tar slut, inte i valet av verktyg.' },
      { tillMynt: 2, text:
        'Utspritt och utan kopplingar. Varje ny fråga blir ett detektivarbete innan den blir ett svar.' },
      { tillMynt: 3, text:
        'Delar av huset är i ordning. Det räcker för att komma igång på riktigt, men inte överallt.' },
      { tillMynt: 5, text:
        'Ni har en grund att bygga på. Det är ovanligare än det låter, och det är vad som gör AI till svar i stället för demo.' },
    ],
  },
  {
    id: 'policy',
    label: 'Regler & policy',
    color: '#f97316',
    tint: 0x2e1608,
    tagline: 'Vad får ni göra?',
    gear: 'shield',
    gearLabel: 'Sköld: ni vet vad som gäller',
    gearWhy:
      'Ni har ordning på vad som gäller. Ingen behöver stanna upp och fråga om lov.',
    summaryBands: [
      { tillMynt: 1, text:
        'Inget ramverk på plats. Varje medarbetare gör sin egen tolkning, och ni får veta hur den gick i efterhand.' },
      { tillMynt: 2, text:
        'Samtalet är igång men styr ingenting. Det som inte är skrivet går inte att hålla någon ansvarig för.' },
      { tillMynt: 3, text:
        'Grunden finns men är ojämnt känd. Det märks först när något går snett.' },
      { tillMynt: 5, text:
        'Tydligt och känt. Ingen behöver stanna upp och fråga om lov, och det syns i tempot.' },
    ],
  },
  {
    id: 'mojlighet',
    label: 'Möjlighets-AI',
    color: '#7c3aed',
    tint: 0x2e0f3c,
    tagline: 'Vad skulle ni kunna göra?',
    gear: 'jetpack',
    gearLabel: 'Jetpack: ni når dit ni inte nådde förr',
    gearWhy:
      'Ni tittar bortom effektivisering. Det är där AI slutar spara tid och börjar skapa nytt.',
    summaryBands: [
      { tillMynt: 1, text:
        'Blicken ligger på idag, inte på vad som skulle kunna gå. Det är normalläget — ingen bär runt på en lista över saker de aldrig gjort.' },
      { tillMynt: 2, text:
        'Idéerna finns men är inte formulerade. Därför konkurrerar de aldrig om budget.' },
      { tillMynt: 3, text:
        'Ni har börjat titta bortom effektiviseringen. Nästa fråga är vilken av idéerna som är värd pengar.' },
      { tillMynt: 5, text:
        'Ni bygger nytt, inte bara snabbare. Det är där avståndet till konkurrenterna skapas — och det kopieras inte lika fort.' },
    ],
  },
];

// Utrustningen delas ut först vid tre mynt av fem — svarar ni att allt
// saknas springer ni oskyddade uppför berget. Det är hela poängen.
export const GEAR_THRESHOLD = 3;

export const QUESTIONS = [
  {
    id: 'policy-1',
    short: 'AI-policy',
    dimension: 'policy',
    text:
      'Har ni en intern AI-policy för hur medarbetare får använda AI-verktyg?',
    options: [
      {
        label: 'Nej, ingen alls',
        score: 1,
        short: 'Ingen policy',
        comment:
          'Då står ni utan skyddsnät. Varje medarbetare gör sin egen tolkning av vad som är okej.',
      },
      {
        label: 'Vi pratar om det, inget är skrivet',
        score: 2,
        short: 'Bara prat',
        comment:
          'Samtalet är igång men styr ingenting. Det som inte är skrivet går inte att hålla någon ansvarig för.',
      },
      {
        label: 'Ja, men få känner till den',
        score: 4,
        short: 'Okänd',
        comment:
          'En okänd policy skyddar ungefär lika mycket som ingen policy. Men grunden finns.',
      },
      {
        label: 'Ja, tydlig och känd av alla',
        score: 5,
        short: 'Tydlig & känd',
        comment:
          'Glasklart för alla är ovanligt. Ingen behöver gissa när ett nytt verktyg dyker upp.',
      },
    ],
  },
  {
    id: 'policy-2',
    short: 'GDPR & AI-förordningen',
    dimension: 'policy',
    text:
      'Vet ni hur GDPR och EU:s AI-förordning påverkar de AI-verktyg ni använder idag?',
    options: [
      {
        label: 'Nej, vi har inte tittat på det',
        score: 1,
        short: 'Inte tittat',
        comment:
          'AI-förordningen gäller er oavsett om ni läst den. Okunskap är ingen ansvarsfrihet.',
      },
      {
        label: 'Vi vet att det är relevant, men inte mer',
        score: 2,
        short: 'Bara medvetna',
        comment:
          'Ni vet att räkningen kommer, men inte hur stor den är.',
      },
      {
        label: 'Vi har gjort en översiktlig bedömning',
        score: 4,
        short: 'Översiktligt',
        comment:
          'En översikt tar er längre än de flesta kommer. Detaljerna avgör vid en granskning.',
      },
      {
        label: 'Ja, dokumenterad efterlevnadsbedömning',
        score: 5,
        short: 'Dokumenterat',
        comment:
          'Dokumenterat betyder att ni kan visa det för någon annan. Det är skillnaden mellan att tro och att veta.',
      },
    ],
  },
  {
    id: 'policy-3',
    short: 'Känslig data i AI',
    dimension: 'policy',
    text:
      'Vad händer om en anställd matar in känslig kunddata i ett AI-verktyg idag?',
    options: [
      {
        label: 'Inget stoppar dem',
        score: 1,
        short: 'Inget stoppar',
        comment:
          'Då har er kunddata sannolikt redan lämnat huset. Ni vet bara inte när.',
      },
      {
        label: 'Vi litar på sunt förnuft',
        score: 2,
        short: 'Sunt förnuft',
        comment:
          'Sunt förnuft håller tills någon har bråttom. Det är då det går fel.',
      },
      {
        label: 'Vissa verktyg är godkända, men okontrollerat',
        score: 4,
        short: 'Delvis godkänt',
        comment:
          'En lista utan uppföljning blir en rekommendation. Bättre än inget, sämre än det låter.',
      },
      {
        label: 'Tydliga rutiner och godkända verktyg finns',
        score: 5,
        short: 'Tydliga rutiner',
        comment:
          'Rutiner som faktiskt används är sällsynt. Det här är en styrka att bygga vidare på.',
      },
    ],
  },
  {
    id: 'data-1',
    short: 'Samlad data',
    dimension: 'data',
    text:
      'Hur mycket av er affärsdata ligger samlat och sökbart — jämfört med utspritt i mejl och huvuden?',
    options: [
      {
        label: 'Mest i huvudet på enskilda personer',
        score: 1,
        short: 'I huvudena',
        comment:
          'Kunskapen finns, men den går hem klockan fem. Och en dag slutar den.',
      },
      {
        label: 'Utspritt i system utan koppling',
        score: 2,
        short: 'Utspritt',
        comment:
          'Datan finns men pratar inte med sig själv. Varje fråga blir ett detektivarbete.',
      },
      {
        label: 'Delvis samlat, men inte AI-tillgängligt',
        score: 4,
        short: 'Delvis samlat',
        comment:
          'Halvvägs. Det tunga arbetet är gjort, kopplingen återstår.',
      },
      {
        label: 'Strukturerat och redo för AI',
        score: 5,
        short: 'Redo för AI',
        comment:
          'Då har ni det de flesta saknar. Det är här AI slutar vara demo och börjar ge svar.',
      },
    ],
  },
  {
    id: 'data-2',
    short: 'Data för en agent',
    dimension: 'data',
    text:
      'Om ni byggde en AI-agent imorgon — skulle den ha tillgång till rätt data för att vara användbar?',
    options: [
      {
        label: 'Nej, vi vet inte ens var datan finns',
        score: 1,
        short: 'Vet ej var',
        comment:
          'Då bygger ni en agent som gissar. Den låter övertygande och har fel.',
      },
      {
        label: 'Kanske, men det tar veckor att hitta',
        score: 2,
        short: 'Veckor av letande',
        comment:
          'Veckor av letande per initiativ. Det är där de flesta AI-projekt tystnar.',
      },
      {
        label: 'Ja, för vissa delar av verksamheten',
        score: 4,
        short: 'Vissa delar',
        comment:
          'Ojämnt men användbart. Börja där datan finns, inte där behovet skriker högst.',
      },
      {
        label: 'Ja, vi har en tydlig källa till sanning',
        score: 5,
        short: 'Källa till sanning',
        comment:
          'En källa till sanning är halva AI-arbetet. Många köper verktyg först och upptäcker det här sen.',
      },
    ],
  },
  {
    id: 'data-3',
    short: 'Önskad data',
    dimension: 'data',
    text:
      'Har ni koll på vilken data ni skulle vilja använda AI på, men inte kan idag?',
    options: [
      {
        label: 'Nej, har inte tänkt på det',
        score: 1,
        short: 'Inte tänkt på',
        comment:
          'Då är det svårt att veta vad ni går miste om. Frågan är värd en eftermiddag.',
      },
      {
        label: 'Vagt — några idéer finns',
        score: 2,
        short: 'Vaga idéer',
        comment:
          'Idéerna finns i huvudet men inte på pränt. Därför konkurrerar de aldrig om budget.',
      },
      {
        label: 'Ja, vi har en lista men ingen plan',
        score: 4,
        short: 'Lista utan plan',
        comment:
          'En lista utan plan är en önskelista. Men ni vet i alla fall vad ni vill åt.',
      },
      {
        label: 'Ja, och vi jobbar redan på att lösa det',
        score: 5,
        short: 'Jobbar på det',
        comment:
          'Ni jobbar på flaskhalsen i stället för runt den. Det är rätt ordning.',
      },
    ],
  },
  {
    id: 'formaga-1',
    short: 'Daglig användning',
    dimension: 'formaga',
    text:
      'Hur många av era medarbetare använder AI-verktyg i sina yrkesroller?',
    options: [
      {
        label: 'Nästan ingen',
        score: 1,
        short: 'Nästan ingen',
        comment:
          'Då ligger hela förmågan framför er. Gapet till dem som kommit igång växer varje månad.',
      },
      {
        label: 'Några entusiaster på eget initiativ',
        score: 2,
        short: 'Några entusiaster',
        comment:
          'Eldsjälar bär det. Det fungerar tills de blir trötta eller byter jobb.',
      },
      {
        label: 'Ungefär hälften',
        score: 4,
        short: 'Ungefär hälften',
        comment:
          'Halva organisationen drar ifrån den andra. Det skapar sina egna friktioner.',
      },
      {
        label: 'De allra flesta, varje dag',
        score: 5,
        short: 'De flesta dagligen',
        comment:
          'Bred daglig användning är det som skiljer frontföretagen från snittet.',
      },
    ],
  },
  {
    id: 'formaga-2',
    short: 'Konkreta exempel',
    dimension: 'formaga',
    text:
      'Om du bad tio slumpmässiga medarbetare visa ett konkret sätt de använder AI på i jobbet — hur många skulle kunna det?',
    options: [
      {
        label: 'Ingen',
        score: 1,
        short: 'Ingen',
        comment:
          'Ingen konkret vana ännu. Allt tal om AI är fortfarande teori hos er.',
      },
      {
        label: 'En eller två',
        score: 2,
        short: 'En eller två',
        comment:
          'Två personers vana är inte organisationens förmåga. Den försvinner med dem.',
      },
      {
        label: 'Ungefär hälften',
        score: 4,
        short: 'Hälften',
        comment:
          'Hälften har hittat sitt sätt. Då brukar exemplen börja sprida sig av sig själva.',
      },
      {
        label: 'De flesta, med flera olika exempel',
        score: 5,
        short: 'De flesta',
        comment:
          'Flera exempel per person betyder att de tänker i verktyg, inte i knep. Det är mognad.',
      },
    ],
  },
  {
    id: 'formaga-3',
    short: 'Egen agent',
    dimension: 'formaga',
    text:
      'Har någon hos er byggt eller konfigurerat en egen AI-agent — inte bara chattat med en chatbot?',
    options: [
      {
        label: 'Vad är en agent?',
        score: 1,
        short: 'Vet ej vad det är',
        comment:
          'Då börjar vi där. Skillnaden mot en chatt är att en agent utför, inte bara svarar.',
      },
      {
        label: 'Nej, men vi har hört talas om det',
        score: 2,
        short: 'Bara hört talas om',
        comment:
          'Ni vet att det finns. Steget till första agenten är kortare än de flesta tror.',
      },
      {
        label: 'Vi har testat, inget i produktion',
        score: 4,
        short: 'Testat, ej i drift',
        comment:
          'Test utan produktion ger lärdomar men ingen avkastning. Sista steget är det svåra.',
      },
      {
        label: 'Ja, agenter används i vardagen',
        score: 5,
        short: 'Agenter i drift',
        comment:
          'Agenter i drift betyder att ni passerat demostadiet. Få bolag har gjort det.',
      },
    ],
  },
  {
    id: 'agarskap-1',
    short: 'Utsedd ansvarig',
    dimension: 'agarskap',
    text:
      'Har ni en person som är utsedd och ansvarig för AI-agendan i företaget?',
    options: [
      {
        label: 'Nej, ingen alls',
        score: 1,
        short: 'Ingen ansvarig',
        comment:
          'Utan ägare blir AI allas ansvar, alltså ingens. Det är därför initiativ rinner ut i sanden.',
      },
      {
        label: 'Nej, men vi pratar om att det behövs',
        score: 2,
        short: 'Diskuteras',
        comment:
          'Insikten finns. Den blir värd något först när någon får mandatet.',
      },
      {
        label: 'Ja, men som bisyssla till annat',
        score: 4,
        short: 'Bisyssla',
        comment:
          'En bisyssla får den tid som blir över. Det blir sällan någon.',
      },
      {
        label: 'Ja, tydligt utsedd och på heltid',
        score: 5,
        short: 'Ja på heltid',
        comment:
          'Någon äger frågan på riktigt. Det är största skillnaden mellan bolag som rör sig och bolag som pratar.',
      },
    ],
  },
  {
    id: 'agarskap-2',
    short: 'Omvärldsbevakning',
    dimension: 'agarskap',
    text:
      'Om ett nytt sätt att använda AI lanseras imorgon — vem skulle märka det först och agera?',
    options: [
      {
        label: 'Ingen särskild',
        score: 1,
        short: 'Ingen märker',
        comment:
          'Nyheterna når er via kunder och konkurrenter. Alltid senare än ni hade velat.',
      },
      {
        label: 'En entusiast som nämner det på fikat',
        score: 2,
        short: 'Entusiast på fikat',
        comment:
          'Bevakningen hänger på en person och ett kafferum. Det är en bräcklig kanal.',
      },
      {
        label: 'Någon har koll men saknar mandat',
        score: 4,
        short: 'Koll utan mandat',
        comment:
          'Att veta utan att få agera är frustrerande. Det är också slöseri med den som vet.',
      },
      {
        label: 'Vår AI-ansvariga skulle redan ha en plan',
        score: 5,
        short: 'Plan redan klar',
        comment:
          'Bevakning plus mandat. Så ligger man före i stället för att hinna ikapp.',
      },
    ],
  },
  {
    id: 'agarskap-3',
    short: 'Vem frågar man',
    dimension: 'agarskap',
    text:
      'Vet medarbetarna vem de ska fråga om vilka AI-verktyg som är okej att använda?',
    options: [
      {
        label: 'Nej',
        score: 1,
        short: 'Nej',
        comment:
          'Osäkerhet stoppar folk. De flesta avstår hellre än gör fel.',
      },
      {
        label: 'Osäkert — beror på vem man frågar',
        score: 2,
        short: 'Olika svar',
        comment:
          'Olika svar från olika håll skapar egna tolkningar. Snart har ni flera parallella regler.',
      },
      {
        label: 'De flesta vet, ungefär',
        score: 4,
        short: 'De flesta vet',
        comment:
          'Ungefär räcker i vardagen men inte när något går snett.',
      },
      {
        label: 'Ja, glasklart för alla',
        score: 5,
        short: 'Glasklart',
        comment:
          'Glasklart betyder att ingen behöver gissa. Det syns i hur snabbt nya verktyg kan tas i bruk.',
      },
    ],
  },
  {
    id: 'mojlighet-1',
    short: 'Idéer bortom idag',
    dimension: 'mojlighet',
    text:
      'Om du fick frågan "vad skulle ni kunna göra med AI som ni inte gör idag" — hur snabbt har du ett svar?',
    options: [
      {
        label: 'Jag skulle bli helt blank',
        score: 1,
        short: 'Helt blank',
        comment:
          'Blankt är normalt. Ingen bär runt på en färdig lista över saker de aldrig gjort.',
      },
      {
        label: 'Skulle ta ett tag att komma på något',
        score: 2,
        short: 'Tar ett tag',
        comment:
          'Det finns något där, det är bara inte formulerat. Det brukar räcka med rätt frågor.',
      },
      {
        label: 'Har några idéer redan',
        score: 4,
        short: 'Några idéer',
        comment:
          'Idéer finns. Nästa fråga är vilken av dem som faktiskt är värd pengar.',
      },
      {
        label: 'Flera konkreta initiativ är igång',
        score: 5,
        short: 'Initiativ igång',
        comment:
          'Ni har passerat effektiviseringen och börjat bygga nytt. Det är där avståndet skapas.',
      },
    ],
  },
  {
    id: 'mojlighet-2',
    short: 'Snabbare eller nytt',
    dimension: 'mojlighet',
    text:
      'Använder ni AI för att göra befintligt arbete snabbare — eller även för saker ni inte kunde göra förut?',
    options: [
      {
        label: 'Bara snabbare, inget nytt',
        score: 1,
        short: 'Bara snabbare',
        comment:
          'Effektivisering är rätt start men har ett tak. Konkurrenterna når samma tak.',
      },
      {
        label: 'Mest snabbare',
        score: 2,
        short: 'Mest snabbare',
        comment:
          'Tyngdpunkten ligger på sparad tid. Frågan är vad tiden går till sen.',
      },
      {
        label: 'Både och, i viss mån',
        score: 4,
        short: 'Både och',
        comment:
          'Ni rör er åt rätt håll. Det nya brukar behöva mer skydd än det befintliga.',
      },
      {
        label: 'Vi har lanserat flera helt nya saker tack vare AI',
        score: 5,
        short: 'Lanserat nytt',
        comment:
          'Något nytt i marknaden är ett annat spel än intern effektivisering. Det kopieras inte lika snabbt.',
      },
    ],
  },
  {
    id: 'mojlighet-3',
    short: 'Försprång',
    dimension: 'mojlighet',
    text:
      'Skulle era konkurrenter bli oroliga om de såg vad ni gör med AI just nu?',
    options: [
      {
        label: 'Nej, vi ligger nog efter',
        score: 1,
        short: 'Ligger efter',
        comment:
          'Ärligt svar. Det är också det enda läget som går att göra något åt.',
      },
      {
        label: 'Osäkert',
        score: 2,
        short: 'Osäkert',
        comment:
          'Osäkerhet om egen position brukar betyda att ingen mäter. Det går att ändra.',
      },
      {
        label: 'Kanske lite',
        score: 4,
        short: 'Kanske lite',
        comment:
          'Ni har något, men det är inte avgörande än. Ett försprång som inte märks är inget försprång.',
      },
      {
        label: 'Definitivt — vi ligger före',
        score: 5,
        short: 'Ligger före',
        comment:
          'Ett försprång som syns utåt. Det ska försvaras, inte bara firas.',
      },
    ],
  },
];

export const MAX_DIMENSION_SCORE = 15;
export const COINS_PER_DIMENSION = 5;

// Öppningen i mejlet, vald på summan av alla mynt (0-25). Den sätter tonen
// och säger var i mängden de ligger — utan att ge dem en nivå eller ett tal.
export const SUMMARY_OPENERS = [
  { tillMynt: 6, text:
    'Ni står i början. Det är ett ärligt läge, och det enda som faktiskt går att göra något åt — de flesta bolag vi möter känner igen sig.' },
  { tillMynt: 13, text:
    'Ni har börjat på flera håll, men ingenting bär ännu av sig självt. Det är det vanligaste läget vi ser.' },
  { tillMynt: 19, text:
    'Mycket är på plats hos er. Det som återstår handlar oftast om ordning och ägarskap, inte om teknik.' },
  { tillMynt: 25, text:
    'Ni ligger före de flesta. Då handlar samtalet mindre om att komma igång och mer om att försvara försprånget.' },
];

// Avslutningen är densamma för alla: den säger rakt ut att tolkningen görs
// i mötet, inte i mejlet. Det är hela skälet till att mejlet är övergripande.
export const SUMMARY_CLOSER =
  'Vad det här betyder för just er — var ni tjänar mest på att lägga kraften först, och i vilken ordning — går vi igenom tillsammans. Den genomgången gör vi inte i ett mejl.';

function pickBand(bands, coins) {
  return (bands.find((band) => coins <= band.tillMynt) ?? bands[bands.length - 1]).text;
}

export function summaryForDimension(dimension, coins) {
  return pickBand(dimension.summaryBands, coins);
}

export function summaryOpener(totalCoins) {
  return pickBand(SUMMARY_OPENERS, totalCoins);
}

export function questionsFor(dimensionId) {
  return QUESTIONS.filter((question) => question.dimension === dimensionId);
}
