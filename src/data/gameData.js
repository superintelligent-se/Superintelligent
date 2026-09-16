export const ROLES = [
  { id: 'vd', label: 'VD / Ledning', blurb: 'Du sätter riktningen för hela bolaget.' },
  { id: 'chef', label: 'Chef', blurb: 'Du leder ett team eller en avdelning.' },
  { id: 'medarbetare', label: 'Medarbetare', blurb: 'Du gör jobbet där AI möter vardagen.' },
  { id: 'entreprenor', label: 'Entreprenör', blurb: 'Du är hela organisationen — och dess AI-lead.' },
];

// Varje dimension är också en zon på banan: egen färgton, egen skylt och
// tre frågetecken. tint är zonens bakgrund, gear den utrustning du vinner.
export const DIMENSIONS = [
  {
    id: 'policy',
    label: 'Regler & policy',
    color: '#4f7fd6',
    tint: 0x101a2e,
    tagline: 'Vad får ni göra?',
    gear: 'shield',
    gearLabel: 'Sköld: ni vet vad som gäller',
  },
  {
    id: 'data',
    label: 'Data & kunskapsgrund',
    color: '#4f7fd6',
    tint: 0x0e1c2b,
    tagline: 'Vad har ni att jobba med?',
    gear: 'datacube',
    gearLabel: 'Datakub: ni hittar er egen data',
  },
  {
    id: 'formaga',
    label: 'AI-förmåga',
    color: '#2e9e63',
    tint: 0x0d1f18,
    tagline: 'Vad kan ni redan idag?',
    gear: 'trail',
    gearLabel: 'Fart: hela organisationen är med',
  },
  {
    id: 'agarskap',
    label: 'AI-ägarskap',
    color: '#7c3aed',
    tint: 0x170f2b,
    tagline: 'Vem håller i rodret?',
    gear: 'companion',
    gearLabel: 'AI-lead: någon går bredvid dig',
  },
  {
    id: 'mojlighet',
    label: 'Möjlighets-AI',
    color: '#7c3aed',
    tint: 0x1c0f2e,
    tagline: 'Vad skulle ni kunna göra?',
    gear: 'jetpack',
    gearLabel: 'Jetpack: ni når dit ni inte nådde förr',
  },
];

// Utrustningen delas ut först vid tre mynt av fem — svarar ni att allt
// saknas springer ni oskyddade uppför berget. Det är hela poängen.
export const GEAR_THRESHOLD = 3;

