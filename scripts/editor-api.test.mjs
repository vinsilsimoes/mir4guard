import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdir, readFile, unlink, rmdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createEditorApi } from './editor-api.mjs';

test('Local copy editor persistence and request guards', async t => {
  const directory = resolve('.task-tmp/editor-api-check');
  const file = resolve(directory, 'content.json');
  const original = JSON.parse(await readFile('dist/content.json', 'utf8'));
  await mkdir(directory, {recursive: true});
  await writeFile(file, JSON.stringify(original), 'utf8');
  const api = createEditorApi(file);
  async function request(method, payload, overrides = {}, split = false) {
    const bytes = Buffer.from(typeof payload === 'string' ? payload : payload ? JSON.stringify(payload) : '');
    const req = Readable.from(split ? [...bytes].map(byte => Buffer.from([byte])) : [bytes]);
    req.method = method;
    req.headers = {host: '127.0.0.1:4173', origin: 'http://127.0.0.1:4173', 'content-type': 'application/json', ...overrides};
    let status, body;
    await api(req, {writeHead(value) {status = value;}, end(value) {body = JSON.parse(value);}});
    return {status, body};
  }
  try {
    const initial = await request('GET');
    assert.equal(initial.status, 200);
    await t.test('Saves accented text split across UTF-8 chunks and survives a new reader', async () => {
      const edited = {...original, headline: 'UNIÃO E AÇÃO', description: 'Estratégias, dragões e novos aliados.'};
      const saved = await request('PUT', {copy: edited, revision: initial.body.revision}, {}, true);
      assert.equal(saved.status, 200);
      assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), edited);
      assert.equal((await request('GET')).body.copy.headline, edited.headline);
    });
    await t.test('Rejects stale saves without replacing newer text', async () => {
      const response = await request('PUT', {copy: original, revision: initial.body.revision});
      assert.equal(response.status, 409);
      assert.equal((await request('GET')).body.copy.headline, 'UNIÃO E AÇÃO');
    });
    await t.test('Rejects a foreign origin and host', async () => {
      const current = await request('GET');
      assert.equal((await request('PUT', {copy: original, revision: current.body.revision}, {origin: 'https://example.com'})).status, 403);
      assert.equal((await request('GET', null, {host: 'example.com'})).status, 403);
    });
    await t.test('Rejects empty copy and oversized requests without changing the file', async () => {
      const current = await request('GET');
      assert.equal((await request('PUT', {copy: {...original, headline: ''}, revision: current.body.revision})).status, 400);
      assert.equal((await request('PUT', 'x'.repeat(12001))).status, 413);
      assert.equal((await request('GET')).body.revision, current.body.revision);
    });
  } finally {
    await unlink(file);
    await rmdir(directory);
    const parent = resolve('.task-tmp');
    if ((await readdir(parent)).length === 0) await rmdir(parent);
  }
});
