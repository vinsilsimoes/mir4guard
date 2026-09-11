import { DISCORD_INVITE_URL } from './config.js';

export function setupDiscord() {
  const status = document.querySelector('#invite-status');
  let invite;
  try {
    const url = new URL(DISCORD_INVITE_URL);
    const allowed = url.protocol === 'https:' && !url.username && !url.password &&
      ((url.hostname === 'discord.gg' && /^\/[\w-]+\/?$/.test(url.pathname)) ||
       ((url.hostname === 'discord.com' || url.hostname === 'www.discord.com') && /^\/invite\/[\w-]+\/?$/.test(url.pathname)));
    if (allowed) invite = url.href;
  } catch { /* An unset invitation is an expected launch state. */ }

  document.querySelectorAll('[data-discord-position]').forEach((button) => {
    if (invite) {
      const link = document.createElement('a');
      link.className = button.className;
      link.innerHTML = button.innerHTML;
      link.href = invite;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.discordPosition = button.dataset.discordPosition;
      link.setAttribute('aria-label', 'Entrar no Discord (abre em nova aba)');
      button.replaceWith(link);
    } else {
      button.addEventListener('click', () => {
        status.textContent = 'O convite da comunidade estará disponível em breve.';
      });
    }
  });
}
