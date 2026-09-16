// Blockiga pixelfigurer, 8x12 rutor. Samma data ritas både i rollvalet (DOM)
// och som spelfigur (Phaser-textur), så avataren du väljer är den du styr.

const SHAPE = [
  '..HHHH..',
  '.HHHHHH.',
  '.SSSSSS.',
  '.SSSSSS.',
  'CCCCCCCC',
  'SCCAACCS',
  'SCCAACCS',
  '.CCCCCC.',
  '.CCCCCC.',
  '.PPPPPP.',
  '.PP..PP.',
  '.BB..BB.',
];

const PALETTES = {
  vd: { H: '#3f4756', S: '#e8b48a', C: '#1f2937', A: '#7c3aed', P: '#111827', B: '#0b0f19' },
  chef: { H: '#6b4423', S: '#e8b48a', C: '#2563eb', A: '#bfdbfe', P: '#1e3a5f', B: '#111827' },
  medarbetare: { H: '#1f2937', S: '#d99b6c', C: '#2e9e63', A: '#86efac', P: '#374151', B: '#1f2937' },
  entreprenor: { H: '#ea7317', S: '#e8b48a', C: '#7c3aed', A: '#fbbf24', P: '#312e81', B: '#1f2937' },
};

export const AVATAR_GRID_WIDTH = SHAPE[0].length;
export const AVATAR_GRID_HEIGHT = SHAPE.length;

export function renderAvatarCanvas(roleId, pixelSize) {
  const palette = PALETTES[roleId] ?? PALETTES.medarbetare;
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_GRID_WIDTH * pixelSize;
  canvas.height = AVATAR_GRID_HEIGHT * pixelSize;

  const ctx = canvas.getContext('2d');
  SHAPE.forEach((row, y) => {
    [...row].forEach((key, x) => {
      const color = palette[key];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  });

  return canvas;
}
