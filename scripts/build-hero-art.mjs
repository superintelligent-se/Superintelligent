// Ritar om de sex bilderna i startsidans topp. Varje scen ritas av
// scripts/hero-art/scenes.html, och Chrome tar en skärmdump av den.
// Kör npm run hero-art efter en ändring och committa PNG:erna.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const page = resolve('scripts/hero-art/scenes.html');
const out = resolve('src/site/hero-art');
mkdirSync(out, { recursive: true });

for (let scene = 0; scene < 6; scene++) {
  const file = `${out}/scen-${scene + 1}.png`;
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--window-size=1280,960',
    '--virtual-time-budget=3000',
    `--screenshot=${file}`,
    `file://${page}?scene=${scene}`,
  ], { stdio: 'ignore' });
  console.log(file);
}
