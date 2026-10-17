// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aleksandrivanov.com',
  integrations: [sitemap()],
  // Plain code blocks styled by our own CSS (no inline colour styles from a highlighter).
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
});
