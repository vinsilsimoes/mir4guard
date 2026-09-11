# Revisão da animação — 11/09/2026

O usuário escolheu cena em camadas, com câmera, névoa e brasas. A ilustração aprovada foi preservada; não foram animadas partes do corpo nem gerado um vídeo do personagem.

## Verificado no navegador

- Desktop 1440 × 900: câmera, névoa e brasas apresentaram transformações diferentes em leituras separadas; título e CTA mantiveram exatamente os mesmos retângulos de layout durante a animação.
- Pausar: estado `paused` e `aria-pressed=true`; transformações da câmera, névoa e brasas permaneceram idênticas entre leituras com uma captura de tela entre elas. Retomar voltou ao estado `playing`.
- Mobile 390 × 844: câmera e névoa continuam animadas com amplitude reduzida; 7 brasas, contra 18 no desktop. CTA permaneceu na mesma posição, com borda inferior em 723,64 px, dentro da primeira tela.
- Revisão visual desktop/mobile: névoa perceptível, rosto preservado e leitura mantida. Capturas `atmosphere-desktop.png` e `atmosphere-mobile.png`.
- Verificação estática: `npm run check` passou com 14 referências locais, sintaxe dos módulos e logos vetoriais. Novo WebP da névoa carregado localmente e com alpha.
- Console final: nenhum erro ou aviso capturado. `atmosphere-preview.webp` é uma gravação do preview, com 24 quadros ao longo de aproximadamente 9,6 segundos, largura de 960 px e 378.596 bytes. O site anima continuamente; o trecho gravado reinicia no fim.

`prefers-reduced-motion` e pausa ao ocultar a página foram mantidos e revisados no código. Não se alega teste da preferência de movimento no sistema operacional, nem teste de navegador móvel físico. Convite real do Discord continua pendente.

Novos arquivos permanentes desta revisão: `dist/atmosphere.css`, `dist/assets/mist-wisps.webp`, `docs/art/mist-original.png`, `docs/art/mist-prompt.txt`, este registro, suas capturas e o preview animado. Nenhuma instalação adicional nem limpeza de arquivos alheios.

Intermediários desta revisão: `C:/Dev/MIR4GUARD/.task-tmp/atmosphere-frames/` continha 24 capturas numeradas e `delays.json`. Os 25 arquivos e o diretório vazio foram removidos após validar caminho, nomes e ausência de reparse points; a gravação final foi preservada em `docs/qa/atmosphere-preview.webp`.
