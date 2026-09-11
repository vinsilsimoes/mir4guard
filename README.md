# MIR4GUARD

Primeira versão: identidade original, cabeçalho mínimo e hero. HTML semântico, CSS responsivo e GSAP. O diretório `dist/` contém o site completo, pronto para servir como conteúdo estático, sem precisar de Node.js em produção.

## Abrir localmente

Execute `npm run dev` na raiz e abra http://127.0.0.1:4173. O servidor usa apenas recursos nativos de Node.js. `npm run check` verifica referências locais, sintaxe JavaScript e arquivos vetoriais.

## Editar os textos

Com o servidor local aberto, clique em **Editar textos** ou abra `http://127.0.0.1:4173/?editar=1`. Clique nos campos destacados para alterar identificação, título, descrição, texto de apoio e rodapé. O campo **Texto dos botões** atualiza os dois CTAs juntos.

**Salvar no projeto** grava em `dist/content.json`; as alterações permanecem após recarregar e acompanham o site estático. **Concluir** salva as alterações pendentes e fecha o editor. **Baixar textos** exporta um JSON. **Descartar rascunho** restaura todos os campos para a última versão salva. O atalho Ctrl/Cmd+S também salva.

Enquanto você escreve, o navegador guarda um rascunho local. A API de gravação funciona somente no servidor local e impede que uma janela com uma versão antiga sobrescreva uma versão mais recente. Em um conflito, baixe o rascunho antes de recarregar. O modo de edição não é exibido no site publicado.

Verificações: `npm run check` e `node --test scripts/editor-api.test.mjs`. Os testes de gravação utilizam uma cópia temporária dos textos e não alteram o conteúdo do site.

## Convite do Discord

O convite `https://discord.gg/UVWTv3MsT` está configurado em **`dist/scripts/config.js`**, na constante **`DISCORD_INVITE_URL`**, e é utilizado pelos dois botões. Para trocar, atribua outro convite HTTPS em `discord.gg` ou `discord.com/invite/`.

Enquanto o valor estiver vazio ou inválido, os botões exibem “O convite da comunidade estará disponível em breve.” em uma região acessível de status. Quando configurado, ambos viram links HTML para o mesmo destino, abrindo em nova aba com `noopener noreferrer`. A navegação é nativa, sem esperar animações ou analytics. Nenhum analytics foi adicionado.

## Identidade visual

Arquivos transparentes em **`dist/brand/`**:

- `mir4guard-horizontal.svg` e `.png`: wordmark original com emblema carmesim e 4 em dourado envelhecido.
- `mir4guard-monochrome.svg` e `.png`: versão em uma única cor marfim.
- `emblem.svg` e `.png`: emblema isolado; SVG utilizado como favicon.

Os SVGs possuem paths desenhados para cada letra, sem dependência de fontes instaladas, imagens embutidas ou filtros. Os PNGs preservam transparência. O wordmark contém somente MIR4GUARD.

Paleta: carvão `#101414`, marfim `#F2EFE6`, carmesim `#A52832` e dourado envelhecido `#BCA77C`. Título em Cinzel; textos e controles em Barlow, com arquivos WOFF2 locais e licenças preservadas.

## Arte

Arte original produzida com a ferramenta integrada de geração de imagens. Fonte e prompt exato em `docs/art/guardian-original.png` e `docs/art/hero-prompt.txt`. Resolução original: **1672 × 941**; não foi ampliada artificialmente. Derivados WebP: 1672, 1280 e 1000 pixels de largura. Sem hotlinks ou pedidos de imagem a serviços externos durante a visita.

O celular utiliza um arquivo menor e enquadramento próprio definido em CSS; o guardião permanece na área superior, enquanto a leitura ocupa a parte inferior. A ilustração é uma composição única. Névoa e partículas estão em camadas separadas; o personagem não recebe deformações corporais.

A cena agora tem movimento contínuo de câmera, sem depender do mouse: aproximação e deslocamento suaves da ilustração, duas faixas independentes de névoa texturizada, luz suave e brasas ascendentes. A névoa original foi gerada com transparência pela ferramenta integrada; fonte em `docs/art/mist-original.png`, prompt em `docs/art/mist-prompt.txt` e versão WebP de 194.390 bytes em `dist/assets/mist-wisps.webp`. A quantidade de brasas cai de 18 no desktop para 7 no celular, que também reduz a amplitude da câmera. O texto e os botões ficam fora dessas camadas.

As cachoeiras também possuem fluxo descendente: uma textura procedural contínua é recortada aos leitos reais de água, sem deslocar a pedra, os prédios ou o personagem. Duas camadas de nuvens atravessam a região do dragão, usando a textura de névoa existente. Os recortes foram traçados nas coordenadas da arte original e acompanham o zoom e o `object-fit` em desktop e mobile. Esses novos efeitos seguem o mesmo controle de pausa, visibilidade da página e preferência por movimento reduzido.

Para recriar os arquivos otimizados e as versões da marca: `npm ci` e `node scripts/prepare-assets.mjs`. A origem artística é preservada; esse comando reconstrói apenas derivados e arquivos da identidade.

## Organização

- `dist/index.html`: marca, cabeçalho, hero, CTA e aviso discreto de independência.
- `dist/styles.css`: tokens, tipografia, composição, responsividade e estados de interação.
- `dist/atmosphere.css`: camadas de câmera, luz, névoa texturizada e brasas.
- `dist/scripts/config.js`: configuração única do convite.
- `dist/content.json`: textos salvos pelo editor local.
- `dist/scripts/content.js`: validação e aplicação dos textos com nós de texto seguros.
- `dist/scripts/text-editor.js` e `dist/editor.css`: edição por clique e painel local.
- `scripts/editor-api.mjs`: gravação local com verificação de origem e revisão.
- `dist/scripts/discord.js`: estado pendente e links configurados.
- `dist/scripts/atmosphere.js`: câmera contínua, entrada breve, ciclos independentes de névoa e brasas, parallax do ponteiro e pausa completa.
- `dist/scripts/world-effects.js`: alinhamento das máscaras à imagem, correnteza das cachoeiras e nuvens na região do dragão.
- `docs/qa/`: capturas e registro das verificações efetivamente executadas.

Texto e botão permanecem visíveis desde o HTML inicial. Há suporte a `prefers-reduced-motion`, pausa manual e interrupção dos movimentos quando a página está oculta. O movimento do ponteiro afeta apenas a arte, não o texto e o botão. Não há outras seções, dados fictícios, áudio, vídeo, login ou cookies. Apenas o editor local guarda um rascunho dos textos no navegador.

## Entrega e armazenamento

`dist/` é conteúdo autorado e deve ser preservado. `docs/art/` contém a fonte artística e seu prompt; `docs/qa/` contém evidências de revisão. `docs/brand/mir4guard-brand.zip` reúne os seis arquivos finais da marca. `node_modules/` é a instalação usada para reproduzir os derivados. `.task-tmp/` foi removido vazio ao concluir. Não existe processo de limpeza automática.

O site está registrado no Sites com acesso inicial privado. A publicação utiliza os arquivos estáticos de `dist/`; o editor e sua API de gravação continuam exclusivos do ambiente local. Os dois botões de entrada utilizam o convite informado pelo usuário.
