import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('dist');
const html = await readFile(resolve(root, 'index.html'),'utf8');
const css = await readFile(resolve(root, 'styles.css'),'utf8') + await readFile(resolve(root, 'atmosphere.css'),'utf8');
const hosting = JSON.parse(await readFile('.openai/hosting.json','utf8'));
const { validateCopy } = await import('../dist/scripts/content.js');
validateCopy(JSON.parse(await readFile(resolve(root, 'content.json'),'utf8')));
assert.equal(hosting.static.directory,'dist');
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'The page needs one H1.');
const references = [...html.matchAll(/(?:src|href)="(\/(?!\/)[^"]+)"/g)].map(m=>m[1]);
references.push('/content.json', '/editor.css');
references.push(...[...css.matchAll(/url\(['"]?(\/[^)'"\s]+)/g)].map(m=>m[1]));
references.push(...[...html.matchAll(/(\/assets\/[^\s",]+\.webp)/g)].map(m=>m[1]));
for (const reference of new Set(references)) {
  if (reference === '/') continue;
  assert.ok((await stat(resolve(root,'.'+reference))).size > 0, `Missing asset: ${reference}`);
}
for (const filename of await readdir('dist/scripts')) {
  if (extname(filename) !== '.js') continue;
  const checked = spawnSync(process.execPath,['--check',resolve('dist/scripts',filename)],{encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr);
}
for (const filename of ['mir4guard-horizontal.svg','mir4guard-monochrome.svg','emblem.svg']) {
  const svg = await readFile(resolve('dist/brand',filename),'utf8');
  assert.ok(!/<text[ >]/.test(svg),'Logo must use outlined paths, not text.');
  assert.ok(!/<image[ >]/.test(svg),'Logo must remain vector.');
}
const { DISCORD_INVITE_URL } = await import('../dist/scripts/config.js');
if (DISCORD_INVITE_URL) {
  const url = new URL(DISCORD_INVITE_URL);
  assert.equal(url.protocol,'https:','Use an HTTPS invitation.');
  assert.ok(['discord.gg','discord.com','www.discord.com'].includes(url.hostname),'Use a Discord invite domain.');
}
console.log(`PASS: static entrypoint; ${new Set(references).size} local asset references; JavaScript syntax; 3 path-based SVGs. Discord invitation: ${DISCORD_INVITE_URL ? 'configured' : 'pending'}.`);
