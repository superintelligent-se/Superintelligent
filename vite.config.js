import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Sajten ligger i roten på www.superintelligent.se (public/CNAME). Sidorna:
// startsidan, spelet på /spelet/, kalkylatorn på /ai-skuld/, röstagenten på
// /intervju/ och /om-oss/ med undersidorna Spelreglerna, Laget och
// Slutspelet. /om-oss/umbarliga/ skickar vidare till Slutspelet. public/ ligger i roten så att
// lead-mail.json har den adress som flödet i Power Automate läser.
//
// Läggs en ny toppmapp till måste den också in i undantaget i Cloudflares
// vidarekoppling till Akademin, se CLAUDE.md.
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        spelet: resolve(import.meta.dirname, 'spelet/index.html'),
        aiSkuld: resolve(import.meta.dirname, 'ai-skuld/index.html'),
        intervju: resolve(import.meta.dirname, 'intervju/index.html'),
        omOss: resolve(import.meta.dirname, 'om-oss/index.html'),
        spelregler: resolve(import.meta.dirname, 'om-oss/spelregler/index.html'),
        laget: resolve(import.meta.dirname, 'om-oss/laget/index.html'),
        slutspelet: resolve(import.meta.dirname, 'om-oss/sa-tanker-vi/index.html'),
        umbarliga: resolve(import.meta.dirname, 'om-oss/umbarliga/index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
