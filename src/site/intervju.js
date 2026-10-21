// Intervjusidan. ElevenLabs-widgeten laddas först när besökaren klickat,
// efter att ha sett informationen om AI-intervjun. Inget går till ElevenLabs
// innan dess.
import './intervju.css';
import { INTERVIEW_AGENT_ID } from '../config.js';

const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

const button = document.getElementById('iv-load');
const stage = document.getElementById('iv-stage');

// Widgeten är inställd på always_expanded i ElevenLabs, så den öppnas som en
// stor panel ovanpå sidan, på mobil nästan helskärm. Det läget har ingen egen
// knapp för att fälla ihop, så sidan lägger till en som döljer och visar den.
button?.addEventListener('click', () => {
  const widget = document.createElement('elevenlabs-convai');
  widget.setAttribute('agent-id', INTERVIEW_AGENT_ID);
  document.body.appendChild(widget);

  stage.classList.add('loaded');
  stage.innerHTML = `
    <div class="iv-start">
      <p class="iv-ready">Intervjuaren är öppen.</p>
      <p>Tryck på den lila telefonknappen under bilden. Intervjuaren presenterar sig och frågar om det är okej att ni kör.</p>
      <p>Med knappen längst ner kan du minimera intervjuaren och läsa på sidan. Samtalet fortsätter medan den är minimerad.</p>
    </div>`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'iv-toggle';
  const visa = (synlig) => {
    widget.classList.toggle('iv-hidden', !synlig);
    toggle.textContent = synlig ? 'Minimera intervjuaren' : 'Visa intervjuaren';
    toggle.setAttribute('aria-pressed', String(!synlig));
  };
  toggle.addEventListener('click', () => visa(widget.classList.contains('iv-hidden')));
  visa(true);
  document.body.appendChild(toggle);

  const script = document.createElement('script');
  script.src = WIDGET_SRC;
  script.async = true;
  script.type = 'text/javascript';
  document.body.appendChild(script);
});
