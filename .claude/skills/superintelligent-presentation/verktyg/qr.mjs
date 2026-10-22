// Skriver ut en QR-kod som <svg> att klistra in i .qr på avslutningsbilden.
// Färdig SVG fungerar utan nät, till skillnad från data-qr som ritas från cdnjs.
//   node .claude/skills/superintelligent-presentation/verktyg/qr.mjs https://www.linkedin.com/in/dalebring/
import QRCode from 'qrcode';

const url = process.argv[2];
if (!url) {
  console.error('Ange adressen: node qr.mjs <adress>');
  process.exit(1);
}
const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0a0e17', light: '#ffffff' } });
process.stdout.write(svg.replace('<svg ', '<svg aria-hidden="true" ').replace(/ width="\d+" height="\d+"/, ''));
