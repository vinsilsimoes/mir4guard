export const COPY_FIELDS = {
  eyebrow: {label: 'Identificação', max: 90},
  headline: {label: 'Título — primeira linha', max: 70},
  headlineAccent: {label: 'Título — destaque', max: 70},
  description: {label: 'Descrição', max: 450},
  ctaLabel: {label: 'Texto do botão', max: 60},
  microcopy: {label: 'Texto abaixo do botão', max: 180},
  footer: {label: 'Aviso no rodapé', max: 220}
};

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

export async function loadCopy() {
  const fallback = readVisibleCopy();
  try {
    const response = await fetch('/content.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Não foi possível carregar os textos.');
    const copy = validateCopy(await response.json());
    renderCopy(copy);
    return copy;
  } catch {
    // The authored HTML remains readable if the optional content request fails.
    return fallback;
  }
}
