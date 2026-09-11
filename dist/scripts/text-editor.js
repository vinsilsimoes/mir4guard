import { COPY_FIELDS, readVisibleCopy, renderCopy, validateCopy } from './content.js';

const DRAFT_KEY = 'mir4guard-copy-draft-v1';

export async function setupTextEditor(initialCopy) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/editor.css';
  document.head.append(stylesheet);

  const launcher = document.createElement('button');
  launcher.className = 'editor-launcher';
  launcher.type = 'button';
  launcher.textContent = 'Editar textos';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'text-editor');
  const panel = document.createElement('aside');
  panel.id = 'text-editor';
  panel.className = 'editor-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Editor de textos');
  panel.innerHTML = `
    <div class="editor-heading"><strong>Editar textos</strong><span id="editor-help">Clique nos textos destacados para escrever.</span></div>
    <div class="editor-actions">
      <button type="button" data-editor-action="save" class="editor-save">Salvar no projeto</button>
      <button type="button" data-editor-action="download">Baixar textos</button>
      <button type="button" data-editor-action="finish">Concluir</button>
    </div>
    <label class="editor-cta-label">Texto dos botões <input name="ctaLabel" type="text" maxlength="60" autocomplete="off" /></label>
    <div class="editor-feedback"><p id="editor-status" role="status" aria-live="polite"></p><button type="button" data-editor-action="undo" class="editor-undo">Descartar rascunho</button></div>`;
  document.body.prepend(panel);
  document.body.append(launcher);

  const status = panel.querySelector('#editor-status');
  const ctaInput = panel.querySelector('input');
  const editable = [...document.querySelectorAll('[data-copy]')].filter(el => el.dataset.copy !== 'ctaLabel');
  let saved = {...initialCopy};
  let revision;
  let savedRevision;
  let active = false;
  let dirty = false;
  let saving = false;
  let available = false;

  function message(text, error = false) {
    status.textContent = text;
    status.dataset.error = String(error);
  }

  function storeDraft() {
    const copy = readVisibleCopy();
    dirty = JSON.stringify(copy) !== JSON.stringify(saved);
    try {
      if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({copy, revision}));
      else localStorage.removeItem(DRAFT_KEY);
      message(dirty ? 'Rascunho guardado neste navegador. Salve para aplicar ao projeto.' : 'Os textos estão salvos no projeto.');
    } catch {
      message('O navegador não guardou o rascunho. Use Salvar no projeto ou Baixar textos.', true);
    }
  }

  function updateCtaLabel() {
    document.querySelectorAll('[data-copy="ctaLabel"]').forEach(el => {el.textContent = ctaInput.value;});
    document.querySelectorAll('a[data-discord-position]').forEach(link => link.setAttribute('aria-label', `${ctaInput.value} (abre em nova aba)`));
    storeDraft();
  }

  function setMode(enabled) {
    active = enabled;
    panel.hidden = !enabled;
    launcher.hidden = enabled;
    launcher.setAttribute('aria-expanded', String(enabled));
    document.body.classList.toggle('is-editing', enabled);
    const url = new URL(location.href);
    if (enabled) url.searchParams.set('editar', '1');
    else url.searchParams.delete('editar');
    history.replaceState(null, '', url);
    editable.forEach(el => {
      if (enabled) {
        el.setAttribute('contenteditable', 'plaintext-only');
        el.setAttribute('role', 'textbox');
        el.setAttribute('aria-label', COPY_FIELDS[el.dataset.copy].label);
        el.setAttribute('aria-describedby', 'editor-help');
        el.tabIndex = 0;
        el.spellcheck = true;
      } else {
        for (const name of ['contenteditable','role','aria-label','aria-describedby','tabindex','spellcheck']) el.removeAttribute(name);
      }
    });
    if (enabled) {
      ctaInput.value = readVisibleCopy().ctaLabel;
      message(dirty ? 'Rascunho recuperado deste navegador. Salve para aplicar ao projeto.' : 'Clique nos textos. Salvar aplica as alterações ao projeto.');
    }
  }

  async function save() {
    if (saving) return false;
    if (!available) {message('O servidor local não está disponível. Baixe seus textos para preservá-los.', true); return false;}
    let copy;
    try {copy = validateCopy(readVisibleCopy());}
    catch (error) {message(error.message, true); return false;}
    saving = true;
    editable.forEach(el => {el.contentEditable = 'false';});
    ctaInput.disabled = true;
    panel.querySelector('[data-editor-action="save"]').disabled = true;
    message('Salvando no projeto…');
    try {
      const response = await fetch('/__editor/content', {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({copy, revision})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar.');
      saved = validateCopy(result.copy);
      revision = result.revision;
      savedRevision = revision;
      renderCopy(saved);
      ctaInput.value = saved.ctaLabel;
      dirty = false;
      try {localStorage.removeItem(DRAFT_KEY);} catch { /* Saving to the project succeeded. */ }
      message('Salvo no projeto. As alterações permanecem após recarregar.');
      return true;
    } catch (error) {
      message(error.message || 'Não foi possível salvar. Seu rascunho foi preservado.', true);
      return false;
    } finally {
      saving = false;
      if (active) editable.forEach(el => {el.contentEditable = 'plaintext-only';});
      ctaInput.disabled = false;
      panel.querySelector('[data-editor-action="save"]').disabled = false;
    }
  }

  function enter() {
    if (saving) return;
    if (!active) {
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
        if (draft?.copy) {
          renderCopy(validateCopy(draft.copy));
          dirty = JSON.stringify(readVisibleCopy()) !== JSON.stringify(saved);
          // Keep its original base revision so a stale draft cannot replace newer copy.
          if (dirty && draft.revision) revision = draft.revision;
        }
      } catch { /* A malformed local draft never replaces the saved project text. */ }
      setMode(true);
    }
  }

  editable.forEach(el => {
    el.addEventListener('input', storeDraft);
    el.addEventListener('keydown', event => {
      if (active && event.key === 'Enter') {event.preventDefault(); el.blur();}
    });
    el.addEventListener('paste', event => {
      if (!active) return;
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain').replace(/\s+/gu, ' ');
      // Preserve the browser's native undo history while stripping pasted markup.
      document.execCommand('insertText', false, text);
    });
  });
  ctaInput.addEventListener('input', updateCtaLabel);
  launcher.addEventListener('click', enter);
  panel.querySelector('[data-editor-action="save"]').addEventListener('click', save);
  panel.querySelector('[data-editor-action="finish"]').addEventListener('click', async () => {
    if (saving || (dirty && !await save())) return;
    setMode(false);
    launcher.focus();
  });
  panel.querySelector('[data-editor-action="undo"]').addEventListener('click', () => {
    if (saving) return;
    renderCopy(saved);
    revision = savedRevision;
    ctaInput.value = saved.ctaLabel;
    storeDraft();
  });
  panel.querySelector('[data-editor-action="download"]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(readVisibleCopy(), null, 2) + '\n'], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mir4guard-textos.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('Download dos textos iniciado.');
  });
  document.addEventListener('keydown', event => {
    if (active && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault(); save();
    }
  });
  document.addEventListener('click', event => {
    if (active && event.target.closest('[data-discord-position], .brand')) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.target.closest('[data-discord-position]')) ctaInput.focus();
    }
  }, true);
  window.addEventListener('beforeunload', event => {
    if (active && dirty) {event.preventDefault(); event.returnValue = '';}
  });

  try {
    const response = await fetch('/__editor/content', {cache: 'no-store'});
    if (!response.ok) throw new Error('Editor indisponível.');
    const result = await response.json();
    saved = validateCopy(result.copy);
    revision = result.revision;
    savedRevision = revision;
    available = true;
  } catch {
    message('Não foi possível conectar ao servidor local. Baixar textos continua disponível.', true);
  }
  if (new URLSearchParams(location.search).get('editar') === '1') enter();
}
