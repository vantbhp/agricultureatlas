/**
 * Bilingual interface contract shared across the static landing site:
 *  - layout & UI components — consume `t()` and `Dict` keys
 *  - content & legal modules — implement `ui.ts` (`dict` for every key) + `legal.ts`
 * Do not add/remove keys without updating both sides.
 */
export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'] as const;
export const DEFAULT_LANG: Lang = 'en';

export const BRAND_NAME = 'Agriculture Atlas';
export const SITE_URL = 'https://agricultureatlas.org';
export const CHAT_URL = 'https://agricultureatlas.org/en/chat';
export const API_URL = 'https://api.agricultureatlas.org';
export const GITHUB_URL = 'https://github.com/vantbhp/agricultureatlas';
export const CONTACT_EMAIL = 'hello@agricultureatlas.org';
export const PI_NAME = 'Van Le (Lê Thành Văn)';
export const PI_EMAIL = 'van.le@agricultureatlas.org';
export const RESEARCH_EMAIL = 'research@agricultureatlas.org';
export const GRANTS_EMAIL = 'grants@agricultureatlas.org';
export const PI_ORCID_ID = '0009-0005-3514-106X';
export const PI_ORCID_URL = 'https://orcid.org/0009-0005-3514-106X';

/** Localized assistant URL: https://agricultureatlas.org/{lang}/chat */
export function chatUrl(lang: Lang): string {
  return `${SITE_URL}/${lang}/chat`;
}

/** Display form without protocol: agricultureatlas.org/{lang}/chat */
export function chatDisplayUrl(lang: Lang): string {
  return `agricultureatlas.org/${lang}/chat`;
}

/**
 * Prefix a site-relative path for a locale:
 *  - ('/privacy', 'vi')  -> '/vi/privacy/'
 *  - ('/privacy', 'en')  -> '/privacy/'
 *  - ('/research', 'vi') -> '/vi/research/'
 *  - ('/research', 'en') -> '/research/'
 *  - ('/chat', 'en')     -> '/en/chat/' (chat always carries explicit /{lang}/chat)
 */
export function localePath(path: string, lang: Lang): string {
  const clean = path === '/' ? '' : path.replace(/^\/+|\/+$/g, '');
  if (clean === 'chat') return `/${lang}/chat/`;
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return clean ? `${prefix}/${clean}/` : `${prefix}/`;
}

export const DICT_KEYS = [
  // meta
  'meta.title', 'meta.description',
  // header / nav
  'nav.how', 'nav.indices', 'nav.regions', 'nav.data', 'nav.research', 'nav.cta', 'nav.lang_label', 'nav.skip',
  // hero + orbit field experience
  'hero.display', 'hero.title', 'hero.subtitle', 'hero.cta_primary', 'hero.cta_secondary', 'hero.disclaimer',
  'hero.lens_hint', 'art.illustrative',
  'season.label', 'season.flooded', 'season.seedling', 'season.growing', 'season.ripening', 'season.harvest',
  'legend.low', 'legend.high', 'indices.pick',
  // how it works (virtual sensors instead of field hardware)
  'how.title', 'how.lead',
  'how.step1.title', 'how.step1.body',
  'how.step2.title', 'how.step2.body',
  'how.step3.title', 'how.step3.body',
  // 7 reference agronomic indices
  'indices.title', 'indices.lead',
  'indices.soil_moisture.name', 'indices.soil_moisture.desc',
  'indices.et0.name', 'indices.et0.desc',
  'indices.gdd.name', 'indices.gdd.desc',
  'indices.salinity.name', 'indices.salinity.desc',
  'indices.frost.name', 'indices.frost.desc',
  'indices.leaf_wetness.name', 'indices.leaf_wetness.desc',
  'indices.crop_stress.name', 'indices.crop_stress.desc',
  // 4 pilot agro-ecological regions
  'regions.title', 'regions.lead',
  'regions.mekong.name', 'regions.mekong.desc',
  'regions.highlands.name', 'regions.highlands.desc',
  'regions.red_river.name', 'regions.red_river.desc',
  'regions.central_coast.name', 'regions.central_coast.desc',
  // open data sources
  'data.title', 'data.license_note',
  // two surfaces
  'surfaces.title',
  'surfaces.web.name', 'surfaces.web.desc', 'surfaces.web.status',
  'surfaces.mobile.name', 'surfaces.mobile.desc', 'surfaces.mobile.status',
  // final CTA
  'cta.title', 'cta.body', 'cta.primary', 'cta.partner',
  // footer
  'footer.tagline', 'footer.sdg', 'footer.research', 'footer.github', 'footer.privacy', 'footer.terms', 'footer.contact', 'footer.copyright',
  'footer.leadership_heading', 'footer.pi_role', 'footer.pi_email_label', 'footer.grants_email_label', 'footer.grants_direct_label', 'footer.orcid_label',
  // research open-science portal
  'research.meta.title', 'research.meta.description',
  'research.eyebrow', 'research.title', 'research.lead', 'research.disclaimer',
  'research.cta_github', 'research.cta_chat', 'research.cta_back',
  'research.rq.title', 'research.rq.lead',
  'research.rq1.tag', 'research.rq1.title', 'research.rq1.body',
  'research.rq2.tag', 'research.rq2.title', 'research.rq2.body',
  'research.rq3.tag', 'research.rq3.title', 'research.rq3.body',
  'research.rq4.tag', 'research.rq4.title', 'research.rq4.body',
  'research.stack.title', 'research.stack.lead', 'research.stack.compute',
  'research.sku1.role', 'research.sku1.body',
  'research.sku2.role', 'research.sku2.body',
  'research.sku3.role', 'research.sku3.body',
  'research.sku4.role', 'research.sku4.body',
  'research.xval.title', 'research.xval.body',
  'research.citation.title', 'research.citation.lead',
  'research.citation.repo_label', 'research.citation.zenodo_label', 'research.citation.zenodo_status',
  'research.citation.osf_label', 'research.citation.osf_status',
  'research.citation.dataset_label', 'research.citation.dataset_body', 'research.citation.bibtex_label',
  'research.fair.title', 'research.fair.lead',
  'research.fair.f.title', 'research.fair.f.body',
  'research.fair.a.title', 'research.fair.a.body',
  'research.fair.i.title', 'research.fair.i.body',
  'research.fair.r.title', 'research.fair.r.body',
  'research.status.title', 'research.status.lead',
  'research.status.done_label', 'research.status.done_1', 'research.status.done_2', 'research.status.done_3',
  'research.status.pending_label', 'research.status.pending_1', 'research.status.pending_2', 'research.status.pending_3',
  'research.status.note',
  'research.gov.title', 'research.gov.lead',
  'research.gov.pi_label', 'research.gov.orcid_label', 'research.gov.contacts_label', 'research.gov.license_note',
  // legal pages
  'legal.updated', 'legal.back_home',
  // 404
  'notfound.title', 'notfound.body', 'notfound.cta',
] as const;

export type DictKey = (typeof DICT_KEYS)[number];
export type Dict = Record<DictKey, string>;

export interface LegalSection { heading: string; body: string[] }
export interface LegalDoc { title: string; updated: string; sections: LegalSection[] }
export type LegalKind = 'privacy' | 'terms';
