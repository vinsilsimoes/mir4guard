# Cachoeiras e nuvens — 11/09/2026

Escopo: fluxo das cachoeiras e nuvens na região do dragão, conforme a recomendação aprovada pelo usuário. Arte original preservada. Nenhuma nova dependência, vídeo de fundo ou deformação do personagem.

## Implementação

- Máscaras vetoriais nas coordenadas da imagem original, limitadas aos leitos de água.
- Textura procedural com repetição contínua a cada 72 unidades; deslocamento somente descendente, sem inversão no fim do ciclo.
- Duas camadas da textura de névoa existente, movidas em ritmos diferentes dentro de uma máscara suave ao redor do dragão.
- Imagem e efeitos compartilham o mesmo contêiner da câmera. O módulo `world-effects.js` reproduz o dimensionamento e a posição de `object-fit: cover`, usando dimensões fracionárias e atualizando após resize e carregamento de imagem responsiva.
- Animações registradas no mesmo controlador de pausa, visibilidade e movimento reduzido.

## Verificação executada

- Desktop 1440 × 900: a transformação da correnteza e as matrizes de posição de ambas as nuvens mudaram entre leituras. Os retângulos do título e do CTA permaneceram exatamente iguais.
- Pausa: o estado passou para `paused`; correnteza e ambas as nuvens mantiveram exatamente as mesmas transformações em leituras separadas por uma captura de tela. Retomar restabeleceu o movimento.
- Redimensionamento para mobile 390 × 844 sem recarregar: recorte e animações se ajustaram; nenhuma rolagem horizontal. CTA inferior em y=723,64, dentro da primeira tela.
- Erro máximo medido de alinhamento da camada em relação à imagem: aproximadamente 0,015 px no desktop e 0,014 px no mobile.
- Recorte intermediário 811 × 912: erro máximo de aproximadamente 0,016 px e nenhuma rolagem horizontal.
- Revisão visual das capturas `world-effects-desktop.png` e `world-effects-mobile.png`.
- `npm run check` passou: 14 referências locais, sintaxe dos módulos e SVGs da marca.
- Console final sem erros ou avisos capturados. `world-effects-preview.webp`: gravação de 24 quadros, aproximadamente 9,7 segundos, 960 × 600 e 428.578 bytes. O trecho gravado reinicia; o site mantém seus ciclos contínuos.

Preferência por movimento reduzido e pausa ao ocultar a página foram revisadas no código; não se alega teste da preferência do sistema operacional. O convite real do Discord continua pendente.

## Arquivos da tarefa

Preservados: novo módulo `dist/scripts/world-effects.js`, alterações em `dist/index.html`, `dist/atmosphere.css`, `dist/scripts/atmosphere.js`, README e evidências em `docs/qa/`.

Intermediários pertencentes a esta revisão: `C:/Dev/MIR4GUARD/.task-tmp/world-effects/water-inspection.png` (ampliação para traçar máscaras) e a pasta `frames/` no mesmo local (24 quadros e `delays.json`). Foram removidos após verificar a gravação final e validar caminhos, conteúdo e ausência de reparse points. As capturas e o preview animado foram preservados em `docs/qa/`.
