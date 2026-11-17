# Visual R06.1 · Release candidate

Branch `visual-r06-1`, a partir da `visual-r06` (árvore limpa). `main` e produção (v3.0.2) intocadas.

**Galeria de revisão (local, sem serviço externo):** `evidencias/visual-r06-1/galeria/index.html`. Abrir no navegador.
São 30 máquinas, cada uma com partida no desktop, evento especial (mago + multibola + golpe final no chefe + jackpot) e partida no celular emulado. Há ainda o antes (v3.0.2 de produção) e o depois por máquina, e uma visão geral antes/depois de galeria, chefão, fase bônus, celular e resultado. São 132 imagens, 10 MB, fora do Git. Conferida por `node test/galeria.mjs` (30 seções, 190 imagens, nenhuma quebrada).

## 1. Peças secundárias finalizadas

Arquivo `src/visual/r06/secundarias.ts`: só desenho; posição, ângulo e estado vêm da peça real.

| Peça | Onde aparece | Acabamento |
|---|---|---|
| Alvo giratório: criaturas | Bestiário (e Relâmpago) | criatura translúcida em sprite, que cresce chifres e asas conforme a evolução real (`est`) |
| Alvo giratório: escudos | Cidadela (e Relâmpago) | brasão com aro de metal, emblema da máquina e marca da vida restante |
| Alvo giratório: em fuga | Cidade Neon (e Relâmpago) | trilho em neon de três tons + alvos-brasão |
| Esteira do labirinto | Especiarias | moldura de metal, roletes, lona com ripas correndo no sentido real e setas de direção |
| Elevador | Mina | gaiola com colunas e travessa cromadas, plataforma que sobe com a bola e marcadores dos três níveis |
| Canhão | Circo | cano listrado com boca cromada sobre saucer, apontando a mira real |
| Ímã | Caverna (e Relâmpago) | pedestal de cristal que acende com a bola presa e anéis de campo |
| Braço robótico | Órion (e Relâmpago) | base hexagonal, dois segmentos cromados com juntas e garra na mira real |
| Porta / locomotiva | Expresso (e as portas móveis) | locomotiva com caldeira de cobre, chaminé, rodas e farol no sentido de movimento; portão de metal com postes |
| Roda-gigante | Feira (e Relâmpago) | aros cromados em cache, raios, gôndolas em sprite acesas quando há bola presa |
| Flores | Jardim (e Relâmpago) | pétalas de esmalte abrindo e fechando conforme o estado real, miolo-buraco |
| Bola cativa | (nenhuma máquina usa hoje) | esfera de aço e alvo no fim da canaleta, pronta para quando for usada |

Geometria, colisões e mecânicas inalteradas. Nada decorativo virou objeto físico.

## 2. Os seis poderes do Relâmpago

- **Antes:** os selos liam o texto do anúncio "SEIS PODERES: …".
- **Agora:** a assinatura expõe `poderes` (lista congelada, só leitura) e os selos leem esse dado. A mudança no jogo são 3 linhas em `src/game/assinaturas.ts`; o sorteio não mudou (dreno lateral idêntico, 6,1%, e as mesmas sementes geram os mesmos sorteios).
- **Teste** `test/poderes.spec.ts`, em 5 sementes:
  - sempre 6 poderes distintos, iguais aos anunciados;
  - trocar ou apagar o texto do anúncio não muda os selos;
  - a lista é somente leitura;
  - as outras máquinas não têm poderes.
- **Os selos** passaram a ser sprites, e no modo econômico perdem a poça de luz.

## 3. Quadros lentos

**Condições:** celular emulado 412×915, dpr 2, CPU estrangulada pelo Chrome, sem GPU (`SEM_GPU=1`), máquina 30, partida real lançada e jogada com as palhetas.

O Relâmpago sorteia peças a cada partida, então as rodadas sem semente fixa variavam de 13% a 79% de quadros lentos para o mesmo código. Por isso a comparação usa **semente fixa** (`SEMENTE`), 3 sementes × 2 rodadas por versão, servidas lado a lado.

| CPU 6×, quadros > 20 ms | R06 | R06.1 |
|---|---|---|
| semente 1000 (roda, escudos…) | 21,4% · 31,7% | 11,9% · 12,5% |
| semente 2000 (roda, escudos, calor…) | 26,7% · 30,3% | 13,6% · 8,6% |
| semente 3000 (flores, salto…) | 10,3% · 13,9% | 11,1% · 13,1% |

