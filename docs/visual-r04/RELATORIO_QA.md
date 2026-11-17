# Visual R04 · Relatório de QA

Data: 17/11/2026. Branch `visual-r04`. Medido nesta máquina (Windows, Chrome instalado via Playwright). **Nada foi testado em celular físico e ninguém jogou esta versão.**

## Regressão (antes × depois)

| Teste | Antes (v3.0.2) | Depois (R04) |
|---|---|---|
| `npm test`: regras, varredura das 30 máquinas (90 s, andar, 4 subfases, chefe, mago), 50 subidas ao andar, drenos, palhetas | 67 de 67 | 67 de 67 |
| Dreno lateral total | 30 de 494 (6,1%) | 30 de 494 (6,1%), idêntico: física não mudou |
| `npm run build` | 211,3 kB (71,9 kB gzip) | 294,8 kB (100,7 kB gzip) |
| `test/e2e.mjs`: 30 máquinas abrem e sobem ao andar, campanha libera a 2, eterno sobe de degrau | passa, 0 erros | passa, 0 erros |
| `test/telas.mjs`: passagem, resultado, cartões, pausa, atração | passa | passa (30 cartões, 28 trancados no perfil limpo) |
| `test/audio.mjs` | aprovado | aprovado (RMS 0,0098 aos 28 s) |
| Fumaça do build de produção (`vite preview` + `test/prod.mjs`, desktop e celular) | — | 30 cartões, jogo roda 12 s, 0 erros, sem ganchos de teste |

## Testes novos

- **`test/visual.mjs`** (1440×900, 390×844 e 360×800): as 30 máquinas carregam com a camada nova; a bola é medida em 4 pontos sem peças (centro, entrada das rampas, meio-baixo, palhetas), no estado normal e no mais intenso (mago + multibola + chefe na última vida + letreiro + clarão). Critério: centro da bola com luminância ≥ 150 ou 1,8× o fundo em volta. **Passa nos três tamanhos.** Piores casos: Deserto (centro 202, fundo 175 no celular), O Relâmpago, Prisma. Também confere que clicar numa máquina bloqueada não inicia partida e que uma liberada inicia.
  - Na primeira rodada falharam Deserto (areia clara: céu e dunas foram escurecidos e a bola ganhou um halo escuro curto) e Carnaval (falso: o cartão de escolha de máscara cobria a mesa no teste).
- **`test/capturas.mjs depois todas`**: mapa, 3 pilotos, transição, modo chefão, andar bônus, chefe na mesa, mago e resultado nos 5 tamanhos + as 30 mesas em 1440×900 e 390×844. 110 capturas em `evidencias/visual-r04/depois/` (fora do Git). Antes: `evidencias/visual-r04/antes/`. Comparativos lado a lado: `evidencias/visual-r04/comparativo-*.png`; mosaicos: `mosaico-a.png`, `mosaico-b.png`; efeitos dos pilotos: `efeitos/`.
- **`test/efeitos.mjs`**: fotografa o instante dos efeitos-assinatura dos pilotos.

## Desempenho

| Medida | Antes | Depois |
|---|---|---|
| Cadência real, desktop | 16,7 ms (60 fps) | 16,7 ms (60 fps) |
| Script por quadro com 4 bolas + 300 partículas (`perf.mjs`) | mediana 1,2 ms, p95 20,5 ms | mediana 1,6 ms, p95 32,7 ms |
| Toque, CPU 4×, sem GPU (`SEM_GPU=1 celular.mjs`) | 16,7 ms, p95 16,8 | 16,7 ms, p95 16,7–16,8 |
| Toque, CPU 6×, sem GPU | 16,7 ms, p95 16,8 | 16,7 ms, **p95 33,4** |

- A primeira versão derrubou o celular emulado a 6× para 30 fps. Desligando etapas (`SEM_ETAPAS`), o custo estava nos insertos e nas tampas das peças; no modo econômico eles ficaram simples, e saíram reflexo do vidro e faixas largas do ambiente. A mediana voltou a 60 fps, mas o p95 a 6× dobrou: há quadros perdidos de vez em quando no pior caso emulado.
- O p95 do teste sintético de desktop subiu de 20 para 33 ms (cenário extremo de 300 partículas forçadas por quadro); a cadência real ficou em 60 fps.
- Memória: o tablado novo ocupa 1 canvas 800×1520 por máquina carregada; miniaturas do mapa são geradas sob demanda no tempo ocioso. Não medimos memória em heap de forma sistemática.

## Itens obrigatórios

1. 30 máquinas carregam e iniciam conforme o progresso: e2e + visual. ✔
2. Mapa não abre bloqueada: visual.mjs (clique forçado num cartão trancado mantém o estado `menu`). ✔
3. Colisões e movimentos inalterados: nenhum arquivo de `core/`, `game/` ou `machines/` mudou (`git diff main --stat`); dreno idêntico. ✔
4. Bola visível nos momentos intensos: visual.mjs. ✔ (medido por pixel, não por pessoas)
5. Chefes, subfases, mago: testes de regra + capturas. ✔
6. Modo eterno: e2e. ✔
7. Recordes e progresso: chaves de `localStorage` iguais; só entrou `prefs.curtas` com padrão. ✔
8. Cortes e sobreposições: revisados nas capturas dos 5 tamanhos. Corrigidos: dica "segure espaço" aparecia sob a entrada; fichas da entrada encavaladas; número do cartão cobria o título da miniatura. ✔ (revisão visual minha, não de terceiros)
9. Celular: toque, metades da tela e botão SACUDIR inalterados; telas 390 e 360 revisadas. ✔ (emulação)
10. Console: 0 erros em todos os testes acima. Um `TypeError: Cannot read properties of null (reading 'def')` apareceu de forma intermitente nas capturas, **também na versão antiga**; não foi reproduzido sob demanda. A pausa (tecla e troca de aba) agora exige jogo carregado, que era o único lugar que lia `.def` de um jogo possivelmente nulo.

## Não validado

- Celular físico, Safari/iOS, tablets reais.
- Opinião de jogadores sobre a arte e sobre a legibilidade.
- O Preview da Vercel está atrás do login da Vercel (proteção de deploy do projeto): abre para o dono da conta; o teste de fumaça foi feito no mesmo build servido localmente.
