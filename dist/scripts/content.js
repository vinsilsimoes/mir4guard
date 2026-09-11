export const COPY_FIELDS = {
  eyebrow: {label: 'Identificação', max: 90},
  headline: {label: 'Título — primeira linha', max: 70},
  headlineAccent: {label: 'Título — destaque', max: 70},
  description: {label: 'Descrição', max: 450},
  ctaLabel: {label: 'Texto do botão', max: 60},
  microcopy: {label: 'Texto abaixo do botão', max: 180},
  footer: {label: 'Aviso no rodapé', max: 220}
};

export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'];
export const LOCALE_STORAGE_KEY = 'mir4guard-locale-v1';

export function validateCopy(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Textos inválidos.');
  const result = {};
  for (const [key, field] of Object.entries(COPY_FIELDS)) {
    if (typeof value[key] !== 'string') throw new Error(`Preencha ${field.label.toLowerCase()}.`);
    const text = value[key].replace(/\s+/gu, ' ').trim();
    if (!text) throw new Error(`Preencha ${field.label.toLowerCase()}.`);
    if (text.length > field.max) throw new Error(`${field.label}: use até ${field.max} caracteres.`);
    result[key] = text;
  }
  return result;
}

export function readVisibleCopy() {
  return Object.fromEntries(Object.keys(COPY_FIELDS).map(key => [key, document.querySelector(`[data-copy="${key}"]`).textContent.trim()]));
}

export function renderCopy(copy) {
  for (const [key, text] of Object.entries(copy)) {
    document.querySelectorAll(`[data-copy="${key}"]`).forEach(element => {
      element.textContent = text;
      if (key === 'description' && text.includes('MIR4GUARD')) {
        const parts = text.split('MIR4GUARD');
        element.replaceChildren();
        parts.forEach((part, index) => {
          if (index) {
            const strong = document.createElement('strong');
            strong.textContent = 'MIR4GUARD';
            element.append(strong);
          }
          element.append(document.createTextNode(part));
        });
      }
    });
  }
  document.querySelectorAll('a[data-discord-position]').forEach(link => {
    link.setAttribute('aria-label', `${copy.ctaLabel} (abre em nova aba)`);
  });
}

export function normalizeLocale(value) {
  if (typeof value !== 'string') return null;
  const exact = value.trim();
  if (SUPPORTED_LOCALES.includes(exact)) return exact;
  const lower = exact.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  return null;
}

export function localeFromEnvironment() {
  const queryLocale = normalizeLocale(new URLSearchParams(location.search).get('lang'));
  if (queryLocale) return queryLocale;
  const browserLocales = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
  for (const browserLocale of browserLocales) {
    const detectedLocale = normalizeLocale(browserLocale);
    if (detectedLocale) return detectedLocale;
  }
  try {
    const storedLocale = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
    if (storedLocale) return storedLocale;
  } catch { /* A blocked storage API does not prevent language selection. */ }
  return 'pt-BR';
}

export function renderLocale(locale, localeData, baseCopy) {
  const entry = localeData[locale] || localeData['pt-BR'] || {};
  const copy = locale === 'pt-BR' ? baseCopy : validateCopy({...baseCopy, ...(entry.copy || {})});
  renderCopy(copy);
  document.documentElement.lang = locale;
  if (entry.title) document.title = entry.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && entry.description) description.content = entry.description;
  document.querySelectorAll('[data-language]').forEach(button => {
    const selected = button.dataset.language === locale;
    button.setAttribute('aria-pressed', String(selected));
  });
  return copy;
}

export function setupLanguageSwitcher(state) {
  const buttons = [...document.querySelectorAll('[data-language]')];
  if (!buttons.length) return;
  let locale = state.locale;
  const select = nextLocale => {
    const next = normalizeLocale(nextLocale);
    if (!next || next === locale) return;
    if (document.body.classList.contains('is-editing')) {
      const status = document.querySelector('#editor-status');
      if (status) status.textContent = 'Conclua ou salve a edição antes de trocar o idioma.';
      return;
    }
    locale = next;
    try {localStorage.setItem(LOCALE_STORAGE_KEY, locale);} catch { /* Language remains active for this visit. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', locale);
    history.replaceState(null, '', url);
    const copy = renderLocale(locale, state.locales, state.baseCopy);
    window.dispatchEvent(new CustomEvent('mir4guard:locale-change', {detail: {locale, copy}}));
  };
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.language)));
  renderLocale(locale, state.locales, state.baseCopy);
}

export async function loadCopy() {
  const fallback = readVisibleCopy();
  let baseCopy = fallback;
  let locales = {};
  try {
    const response = await fetch('/content.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Não foi possível carregar os textos.');
    baseCopy = validateCopy(await response.json());
  } catch {
    // The authored HTML remains readable if the optional content request fails.
    baseCopy = fallback;
  }
  try {
    const response = await fetch('/locales.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Não foi possível carregar os idiomas.');
    locales = await response.json();
    for (const locale of SUPPORTED_LOCALES) {
      if (!locales[locale]) throw new Error('Idioma ausente.');
      locales[locale].copy = validateCopy({...baseCopy, ...(locales[locale].copy || {})});
    }
  } catch {
    locales = {'pt-BR': {title: document.title, description: document.querySelector('meta[name="description"]')?.content, copy: baseCopy}};
  }
  const locale = localeFromEnvironment();
  const copy = renderLocale(locale, locales, baseCopy);
  return {copy, baseCopy, locale, locales};
}
