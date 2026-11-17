# Visual R04 · Arquitetura visual

## Princípio

A apresentação **observa** o jogo e nunca o conduz. Nenhum arquivo de `src/core/` (física, geometria, entrada, áudio) nem de `src/game/` (regras, peças, chefes, subfases, assinaturas) foi alterado. `src/machines/` também não. O que mudou fica em `src/visual/` (novo), `src/render/`, `src/main.ts`, `src/ui.ts` e uma preferência nova em `src/core/storage.ts`.

## Módulo `src/visual/`

| Arquivo | Papel |
|---|---|
| `manifesto.ts` | Manifesto das 30 máquinas, **indexado pelo `id`** (nunca pela posição): conceito, material, forma de inserto, ambiente, partícula, choque, luz e o efeito ligado à mecânica. 12 materiais em `MATERIAIS`. Não repete nada de `MachineDef`. |
| `pincel.ts` | `Pincel extends Tema`: gradientes, névoas, cortinas de aurora, feixes, silhuetas, pedras, chapas rebitadas, hachura, rosetas, letreiro metálico, setas de pista, grão e vinheta. Funções `alfa()` e `tom()`. |
| `cenas.ts` | Uma cena autoral por máquina (`CENAS[id]`) e o `acabamento()` comum. As cenas recebem `InfoMesa` com as posições reais das peças já montadas (bumpers, chefe, rampas e caminhos, órbitas, peças da assinatura). `infoPadrao()` aproxima as posições a partir do layout quando ainda não há mesa (backglass, miniaturas). |
| `index.ts` | `texturaMesa()` (cena + acabamento, com recuo para a arte antiga se algo falhar), `texturaAndar()` (andar de cima e subfases com a cena da máquina apagada + emblema do tipo de fase), `aplicaVisual()` (material/inserto/luz no Pintor), `movimentoReduzido()`. |
| `ambiente.ts` | Camada viva por máquina, entre o tablado parado e as peças. 18 a 30 elementos; `forca` (mago 2×, multibola 1,4×, econômico 0,6×), `leve` (sem faixas de área grande) e `reduzido`. |
| `eventos.ts` | `EfeitosVisuais`: observa os eventos de mesa e desenha choques (8 formas), cortes de estilingue, cometas que percorrem caminhos reais (rampas, órbitas, canos da Boca, trilhos da perseguição, constelação) e partículas temáticas (14 formas). Máximo de 24 efeitos e 70 partículas (40 em toque). |
| `apresentacao.ts` | Entrada da máquina (pulável), letreiros no backglass, bordas de estado, transição do andar e do túnel, reflexo do vidro em cache. |
| `paineis.ts` | Placas laterais do desktop (só quando sobra largura). |

## Como a camada observa o jogo

1. **Eventos de mesa.** Em `main.ts`, ao carregar a máquina, `J.ev` é envolvido: a função original roda primeiro, inteira, e só depois o observador recebe `(tipo, bola, peça)`, dentro de `try/catch`. O observador não escreve em nada do jogo. É a única "costura" com a simulação e fica em `main.ts`, sem mexer em `game/`.
2. **Anúncios.** `apres.observa(J.anuncios)` lê a fila antes de o painel de pontos consumi-la (sem alterar a fila).
3. **Estado.** Bordas, transições e painéis leem `J.mago`, `J.multibola`, `J.m.chefe.vida`, `J.trans`, `J.sub`.

Os testes de regra (`npm test`) não carregam `main.ts`, então a física e as regras são verificadas exatamente como antes; o teste de navegador e o `test/visual.mjs` rodam com a camada ligada.

## Ordem de desenho (por quadro)

1. Fundo pré-renderizado (cache por máquina e tamanho): sala, gabinete, tablado deformado + paredes fixas, backbox parado.
2. Ambiente vivo (`ambiente.desenha`), dentro de `desenhaCampo`, antes das luzes.
3. Insertos (`luzes`) e peças em ordem de pintor (y), palhetas e bolas — materiais do `Pintor`.
4. Partículas antigas + efeitos de acerto novos.
5. Andar de cima / subfase descendo (quando houver), com a textura temática.
6. Bloom (desktop).
7. Bordas de estado, transição, reflexo do vidro (só fora do modo econômico).
8. Backbox com paralaxe e painel de pontos; letreiro de evento no backglass.
9. Painéis laterais (cache a 8 Hz, cópia só dos retângulos), botões, cartas de escolha, clarão (limitado), entrada da máquina.

## Cache e memória

- **Tablado:** 1 canvas 800 × 1520 por máquina carregada (substituído ao trocar de máquina). A camada base deformada continua no cache antigo (`camadaBase`, até 6 entradas).
- **Fundo da tela:** 1 canvas do tamanho da tela, refeito só em mudança de máquina ou de tamanho.
- **Backbox:** 3 camadas 800 × 456 + moldura em cache por tamanho e material.
- **Gradientes de peça:** mapa por cor e raio no `Pintor` (limpo ao passar de 500).
- **Miniaturas do mapa:** geradas **sob demanda**, uma por vez em `requestIdleCallback`, e guardadas na sessão. A vitrine (máquina selecionada) é gerada na hora. Nenhuma arte das 30 é gerada ao iniciar o jogo.
- **Reflexo do vidro e painéis:** canvas próprios, refeitos só em mudança de tamanho (reflexo) ou a 8 Hz (painéis).

## Qualidade adaptativa

Os perfis existentes continuam: toque entra em `qualidade = 2` (dpr 1, sem bloom); o laço sobe de degrau se o quadro passa de 21 ms por 1,5 s. Em cima disso, o R04 desliga no degrau 2+ o reflexo do vidro, as faixas largas do ambiente, a moldura dos insertos e reduz partículas temáticas.

## Acessibilidade e preferências

- Preferência nova **"Transições curtas"** (`cintila3.prefs.curtas`, padrão `false`; chaves antigas continuam valendo, nada é migrado).
- `prefers-reduced-motion`: entrada em 0,6 s, ambiente a 25% da velocidade, efeitos com metade das partículas, clarão máximo 10%, sem luzes correndo na moldura no modo mago, CSS sem animações.
- Cartões do mapa são `<button>` com `aria-label` (inclui "bloqueada: vença a máquina N"), foco visível e alvo ≥ 44 px nos botões.

## Ganchos de teste novos (só em desenvolvimento)

`__cintila.pulaIntro()`, `__cintila.desenhaJa()`, `__cintila.bolaNaTela()`, `__cintila.apres`.