export const QUESTIONS = [
  {
    id: 'policy-1',
    dimension: 'policy',
    text: 'Har ni en intern AI-policy för hur medarbetare får använda AI-verktyg?',
    options: [
      { label: 'Nej, ingen alls', score: 1 },
      { label: 'Vi pratar om det, inget är skrivet', score: 2 },
      { label: 'Ett utkast finns, få känner till det', score: 4 },
      { label: 'Ja, tydlig och känd av alla', score: 5 },
    ],
  },
  {
    id: 'policy-2',
    dimension: 'policy',
    text: 'Vet ni hur GDPR och EU:s AI-förordning påverkar de AI-verktyg ni använder idag?',
    options: [
      { label: 'Nej, vi har inte tittat på det', score: 1 },
      { label: 'Vi vet att det är relevant, men inte mer', score: 2 },
      { label: 'Vi har gjort en översiktlig bedömning', score: 4 },
      { label: 'Ja, dokumenterad efterlevnadsbedömning', score: 5 },
    ],
  },
  {
    id: 'policy-3',
    dimension: 'policy',
    text: 'Vad händer om en anställd matar in känslig kunddata i ett AI-verktyg idag?',
    options: [
      { label: 'Inget stoppar dem', score: 1 },
      { label: 'Vi litar på sunt förnuft', score: 2 },
      { label: 'Vissa verktyg är godkända, men okontrollerat', score: 4 },
      { label: 'Tydliga rutiner och godkända verktyg finns', score: 5 },
    ],
  },
  {
    id: 'data-1',
    dimension: 'data',
    text: 'Hur mycket av er affärsdata ligger samlat och sökbart — jämfört med utspritt i mejl, chattar och huvuden?',
    options: [
      { label: 'Mest i huvudet på enskilda personer', score: 1 },
      { label: 'Utspritt i system utan koppling', score: 2 },
      { label: 'Delvis samlat, men inte AI-tillgängligt', score: 4 },
      { label: 'Strukturerat och redo för AI', score: 5 },
    ],
  },
  {
    id: 'data-2',
    dimension: 'data',
    text: 'Om ni byggde en AI-agent imorgon — skulle den ha tillgång till rätt data för att vara användbar?',
    options: [
      { label: 'Nej, vi vet inte ens var datan finns', score: 1 },
      { label: 'Kanske, men det tar veckor att hitta', score: 2 },
      { label: 'Ja, för vissa delar av verksamheten', score: 4 },
      { label: 'Ja, vi har en tydlig källa till sanning', score: 5 },
    ],
  },
  {
    id: 'data-3',
    dimension: 'data',
    text: 'Har ni koll på vilken data ni skulle vilja använda AI på, men inte kan idag?',
    options: [
      { label: 'Nej, har inte tänkt på det', score: 1 },
      { label: 'Vagt — några idéer finns', score: 2 },
      { label: 'Ja, vi har en lista men ingen plan', score: 4 },
      { label: 'Ja, och vi jobbar redan på att lösa det', score: 5 },
    ],
  },
  {
    id: 'formaga-1',
    dimension: 'formaga',
    text: 'Hur många av era medarbetare använder AI-verktyg i sitt dagliga arbete?',
    options: [
      { label: 'Nästan ingen', score: 1 },
      { label: 'Några entusiaster på eget initiativ', score: 2 },
      { label: 'Ungefär hälften', score: 4 },
      { label: 'De allra flesta, varje dag', score: 5 },
    ],
  },
  {
    id: 'formaga-2',
    dimension: 'formaga',
    text: 'Om du bad tio slumpmässiga medarbetare visa ett konkret sätt de använder AI på i jobbet — hur många skulle kunna det?',
    options: [
      { label: 'Ingen', score: 1 },
      { label: 'En eller två', score: 2 },
      { label: 'Ungefär hälften', score: 4 },
      { label: 'De flesta, med flera olika exempel', score: 5 },
    ],
  },
  {
    id: 'formaga-3',
    dimension: 'formaga',
    text: 'Har någon hos er byggt eller konfigurerat en egen AI-agent — inte bara chattat med en chatbot?',
    options: [
      { label: 'Vad är en agent?', score: 1 },
      { label: 'Nej, men vi har hört talas om det', score: 2 },
      { label: 'Vi har testat, inget i produktion', score: 4 },
      { label: 'Ja, agenter används i vardagen', score: 5 },
    ],
  },
  {
    id: 'agarskap-1',
    dimension: 'agarskap',
    text: 'Har ni en person som är utsedd och ansvarig för AI-agendan i företaget?',
    options: [
      { label: 'Nej, ingen alls', score: 1 },
      { label: 'Nej, men vi pratar om att det behövs', score: 2 },
      { label: 'Ja, men som bisyssla till annat', score: 4 },
      { label: 'Ja, tydligt utsedd med mandat', score: 5 },
    ],
  },
  {
    id: 'agarskap-2',
    dimension: 'agarskap',
    text: 'Om ett nytt kraftfullt AI-verktyg lanseras imorgon — vem skulle märka det först och agera?',
    options: [
      { label: 'Ingen särskild', score: 1 },
      { label: 'En entusiast som nämner det på fikat', score: 2 },
      { label: 'Någon har koll men saknar mandat', score: 4 },
      { label: 'Vår AI-ansvariga skulle redan ha en plan', score: 5 },
    ],
  },
  {
    id: 'agarskap-3',
    dimension: 'agarskap',
    text: 'Vet medarbetarna vem de ska fråga om vilka AI-verktyg som är okej att använda?',
    options: [
      { label: 'Nej', score: 1 },
      { label: 'Osäkert — beror på vem man frågar', score: 2 },
      { label: 'De flesta vet, ungefär', score: 4 },
      { label: 'Ja, glasklart för alla', score: 5 },
    ],
  },
  {
    id: 'mojlighet-1',
    dimension: 'mojlighet',
    text: 'Om du fick frågan "vad skulle ni kunna göra med AI som ni inte gör idag" — hur snabbt har du ett svar?',
    options: [
      { label: 'Jag skulle bli helt blank', score: 1 },
      { label: 'Skulle ta ett tag att komma på något', score: 2 },
      { label: 'Har några idéer redan', score: 4 },
      { label: 'Flera konkreta initiativ är igång', score: 5 },
    ],
  },
  {
    id: 'mojlighet-2',
    dimension: 'mojlighet',
    text: 'Använder ni AI för att göra befintligt arbete snabbare — eller även för saker ni inte kunde göra förut?',
    options: [
      { label: 'Bara snabbare, inget nytt', score: 1 },
      { label: 'Mest snabbare', score: 2 },
      { label: 'Både och, i viss mån', score: 4 },
      { label: 'Vi har lanserat något helt nytt tack vare AI', score: 5 },
    ],
  },
  {
    id: 'mojlighet-3',
    dimension: 'mojlighet',
    text: 'Skulle era konkurrenter bli oroliga om de såg vad ni gör med AI just nu?',
    options: [
      { label: 'Nej, vi ligger nog efter', score: 1 },
      { label: 'Osäkert', score: 2 },
      { label: 'Kanske lite', score: 4 },
      { label: 'Definitivt — vi ligger före', score: 5 },
    ],
  },
];

export const MAX_DIMENSION_SCORE = 15;
export const COINS_PER_DIMENSION = 5;

export function questionsFor(dimensionId) {
  return QUESTIONS.filter((question) => question.dimension === dimensionId);
}
