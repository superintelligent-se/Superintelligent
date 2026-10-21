// Intervjusidan. ElevenLabs-widgeten laddas först när besökaren klickar, antingen
// på knappen efter informationen eller på den flytande knappen längst ner. Inget
// går till ElevenLabs innan dess. Widgeten visar själv villkoren innan samtalet.
import './intervju.css';
import { INTERVIEW_AGENT_ID } from '../config.js';

const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

const button = document.getElementById('iv-load');
const stage = document.getElementById('iv-stage');

// Den flytande knappen finns från start och pockar på uppmärksamheten. Första
// klicket laddar intervjuaren; därefter döljer och visar den panelen.
const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'iv-toggle iv-call';
toggle.textContent = 'Prata med intervjuaren';
document.body.appendChild(toggle);

let widget;

// Widgeten är inställd på always_expanded i ElevenLabs, så den öppnas som en
// stor panel ovanpå sidan, på mobil nästan helskärm. Det läget har ingen egen
// knapp för att fälla ihop, så den flytande knappen döljer och visar den.
// visibility i stället för display, så att ett pågående samtal fortsätter.
function visa(synlig) {
  widget.classList.toggle('iv-hidden', !synlig);
  toggle.textContent = synlig ? 'Minimera intervjuaren' : 'Visa intervjuaren';
  toggle.setAttribute('aria-pressed', String(!synlig));
}

function laddaIntervjuaren() {
  widget = document.createElement('elevenlabs-convai');
  widget.setAttribute('agent-id', INTERVIEW_AGENT_ID);
  document.body.appendChild(widget);

  if (stage) {
    stage.classList.add('loaded');
    stage.innerHTML = `
      <div class="iv-start">
        <p class="iv-ready">Intervjuaren är öppen.</p>
        <p>Tryck på den lila telefonknappen under bilden. Intervjuaren presenterar sig och frågar om det är okej att ni kör.</p>
        <p>Med knappen längst ner kan du minimera intervjuaren och läsa på sidan. Samtalet fortsätter medan den är minimerad.</p>
      </div>`;
  }

  toggle.classList.remove('iv-call');
  visa(true);

  const script = document.createElement('script');
  script.src = WIDGET_SRC;
  script.async = true;
  script.type = 'text/javascript';
  document.body.appendChild(script);
}

toggle.addEventListener('click', () => {
  if (!widget) laddaIntervjuaren();
  else visa(widget.classList.contains('iv-hidden'));
});

button?.addEventListener('click', () => {
  if (!widget) laddaIntervjuaren();
  else visa(true);
});
