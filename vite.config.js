import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Sajten ligger i roten på www.superintelligent.se (public/CNAME). Fyra
// sidor: startsidan, spelet på /spelet/, kalkylatorn på /ai-skuld/ och
// röstagenten på /intervju/. public/ ligger i roten så att lead-mail.json
// har den adress som flödet i Power Automate läser.
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
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
