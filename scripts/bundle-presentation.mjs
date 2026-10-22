// Packar en presentation till en enda fil att visa ute, skicka eller ladda ner:
// bilderna i material/ och typsnitten bäddas in, så att inget behöver hämtas
// från nätet. Källan är fortfarande index.html i presentationens mapp.
//   npm run presentation -- presentationer/kund/kompetens-5.0/2026-10-modul-4-copilot-premium
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const dir = process.argv[2];
if (!dir || !existsSync(join(dir, 'index.html'))) {
  console.error('Ange presentationens mapp, den som innehåller index.html.');
  process.exit(1);
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif' };
const dataUri = (file) => `data:${MIME[extname(file).toLowerCase()]};base64,${readFileSync(file).toString('base64')}`;

const FONTS = [
  ['Hanken Grotesk', 'hanken-grotesk', [400, 500, 600, 700, 800]],
  ['IBM Plex Mono', 'ibm-plex-mono', [400, 500]],
  ['Silkscreen', 'silkscreen', [400]],
];
const fontCss = FONTS.flatMap(([family, pkg, weights]) =>
  weights.map((w) => {
    const file = resolve('node_modules/@fontsource', pkg, 'files', `${pkg}-latin-${w}-normal.woff2`);
    const b64 = readFileSync(file).toString('base64');
    return `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
  }),
).join('\n');

let html = readFileSync(join(dir, 'index.html'), 'utf8');
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
html = html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, `<style>\n${fontCss}\n</style>`);
// En bild som används en gång bäddas in där den står. En bild som återkommer,
// som logotyperna i sidfoten, bäddas in en gång och sätts på plats när sidan öppnas.
const uses = {};
for (const [, path] of html.matchAll(/src="(material\/[^"]+)"/g)) uses[path] = (uses[path] || 0) + 1;
const shared = {};
html = html.replace(/(src|href)="(material\/[^"]+)"/g, (m, attr, path) => {
  const file = join(dir, path);
  if (!existsSync(file)) throw new Error(`Saknas: ${file}`);
  if (attr === 'src' && uses[path] > 1) {
    shared[path] ??= dataUri(file);
    return `data-src="${path}"`;
  }
  return `${attr}="${dataUri(file)}"`;
});
if (Object.keys(shared).length) {
  const fill = `<script>(() => { const m = ${JSON.stringify(shared)}; document.querySelectorAll('img[data-src]').forEach((i) => { i.src = m[i.dataset.src]; }); })();</script>\n`;
  const at = html.lastIndexOf('<script>');
  html = html.slice(0, at) + fill + html.slice(at);
}

const out = join(dir, `${basename(resolve(dir))}.html`);
writeFileSync(out, html);
console.log(`${out}  ${(html.length / 1024).toFixed(0)} kB`);
