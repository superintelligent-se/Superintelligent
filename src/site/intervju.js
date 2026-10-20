// Intervjusidan. ElevenLabs-widgeten laddas först när besökaren klickat,
// efter att ha sett informationen om AI-intervjun. Inget går till ElevenLabs
// innan dess.
import './intervju.css';
import { INTERVIEW_AGENT_ID } from '../config.js';

const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

const button = document.getElementById('iv-load');
const stage = document.getElementById('iv-stage');

// ElevenLabs lägger widgeten fast nere till höger i fönstret, oavsett var den
// står i sidan. Rutan visar därför var den finns och hur man börjar.
button?.addEventListener('click', () => {
  const widget = document.createElement('elevenlabs-convai');
  widget.setAttribute('agent-id', INTERVIEW_AGENT_ID);
  document.body.appendChild(widget);

  stage.classList.add('loaded');
  stage.innerHTML = `
    <div class="iv-start">
      <div class="iv-mic" aria-hidden="true">↘</div>
      <p class="iv-ready">Intervjuaren finns nu nere till höger.</p>
      <p>Tryck på <strong>Starta ett samtal</strong>. Intervjuaren presenterar sig och frågar om det är okej att ni kör.</p>
    </div>`;

  const script = document.createElement('script');
  script.src = WIDGET_SRC;
  script.async = true;
  script.type = 'text/javascript';
  document.body.appendChild(script);
});
