import { setupDiscord } from './discord.js';
import { setupAtmosphere } from './atmosphere.js';
import { loadCopy, setupLanguageSwitcher } from './content.js';

setupDiscord();
loadCopy().then(async state => {
  setupLanguageSwitcher(state);
  if (['localhost','127.0.0.1','[::1]'].includes(location.hostname) && state.locale === 'pt-BR') {
    const { setupTextEditor } = await import('./text-editor.js');
    setupTextEditor(state.copy);
  }
});
if (document.readyState === 'complete') setupAtmosphere();
else window.addEventListener('load', setupAtmosphere, { once: true });
