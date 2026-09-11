# Verificação — 11/09/2026

Testado no navegador integrado do Codex, usando o servidor local http://127.0.0.1:4173.

## Executado

- Desktop 1440 × 900: revisão visual da composição, título, CTA, marca, personagem e rodapé. Captura `desktop.png`.
- Mobile 390 × 844: revisão visual após reposicionar o recorte para preservar o rosto do guardião. CTA inferior em y=723,64, dentro da primeira tela; nenhum overflow horizontal. Captura `mobile.png`.
- Mobile 320 × 568: título ajustado para duas linhas; CTA inferior em y=527,53, dentro da primeira tela; nenhum overflow horizontal. Crescimento vertical permitido. Captura `mobile-320.png` documenta o estado de convite pendente e foco por teclado.
- Tela baixa 1366 × 600: conteúdo cresce para 638 px e permite rolagem normal; nenhum overflow horizontal. CTA íntegro, sem corte de conteúdo.
- Teclado: Tab do link da marca até o CTA; foco visível medido em 2 px e deslocamento de 6 px. Enter exibe a mensagem de convite pendente.
- Clique no CTA não configurado: retorna “O convite da comunidade estará disponível em breve.” na região de status; nenhuma navegação falsa.
- Pausa: botão altera seu nome para “Retomar animações” e `aria-pressed` para `true`. Transformação e opacidade da névoa permaneceram idênticas em leituras separadas após a pausa.
- Imagens da hero e marca carregadas com dimensão natural não nula. Nenhum aviso ou erro capturado no console durante a revisão final.
- `npm run check`: passou. Entrada estática, 12 referências únicas a recursos locais, sintaxe dos módulos JavaScript e 3 logos SVG baseadas em paths.

## Implementado e revisado no código, sem teste de preferência do sistema

- `prefers-reduced-motion`: entrada, parallax e atmosfera deixam de animar; transições de CSS desativadas e partículas ocultadas.
- Página oculta: listeners de visibilidade pausam as animações; o movimento do ponteiro é ignorado.
- Ausência de JavaScript: o HTML e a arte permanecem visíveis; mensagem `noscript` informa a indisponibilidade do convite.

## Limites da verificação

Não foram testados ingresso real no Discord (convite ainda não fornecido), Safari/Firefox, dispositivo físico, leitor de tela, preferência de movimento do sistema, zoom de 200%, nem métricas de campo de desempenho. As capturas são emulação de viewport no navegador, não capturas de um telefone físico.

## Arquivos e armazenamento

Preservados: código em `dist/`, fonte da arte e prompt em `docs/art/`, capturas e este registro em `docs/qa/`, pacote da marca em `docs/brand/` e dependências para reprodução dos assets em `node_modules/`.

Temporário pertencente a esta tarefa: `C:/Dev/MIR4GUARD/.task-tmp/`, criado para intermediários e removido vazio após confirmar caminho absoluto e ausência de reparse point. Nenhum arquivo de usuário foi removido. Espaço final observado na unidade C: 84,66 GiB; não se atribui a variação de espaço à tarefa e não se declara espaço recuperado pela remoção do diretório vazio.

Preview local mantido ativo para revisão. Site registrado, sem publicação concluída: o caminho configurado de `sites-hosting/SKILL.md` deixou de existir durante o trabalho e a busca nos plugins instalados não encontrou outra cópia.
