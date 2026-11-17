# Visual R04 · Avaliação inicial

Data: 17/11/2026. Base: `main` em `1047b74` (tag `v3.0.2`, igual à produção e a `origin/main`). Trabalho em `visual-r04`.

## Projeto conferido

- Pasta local `C:\Projetos IA Claude\jogos\cintila3`, remoto `github.com/eduardofatorelli-creator/cintila3`. Árvore limpa antes de criar a branch.
- Vite 6 + TypeScript + Canvas 2D, zero dependência de runtime. Física própria a 120 Hz com 8 subpassos (`src/core/physics.ts`).
- Mesa de 400 × 760 unidades, projetada em trapézio por `core/projection.ts` (uma função `proj`).
- As peças (`game/elements.ts`) se desenham sozinhas por uma interface `Gfx`, implementada pelo `Pintor` (`render/playfield.ts`). Isso é o ponto de entrada para mudar materiais sem tocar em regra.
- O jogo já emite tudo que a apresentação precisa observar: `J.ev(tipo, bola, peça)` (bumper, sling, alvo, rampa, chefe…), `J.fxs` (faíscas, explosões, pontos) e `J.anuncios` (o painel de pontos).
- Arte: cada máquina tem `arte()` (tablado) e `vidro()` (backglass em 3 camadas), escritas com a caixa de ferramentas `render/tema.ts`. Não há imagem nenhuma; tudo é gerado por código.
- Não existem arquivos de arte de referência do Cintila 3 na máquina (procurados em Downloads, Desktop e na pasta de projetos: nada além das capturas do README em `docs/`). A "máquina futurista de referência" citada no pedido não foi encontrada como imagem; foi usada só como descrição.

## Linha de base (medida antes de mexer)

| Item | Resultado |
|---|---|
| `npm test` (regras, 30 máquinas, drenos, palhetas) | 67 de 67; dreno lateral 30 de 494 (6,1%) |
| `npm run build` | ok, 211,3 kB (71,9 kB gzip) |
| Tempo de script por quadro, 4 bolas + 300 partículas (`test/perf.mjs`, desktop) | mediana 1,2 ms, p95 20,5 ms |
| Cadência real | 16,7 ms (60 fps) |
| Toque com CPU 4× e 6× sem GPU (`SEM_GPU=1 node test/celular.mjs`) | 16,7 ms, 60 fps |

Capturas em `evidencias/visual-r04/antes/` (fora do Git): 1920×1080, 1440×900, 768×1024, 390×844, 360×800; mapa, Aurora, Abissal, Cidade Neon, transição para o andar, modo chefão, andar bônus, chefe na mesa, modo mago e resultado. Script: `node test/capturas.mjs antes`.

## Diagnóstico

1. **Composição no desktop.** Em 1440×900 a mesa ocupa uma coluna central de ~360 px; dois terços da tela são preto liso. O painel lateral é texto solto, sem moldura, e não pertence ao gabinete.
2. **Backbox.** O painel de pontos é um retângulo preto que cobre metade do backglass; a arte aparece só como faixa. Não há moldura de alto-falante, cromados ou vidro.
3. **Gabinete.** As laterais são trapézios escuros com uma cópia esticada do backglass; não leem como metal pintado. Não há trilhos cromados, barra de travamento, nem reflexo de vidro.
4. **Tablado.** As ilustrações são esquemáticas: gradiente + ondas + anéis + o nome da máquina no meio. Aurora, Abissal e Cidade Neon usam a mesma gramática (anéis em volta do chefe, texto central, brilho radial). A identidade vem quase só da cor.
5. **Peças.** Bumpers, postes e alvos são cilindros de cor chapada com uma elipse branca; palhetas e paredes são faixas planas. Não há material (cromo, latão, acrílico, borracha) nem diferença entre máquinas.
6. **Luzes do tablado.** Todos os insertos são elipses iguais; não há forma de seta, moldura nem reflexo.
7. **Efeitos.** Faíscas e explosões genéricas, iguais para bumper, alvo e chefe. Não há onda de choque, rastro de rampa, nem partícula temática.
8. **Transições.** A subida ao andar é um escurecimento + descida do campo; volta, chefe, mago e desbloqueio não têm tratamento próprio na mesa (só no painel de pontos). Não há entrada de máquina.
9. **Mapa.** Grade 5 colunas com o backglass como miniatura; as bloqueadas ficam quase pretas (grayscale + brilho 0,28), o tema some. No celular são 3 colunas com nomes cortados por reticências.
10. **Andar de cima / subfases.** Textura genérica (grade + anéis + raios) igual em todas as máquinas.
11. **Legibilidade.** A bola é clara e lê bem; o risco de qualquer arte nova está na metade de baixo (palhetas e canaletas), que precisa continuar escura e calma.
12. **Erro encontrado durante a captura em 390×844:** `TypeError: Cannot read properties of null (reading 'def')` numa sequência de recarga com toque emulado. Investigado na fase de QA.

## O que não muda

Física, geometria, colisões, velocidades, gravidade, regras, pontuação, progressão, desbloqueio, chaves do `localStorage`, controles. A camada nova só lê o estado do jogo.
