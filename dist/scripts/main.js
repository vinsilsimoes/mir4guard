import { setupDiscord } from './discord.js';
import { setupAtmosphere } from './atmosphere.js';
import { loadCopy } from './content.js';

setupDiscord();
loadCopy().then(async copy => {
  if (['localhost','127.0.0.1','[::1]'].includes(location.hostname)) {
    const { setupTextEditor } = await import('./text-editor.js');
    setupTextEditor(copy);
  }
});
if (document.readyState === 'complete') setupAtmosphere();
else window.addEventListener('load', setupAtmosphere, { once: true });
