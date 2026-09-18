// Blockiga pixelfigurer, 10x14 rutor. Samma data ritas både i rollvalet (DOM)
// och som spelfigur (Phaser-textur), så avataren du väljer är den du styr.
//
// Attributen sitter på rollen, aldrig på personen: krona, headset, kaffemugg
// och idélampa säger något om jobbet — inget om vem som har det.
//
// . transparent  H hår/keps  S hud  E ögon  C kläder  A accent
// P byxor  B skor  K krona  D headset/sockel  M kaffemugg  L lampa

import { renderPixelCanvas } from './pixelart.js';

const SPRITES = {
  vd: [
    '..K.KK.K..',
    '..KKKKKK..',
    '..HHHHHH..',
    '..SSSSSS..',
    '..SEESEE..',
    '..SSSSSS..',
    '.CCCCCCCC.',
    'SCCCAACCCS',
    'SCCCAACCCS',
    '.CCCAACCC.',
    '.CCCCCCCC.',
    '..PPPPPP..',
    '..PP..PP..',
    '..BB..BB..',
  ],
  chef: [
    '...DDDD...',
    '..DDDDDD..',
    '.DDHHHHDD.',
    'DDDSSSSDDD',
    'DDSEESEEDD',
    '.DSSSSSSDD',
    '.CCCCCCCC.',
    'SCCCAACCCS',
    'SCCCCCCCCS',
    '.CCCCCCCC.',
    '.CCCCCCCC.',
    '..PPPPPP..',
    '..PP..PP..',
    '..BB..BB..',
  ],
  medarbetare: [
    '..........',
    '..HHHHHH..',
    '.HHHHHHHH.',
    '..SSSSSS..',
    '..SEESEE..',
    '..SSSSSS..',
    '.CCCCCCCC.',
    'SCCCAACCCS',
    'MMCCCCCCCS',
    'MMCCCCCCC.',
    '.CCCCCCCC.',
    '..PPPPPP..',
    '..PP..PP..',
    '..BB..BB..',
  ],
  entreprenor: [
    '..........',
    '..........',
    '..HHHHHH..',
    'HHHHHHHH..',
    '..SEESEE..',
    '..SSSSSS..',
    '.CCCCCCCC.',
    'SCCCAACCCS',
    'SCCCAACCCS',
    '.CCCCCCCC.',
    '.CCCCCCCC.',
    '..PPPPPP..',
    '..PP..PP..',
    '..BB..BB..',
  ],
};

const PALETTES = {
  vd: {
    K: '#f5c518', H: '#3f4756', S: '#e8b48a', E: '#141821',
    C: '#1f2937', A: '#7c3aed', P: '#111827', B: '#0b0f19',
  },
  chef: {
    D: '#0f172a', H: '#6b4423', S: '#c98d5e', E: '#141821',
    C: '#2563eb', A: '#bfdbfe', P: '#1e3a5f', B: '#111827',
  },
  medarbetare: {
    M: '#f3f4f6', H: '#1f2937', S: '#d99b6c', E: '#141821',
    C: '#2e9e63', A: '#86efac', P: '#374151', B: '#1f2937',
  },
  entreprenor: {
    H: '#ea7317', S: '#8d5a3b', E: '#141821',
    C: '#7c3aed', A: '#fbbf24', P: '#312e81', B: '#1f2937',
  },
};

// Kroppen utan tillbehör — fysiken ska inte bli större för att någon bär krona.
export const BODY_BOUNDS = { x: 1, y: 2, width: 8, height: 12 };

export function renderAvatarCanvas(roleId, pixelSize) {
  return renderPixelCanvas(
    SPRITES[roleId] ?? SPRITES.medarbetare,
    PALETTES[roleId] ?? PALETTES.medarbetare,
    pixelSize,
  );
}
