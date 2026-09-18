// Delad pixelritare. Allt i spelet ritas från teckenrutnät så att figurer,
// mynt och utrustning hör ihop visuellt utan en enda bildfil.

export function renderPixelCanvas(rows, palette, pixelSize) {
  const canvas = document.createElement('canvas');
  canvas.width = rows[0].length * pixelSize;
  canvas.height = rows.length * pixelSize;

  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((key, x) => {
      const color = palette[key];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  });

  return canvas;
}

export function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift) =>
    Math.max(0, Math.min(255, Math.round(((n >> shift) & 0xff) * factor)));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

const COIN = [
  '..EEE..',
  '.EFFFE.',
  'EFHFFFE',
  'EFHFFFE',
  'EFHFFFE',
  '.EFFFE.',
  '..EEE..',
];

export function renderCoinCanvas(color, pixelSize) {
  return renderPixelCanvas(COIN, {
    E: shade(color, 0.55),
    F: color,
    H: shade(color, 1.45),
  }, pixelSize);
}

// Utrustning du bara får om svaren förtjänar den.
export const GEAR = {
  shield: {
    rows: [
      '.SSSSS.',
      'SSSSSSS',
      'SSAAASS',
      'SSAAASS',
      'SSSSSSS',
      '.SSSSS.',
      '..SSS..',
      '...S...',
    ],
    palette: { S: '#4f7fd6', A: '#bfdbfe' },
  },
  jetpack: {
    rows: [
      'JJJJ',
      'JKKJ',
      'JKKJ',
      'JKKJ',
      'JKKJ',
      'JJJJ',
      '.NN.',
    ],
    palette: { J: '#8b95a8', K: '#7c3aed', N: '#4b5563' },
  },
  thrust: {
    rows: [
      '.FF.',
      'FFFF',
      'FGGF',
      '.FF.',
      '..F.',
    ],
    palette: { F: '#fb923c', G: '#fde047' },
  },
  companion: {
    rows: [
      '.RRRR.',
      'RREERR',
      'RREERR',
      'RRRRRR',
      '.RRRR.',
      '..RR..',
    ],
    palette: { R: '#7c3aed', E: '#e9d5ff' },
  },
  datacube: {
    rows: [
      '.DDD.',
      'DLLLD',
      'DLLLD',
      'DLLLD',
      '.DDD.',
    ],
    palette: { D: '#2f5fa8', L: '#7fb0ee' },
  },
};

export function renderGearCanvas(name, pixelSize, tintColor = null) {
  const gear = GEAR[name];
  if (!tintColor) return renderPixelCanvas(gear.rows, gear.palette, pixelSize);

  // I HUD:en ska utrustningen bära dimensionens färg, så raden hänger ihop.
  const palette = Object.fromEntries(
    Object.keys(gear.palette).map((key, index) => [
      key,
      index === 0 ? tintColor : shade(tintColor, index === 1 ? 1.5 : 0.6),
    ]),
  );
  return renderPixelCanvas(gear.rows, palette, pixelSize);
}
