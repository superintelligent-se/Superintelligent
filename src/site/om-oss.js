// Om oss och dess undersidor. Stilarna, och på navsidan en vidarekoppling för
// gamla länkar: laget, syftet och manifestet låg förut på samma sida, så
// /om-oss/#thomas eller /om-oss/#manifest ska landa på rätt undersida.
import './om-oss.css';

const MOVED = {
  laget: 'laget/', thomas: 'laget/', christofer: 'laget/', tomas: 'laget/', martin: 'laget/', ludwig: 'laget/',
  varfor: 'spelregler/', varderingar: 'spelregler/', manifest: 'spelregler/',
};

const hash = location.hash.slice(1);
if (/\/om-oss\/$/.test(location.pathname) && MOVED[hash]) {
  location.replace(`${MOVED[hash]}${hash === 'laget' ? '' : `#${hash}`}`);
}