- **Mediana e p95:** em todas as rodadas, mediana de 16,7 ms; p95 de 33,3 a 33,4 ms nas duas versões. A CPU 4× ficou com 0 a 0,6% de quadros lentos.
- **Desktop** (`test/perf.mjs`, Feira, 4 bolas + 300 partículas): mediana de 0,9 ms nas duas versões; p95 de 13,7 a 14,2 ms na R06 e de 12 a 14,2 ms na R06.1. Cadência de 60 fps.

**Gargalos medidos e corrigidos:**
1. **Cache de peças paradas:** era gerado em `devicePixelRatio` (2×) enquanto o toque desenha a 1×, então cada cópia era reduzida pela metade a cada quadro. Agora usa a resolução real do quadro.
2. **Rótulos dos insertos** ("RAMPA", "ÓRBITA"…): eram `fillText` a cada quadro e viraram sprites.
3. **Insertos acesos no modo econômico:** usam halo menor, porque o halo grande custava área de pixels.
4. **Roda-gigante:** aros em cache (são fixos), raios num único traço, gôndolas em sprite.

**Limites da medição:** é emulação num desktop, não um celular. A CPU 6× sem GPU é um extremo artificial, e a variação entre rodadas iguais chega a ±10 pontos. Não há garantia de 60 fps em aparelhos reais.

## 4. `test/telas.mjs` estável

- **Causa:** o jogo avança por quadros com passo limitado a 50 ms. Sob carga, o tempo de jogo anda mais devagar que o relógio, e a espera fixa de 7,5 s nem sempre cobria o bônus de fim de bola + 2,6 s até a tela de resultado.
- **Correção:** cada passo agora espera a condição observável. São elas:
  - tela de passagem montada;
  - tela de fim;
  - cartões do mapa;
  - estado `jogo`;
  - tela de pausa;
  - estado `atracao`.
- **Limites:** 45 a 60 s.
- **Resultado:** 3 de 3 isolado, 2 de 2 dentro da bateria completa e 1 de 1 em paralelo com `test/visual.mjs` (carga extra).

## 5. Legibilidade

Nesta etapa não apareceu nenhum problema novo demonstrável além do que a R06 já corrigiu (letreiros em duas linhas, texto que rola no backbox, bola adaptativa, área segura). O teste de bola passa nas 30 máquinas em 1440, 390 e 360, inclusive nos momentos intensos. Nenhum painel foi redesenhado.

## 6. Testes finais

| Teste | Resultado |
|---|---|
| `npm test` (regras, 30 máquinas, dreno, palhetas, missões, sons, poderes) | **80 de 80** (eram 77; +3 poderes); dreno lateral 30/494 = 6,1% |
| `test/e2e.mjs` (30 máquinas, campanha, eterno, desempenho) | passa, 0 erros |
| `test/telas.mjs` | passa (6 de 6 rodadas, ver item 4) |
| `test/atracao.mjs` (erro `reading 'def'`) | passa. A captura da v3.0.2 de produção reproduziu esse erro durante esta etapa, o que confirma que ele existia lá |
| `test/progresso.mjs` (perfil no formato da v3.0.2) | passa: liberações, recordes, mestria, tempo eterno, partidas e preferências lidos sem perda |
| `test/visual.mjs` | passa em 1440×900, 390×844 e 360×800 |
| `test/audio.mjs` | aprovado |
| `test/galeria.mjs` | 30 seções, 0 imagens quebradas |
| Build | 428,6 kB (143,8 kB gzip) |
| Fumaça do build de produção (`vite preview`), desktop e celular | 30 cartões, 12 s de jogo, 0 erros |

## 7. Pendências de validação humana

- Aprovação artística das 30 máquinas, dos chefes e das peças secundárias (a galeria serve para isso).
- Partidas reais em celular físico, inclusive área segura com entalhe, Safari e iOS.
- Áudio ouvido por uma pessoa: o teste só confere chamadas e nível de sinal.
- Sensação de dificuldade e legibilidade com jogadores, principalmente em multibola e no modo mago.
- Desempenho num aparelho de entrada real.
