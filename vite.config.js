import { defineConfig } from 'vite';

// GitHub Pages serves project sites from /<repo-name>/, so the base path
// must match the repo name. Update REPO_NAME once the repo is created.
const REPO_NAME = 'Superintelligent';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
});
