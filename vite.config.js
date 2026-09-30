import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// GitHub Pages serves project sites from /<repo-name>/, so the base path
// must match the repo name. Update REPO_NAME once the repo is created.
const REPO_NAME = 'Superintelligent';

// Sajten har tre sidor: startsidan i roten, spelet på /spelet/ och
// kalkylatorn på /ai-skuld/. public/ ligger kvar i roten så att
// lead-mail.json har samma adress som flödet i Power Automate läser.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        spelet: resolve(import.meta.dirname, 'spelet/index.html'),
        aiSkuld: resolve(import.meta.dirname, 'ai-skuld/index.html'),
      },
    },
  },
});
