// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * agricultureatlas.org landing — static output.
 * i18n: EN is the default locale at `/`; VI lives at `/vi/`.
 * The AI assistant + H3 map app is served at https://agricultureatlas.org/{lang}/chat
 * (source: apps/agriatlas-web).
 */
export default defineConfig({
  site: 'https://agricultureatlas.org',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', vi: 'vi' },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  server: {
    port: 8080,
    host: true,
  },
});
