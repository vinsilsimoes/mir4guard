import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateCopy } from '../dist/scripts/content.js';

const revision = text => createHash('sha256').update(text).digest('hex');

export function createEditorApi(contentPath) {
  let writes = Promise.resolve();
  async function snapshot() {
    const raw = await readFile(contentPath, 'utf8');
    return {copy: validateCopy(JSON.parse(raw)), revision: revision(raw)};
  }
  function json(response, status, body) {
    response.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
    response.end(JSON.stringify(body));
  }
  return async (request, response) => {
    const host = request.headers.host;
    if (!['127.0.0.1:4173', 'localhost:4173'].includes(host)) {
      json(response, 403, {error: 'Editor disponível apenas no preview local.'}); return;
    }
    if (request.method === 'GET') {
      try {json(response, 200, await snapshot());}
      catch {json(response, 500, {error: 'Não foi possível ler os textos do projeto.'});}
      return;
    }
    if (request.method !== 'PUT') {json(response, 405, {error: 'Método não permitido.'}); return;}
    // Fixed file, loopback server, same-origin JSON requests; no arbitrary paths.
    if (request.headers.origin !== `http://${host}` || !request.headers['content-type']?.startsWith('application/json')) {
      json(response, 403, {error: 'Abra o editor no preview local para salvar.'}); return;
    }
    try {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of request) {
        const buffer = Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > 12000) {json(response, 413, {error: 'Conteúdo muito grande.'}); return;}
        chunks.push(buffer);
      }
      const body = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(body);
      const copy = validateCopy(payload.copy);
      const save = async () => {
        const current = await snapshot();
        if (payload.revision !== current.revision) {
          json(response, 409, {error: 'Os textos foram alterados em outra janela. Baixe seu rascunho antes de recarregar.'}); return;
        }
        const raw = JSON.stringify(copy, null, 2) + '\n';
        await writeFile(contentPath + '.tmp', raw, 'utf8');
        await rename(contentPath + '.tmp', contentPath);
        json(response, 200, {copy, revision: revision(raw)});
      };
      const pending = writes.then(save);
      writes = pending.catch(() => {});
      await pending;
    } catch (error) {
      const validation = error instanceof SyntaxError || (error instanceof Error && /^(Preencha|Textos inválidos|.*: use até)/.test(error.message));
      json(response, validation ? 400 : 500, {error: validation ? error.message : 'Não foi possível salvar. Seu rascunho continua no editor.'});
    }
  };
}
