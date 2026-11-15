# CINTILA 3 — ESPECIFICAÇÃO DE EXECUÇÃO COMPLETA
### Prompt mestre para o Claude Code · Fator X Studio

---

## 0. COMO USAR ESTE ARQUIVO

Cole no Claude Code:

> Leia `PROMPT-CINTILA-3.md` inteiro e execute do início ao fim, na ordem da seção 14.
> Não faça perguntas: todas as decisões já estão tomadas aqui. Quando um ponto não
> estiver especificado, escolha a opção que deixa o jogo mais emocionante e siga.
> Rode o protocolo de testes da seção 12 ao fim de cada fase e só avance quando passar.

---

## 1. O QUE É, E A RÉGUA DE QUALIDADE

Cintila 3 é um **pinball de ataque em HTML5 Canvas**, jogável em celular e desktop,
com **mesa em perspectiva 2.5D**, **backbox animado** (a tela de cima da máquina),
**andar de cima que desce sobre a mesa** para fases bônus e modo chefão, e
**30 máquinas diferentes** que o jogador vai desbloqueando uma após a outra, além de
**modo eterno** em qualquer máquina já desbloqueada.

A régua: cada partida tem que dar vontade de jogar de novo imediatamente. Se uma
tela parecer "ok", ela está reprovada. O teste final é o jogador falar "uau".

### 1.1 Três regras inegociáveis

1. **Tudo original.** Nenhuma marca, personagem, música, logotipo ou arte de obra real.
   Nada de Godzilla, Pokémon, Michael Jackson, Foo Fighters, Star Wars, nada licenciado,
   nem citação, nem "inspirado em" reconhecível. As 30 máquinas da seção 8 são temas
   originais que ocupam o mesmo *arquétipo emocional* das grandes mesas (monstro gigante,
   castelo, pista de dança, invasão alienígena, caça ao tesouro) sem copiar nenhuma.
   Se uma arte ou nome ficar reconhecível como obra de terceiro, troque.
2. **A bola não morre barato.** A seção 4.4 é lei. Dreno pela lateral tem que ficar
   abaixo de 8% dos drenos, medido pelo teste da seção 12. Esse foi o maior defeito da
   versão 2 e não pode voltar.
3. **Nada de placeholder.** Nenhum "TODO", nenhuma mesa vazia, nenhum som faltando.
   30 máquinas quer dizer 30 máquinas jogáveis até o modo mago.

---

## 2. STACK, REPOSITÓRIO E DEPLOY

### 2.1 Stack

- **TypeScript** compilado com **Vite** (`npm create vite@latest . -- --template vanilla-ts`).
- **Canvas 2D puro.** Sem engine de física, sem Three.js, sem React. A perspectiva da
  seção 5 é feita na mão — é 2.5D, não 3D de verdade.
- **Web Audio API** na mão, sem arquivos de áudio: tudo sintetizado (seção 10).
- **Zero dependências de runtime.** Fontes do Google Fonts por `<link>`.
- Dev: `vitest` para os testes de regra, `playwright` para o teste de jogo da seção 12.

### 2.2 Estrutura de arquivos

```
cintila3/
  index.html
  src/
    main.ts                 bootstrap, loop, estados de tela
    core/
      vec.ts                utilidades
      physics.ts            integração, colisões, substeps
      geometry.ts           construtores de parede/poste/arco/trilho
      projection.ts         a perspectiva 2.5D (seção 5)
      audio.ts              sintetizador, música adaptativa, narrador
      storage.ts            progresso, recordes, mestria
      input.ts              teclado, toque, inclinação
    game/
      machine.ts            carrega uma máquina a partir de dados
      rules.ts              pontuação, missões, multibola, modo mago
      upper.ts              o andar de cima (seção 6)
      arena.ts              subfases em campo separado
      upgrades.ts           evoluções
      campaign.ts           progressão entre as 30 máquinas + modo eterno
    render/
      playfield.ts          desenho da mesa em perspectiva
      backbox.ts            a tela de cima animada (seção 5.4)
      effects.ts            partículas, bloom, flashes, câmera
      cabinet.ts            o gabinete em volta
    machines/
      _schema.ts            o tipo MachineDef
      m01_aurora.ts ... m30_relampago.ts
      index.ts
  test/
    bot.ts                  jogador automático
    drains.spec.ts          métrica de dreno (seção 12.2)
    machines.spec.ts        varredura das 30 máquinas (seção 12.3)
  PROMPT-CINTILA-3.md
  README.md
  vercel.json
```

### 2.3 GitHub e Vercel — faça isso de verdade, não descreva

Rode, na raiz do projeto:

```bash
git init
git add -A
git commit -m "Cintila 3 — base do projeto"
gh repo create cintila3 --public --source=. --remote=origin --push
```

Se o `gh` não estiver autenticado, rode `gh auth login` e siga o fluxo, ou crie o
repositório manualmente e use:

```bash
git remote add origin https://github.com/<usuario>/cintila3.git
git branch -M main
git push -u origin main
```

Deploy na Vercel:

```bash
npm i -g vercel
vercel link --yes
vercel --prod
```

Se o CLI pedir login interativo, pare e diga ao usuário exatamente esta frase:
*"Repositório no ar em <url do GitHub>. Para publicar: vercel.com → Add New → Project →
importe o repositório cintila3 → Framework Preset: Vite → Deploy."*

`vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true
}
```

Faça **commit e push a cada fase concluída** da seção 14, com mensagem descritiva.

---

## 3. ARQUITETURA: AS 30 MÁQUINAS SÃO DADOS, NÃO CÓDIGO

Este é o ponto que decide se o projeto termina. **Não escreva 30 jogos.** Escreva um
motor e 30 arquivos de dados. Um `MachineDef` descreve tudo que muda de uma máquina
para a outra:

```ts
export type MachineDef = {
  id: string;                     // 'aurora'
  n: number;                      // 1..30
  nome: string;
  lema: string;                   // uma linha no menu
  paleta: { c1: string; c2: string; c3: string; fundo: [string,string,string] };
  gravidade: number;              // 0.86..1.10, multiplicador
  bpm: number;                    // trilha
  escala: number[];               // graus da escala musical, ex [0,3,5,7,10]
  raiz: number;                   // nota MIDI base

  layout: LayoutDef;              // seção 4.2: quais elementos e onde
  arte: (c: CanvasRenderingContext2D, t: Tema) => void;   // arte serigrafada do tablado
  chefe: ChefeDef;                // nome, vidas, comportamento, desenho
  assinatura: AssinaturaDef;      // A MECÂNICA EXCLUSIVA da máquina (seção 8)
  andar: AndarDef;                // o que acontece no andar de cima (seção 6)
  missoes: [string,string,string,string,string];
  mago: { nome: string; duracao: number; regra: ModoMago };
  vozes: { inicio: string; chefe: string; mago: string; fim: string };
};
```

O motor tem **um** conjunto de elementos possíveis; o `LayoutDef` escolhe quais
existem, onde ficam e com que parâmetros. Elementos disponíveis:

`palheta`, `palhetaSuperior`, `bumper`, `estilingue`, `alvoFixo`, `bancoDeQueda`,
`rampa`, `orbita`, `giro` (spinner), `portal` (scoop), `travaDeBola`, `canaletaDeRetorno`,
`canaletaExterna`, `resgate` (kickback), `posteCentral`, `imã`, `alvoGiratorio`,
`esteira`, `elevador`, `canhao`, `bolaCativa`, `rodaGigante`, `tunelMagico`, `rodaDeVinil`,
`portaMovel`, `bracoRobotico`, `pocoDeAreia`, `bocaQueEngole`, `pasDeMoinho`.

Cada um é uma classe com `update(dt)`, `colidir(bola)` e `desenhar(ctx, proj)`. A
mecânica-assinatura de cada máquina (seção 8) usa um ou dois desses, parametrizados.

**Teste de sanidade:** se adicionar a máquina 31 exigir mexer em qualquer arquivo de
`core/` ou `render/`, a arquitetura está errada — pare e conserte antes de continuar.

---

## 4. MOTOR DE FÍSICA — NÚMEROS JÁ VALIDADOS

Herde estes valores da versão 2; eles foram medidos e funcionam. Não "melhore" sem medir.

### 4.1 Integração

- Espaço da mesa: **400 × 760** unidades (a projeção da seção 5 cuida da tela).
- Bola: raio **7**. Gravidade base **1000 u/s²**, multiplicada por `machine.gravidade`.
- Passo fixo: **120 Hz**, com **8 subpassos** por quadro de física. Acumulador com teto
  de 8 iterações por quadro para não entrar em espiral de morte.
- Velocidade máxima da bola: **1420 u/s**. Acima disso, normaliza.
- Colisão: segmento-círculo e círculo-círculo com reposicionamento sobre a normal e
  reflexão apenas quando `v·n < 0`. Restituição por elemento (parede 0.45, arco 0.32,
  borracha 0.5, bumper 0.5, alvo 0.6, chão de arena 0.28).
- **Porta de sentido único** (saída do lançador): o segmento guarda uma normal `n`; se
  `(p − a)·n ≤ 0`, ignore a colisão. Para a porta no topo da canaleta do lançador, com
  a porta indo de (362,186) a (392,178), use `n = (−0.258, −0.968)`.

### 4.2 Palhetas

- Pivôs em **(124,694)** e **(256,694)**. Comprimento base **60**.
- Ângulo de repouso **+0.50 rad**, levantada **−0.52 rad**, velocidade angular
  **27 rad/s** subindo e **15 rad/s** descendo.
- Raio de colisão ao longo da pá: **6.5 na base, 4.1 na ponta** (interpolação linear).
- Impulso: calcule a velocidade do ponto de contato (`ω × r`), subtraia da velocidade da
  bola, reflita com `e = 0.42` em movimento e `e = 0.26` parada, e some de volta.
- Vão entre as pontas em repouso: **26.6 u** (bola tem 14). Não feche isso abaixo de
  **14 u** em nenhuma combinação de evoluções, senão o jogo nunca acaba.

### 4.3 Geometria da parte de baixo — a correção mais importante do projeto

Na versão 1, 3 de cada 4 bolas morriam pela lateral porque a pista lateral despejava a
bola direto na canaleta externa. O desenho correto, por lado (espelhe com `x → 380 − x`):

```
parede externa          (20,430) → (20,572) → (20,700) → (48,756)
GUIA DE RETORNO         (20,572) → (62,600)      ← joga a bola descendo PARA DENTRO
divisor vertical        (54,630) → (54,700)
piso da entrada interna (54,640) → (124,672)     ← entrega em cima da palheta
estilingue (triângulo)  A(86,568) B(86,624) C(128,632), face ativa A→C
```

Consequências que você precisa preservar:

- A bola que desce pela órbita **nunca** cai direto na canaleta externa: o guia a
  empurra para a entrada interna.
- A canaleta externa só é alcançada por rebote do estilingue ou bola errante — é isso
  que torna o dreno lateral raro e justo.
- O piso da entrada interna termina **acima e à direita** do pivô da palheta, para a
  bola cair em cima da pá e rolar até a ponta. Terminar o piso à esquerda do pivô
  entala a bola; terminar em cima do pivô também. Já testado: entala.
- O canal entre o piso da entrada e a base do estilingue precisa de **no mínimo 24 u**
  de folga em toda a extensão. Com menos, a bola fica presa.

### 4.4 Lei da sobrevivência da bola

Equipamento **padrão** em todas as máquinas, desde a bola 1:

| Item | Comportamento |
|---|---|
| **Poste central** | Sobe em (190,718), raio 4.6. Depois de defender uma bola, abaixa por **4 s** (com anel de recarga desenhado) e volta. Fica abaixado durante multibola e modo mago. Ao subir de novo, se houver bola parada em cima dele, empurra para um dos lados. |
| **Bola protegida** | 18 s no começo de cada bola (+7 s por nível de Escudo de Luz). Recoloca a bola sem perder a vez. |
| **Resgate** | Canaleta esquerda tem chute de volta, recarregado a cada 4 rampas e ao completar as faixas do topo. O direito vem com a evolução Resgate Duplo. |
| **Antitravamento** | Bola com velocidade < 6 u/s por mais de 2.5 s (7 s se estiver abaixo de y=640, para não atrapalhar quem segura a bola na palheta) leva um empurrão aleatório. |

**Evoluções** conquistadas durante a partida (missão cumprida, fase do chefe derrubada,
subfase vencida, Câmara limpa duas vezes):

| Evolução | Níveis | Efeito |
|---|---|---|
| Palhetas Longas | 2 | +3.5 u de comprimento por nível (teto que mantém o vão ≥ 14 u) |
| Muros Laterais | 2 | Postes de borracha fecham a boca das canaletas (raio 5.7 → 7.9) |
| Ímã Guardião | 2 | Entre y 596 e 690 puxa a bola suavemente para o centro |
| Escudo de Luz | 3 | +7 s de bola protegida |
| Resgate Duplo | 1 | Chute de volta também na canaleta direita |
| Poste Reforçado | 2 | O poste central fica abaixado 2 s em vez de 4 s |

**Mestria:** terminar uma partida acima de 1,5 milhão ou vencer o modo mago sobe 1 nível
de mestria naquela máquina (máx. 10). Cada nível começa a partida com uma evolução já
conquistada. É o que faz o jogador voltar.

### 4.5 Erros que já custaram caro — não repita

- **Nunca use `setTimeout` para estado de jogo** (sair de subfase, levantar alvo de queda,
  encerrar modo). Use contadores em tempo de jogo decrementados no `update(dt)`. Com
  `setTimeout` o jogo trava em pausa e quebra os testes acelerados.
- **Decaimento de flash, tremor e câmera lenta vai no `update(dt)`**, não no laço de
  render. Senão o efeito nunca termina quando a simulação é controlada por teste.
- **Cuidado com cantos em V** entre dois elementos: qualquer fenda menor que 16 u que não
  seja intencionalmente menor que 14 u vira armadilha. Depois de posicionar qualquer
  elemento novo, rode o teste de travamento (12.2).
- **Objetos que se movem** (esteira, elevador, braço) precisam empurrar a bola pela
  velocidade da superfície, nunca teletransportar a bola para dentro de uma parede.

---

## 5. RENDERIZAÇÃO: A MÁQUINA DE VERDADE

A versão 2 desenhava a mesa de cima, chapada. A 3 desenha **uma máquina**: gabinete,
mesa em perspectiva e backbox.

### 5.1 Enquadramento

Tela dividida em três faixas verticais:

```
┌───────────────────────┐
│  BACKBOX (28% da     │  ← tela de cima: animações, placar, chefe
│  altura)              │
├───────────────────────┤
│                       │
│  MESA EM PERSPECTIVA  │  ← 68%
│  (trapézio)           │
│                       │
├───────────────────────┤
│  APRON / botões (4%)  │
└───────────────────────┘
```

No celular em retrato, backbox 24% e mesa 72%. Em paisagem, backbox à direita.

### 5.2 A projeção 2.5D

A mesa é um trapézio: o topo (fundo da mesa) é mais estreito que a base. Função única,
usada por **todo** desenho:

```ts
const P = 0.26;          // quanto o fundo encolhe
const CURVA = 0.18;      // compressão vertical no fundo

export function proj(x: number, y: number, z = 0) {
  const t = y / H;                        // 0 no fundo, 1 na frente
  const k = (1 - P) + P * t;              // escala horizontal nesta linha
  const yy = (t * t * CURVA + t * (1 - CURVA)) * H;
  return {
    sx: CX + (x - CX) * k,
    sy: yy - z * k * 1.35,                // altura levanta o ponto na tela
    k                                     // escala para tamanhos e espessuras
  };
}
```

Regras de desenho em perspectiva:

- **Tudo** que tem raio ou espessura multiplica por `k`. Bola, postes, palhetas, linhas.
- **Todo objeto tem altura `z`** (bumper 16, poste 10, parede 12, rampa 18→26, alvo 11).
  Desenhe a face lateral (quadrilátero entre a base e o topo, em tom 35% mais escuro) e
  depois a face de cima. Isso sozinho já dá a sensação de volume.
- **Sombra da bola:** elipse preta a 55% de opacidade em `proj(x, y, 0)`, achatada em
  `0.45`, deslocada 2 u para baixo. A bola em si desenha em `proj(x, y, 7)`.
- **Ordem de desenho:** por `y` crescente (pintor). Elementos no mesmo `y` ordenam por `z`.
- O tablado (arte serigrafada) é desenhado uma vez num canvas fora de tela em
  coordenadas de mesa e depois **deformado linha a linha** para o trapézio: para cada
  linha `y` da textura, desenhe-a com `drawImage` no retângulo correspondente de
  `proj`. 760 chamadas uma vez só, no carregamento da máquina.

### 5.3 Iluminação e brilho

- **Bloom:** canvas auxiliar em **metade da resolução**, só com os emissores (discos
  chapados), `filter: blur(5px)`, composto com `globalCompositeOperation = 'lighter'`
  e `globalAlpha = 0.44`. Brilhos de raio > 64 u **não** passam pelo bloom — desenhe-os
  direto com gradiente radial, senão a mesa fica lavada. Isso já aconteceu.
- **Inserts** (as luzes do tablado) são a alma do pinball: cada alvo possível tem sua
  luz, que pisca quando o tiro vale e fica apagada quando não vale. Acenda em sequência
  (chase) durante modos.
- **Luz de ambiente por modo:** multibola tinge a mesa de dourado, modo mago de branco
  pulsante, chefe em perigo de vermelho.
- Alvo de desempenho: **60 fps em celular de 3 anos**. Se cair, reduza partículas antes
  de reduzir bloom.

### 5.4 Backbox — a tela de cima

É um painel inclinado, com moldura de gabinete, que mostra:

- **Placar grande** em fonte de matriz de pontos, com grade de pontos por cima.
- **Animações por evento**, não só texto: explosão quando o chefe cai, barras de
  progresso de missão, contagem regressiva do andar de cima, retrato do chefe que
  reage a dano, "chuva" de pontos no bônus de fim de bola, ranking no fim da partida.
- **Arte de backglass por máquina**: um desenho de fundo, em camadas, com paralaxe leve
  conforme a bola se move (desloca 3 u). Cada uma das 30 máquinas tem a sua.
- Durante o andar de cima, o backbox mostra a **câmera do andar de cima** em miniatura
  quando a visão principal está na mesa, e vice-versa.

### 5.5 Gabinete

Laterais do gabinete com arte da máquina, botões físicos desenhados (lançador à
direita, botões de palheta nas laterais, botão de start piscando no menu). Em celular,
as laterais viram as zonas de toque.

---

## 6. O ANDAR DE CIMA — O CORAÇÃO DO PEDIDO

Toda máquina tem **dois tablados**: o principal e o de cima. O de cima não é um canto
da mesa: é um **segundo campo inteiro** que desce sobre o principal.

### 6.1 Como se chega lá

Cada máquina define **um** gatilho principal e herda os dois genéricos:

| Gatilho | Regra |
|---|---|
| **Bater 3 vezes** | Acertar o alvo-assinatura da máquina 3× na mesma bola |
| **Passar 5 vezes** | Completar 5 voltas de órbita acumuladas |
| **Túnel mágico** | Entrar no portal quando a luz TÚNEL estiver acesa |
| Genérico A | Derrubar uma fase do chefe |
| Genérico B | Cumprir duas missões na mesma bola |

A luz **ANDAR DE CIMA** no tablado acende e o backbox anuncia. O jogador escolhe quando
subir entrando no túnel — não é automático, para ele poder empilhar com multibola.

### 6.2 A transição (o momento "uau")

Sequência de 1.6 s, obrigatória, não pule nenhum passo:

1. **0.0 s** — Tudo congela por 0.2 s. Som grave crescente. A mesa escurece.
2. **0.2 s** — O andar de cima **desce** de fora da tela, inclinado, projetando sombra
   sobre a mesa principal, com som de mecanismo e trilhos.
3. **0.8 s** — A câmera **sobe e se inclina** para enquadrar o andar de cima
   (interpolação com easing em `P`, `CURVA` e no deslocamento vertical).
4. **1.2 s** — A bola é cuspida no andar de cima por um ejetor, com faísca.
5. **1.6 s** — Backbox anuncia o nome da fase. Música troca de camada. Jogo retoma.

A volta é a mesma sequência invertida, em 1.1 s, com a bola devolvida ao portal da
mesa principal.

### 6.3 O que acontece lá em cima

O andar de cima tem **duas palhetas curtas** (comprimento 46, pivôs em 140 e 240) e
**chão selado** — a bola não morre lá em cima; se sair por baixo, volta para a mesa
principal, o que encerra a fase. Quatro tipos de fase, sorteados conforme a máquina:

1. **FASE BÔNUS** — 25 s, tudo vale 5×, alvos espalhados, sem risco. Alívio e pontos.
2. **ETAPA PREMIUM** — objetivo específico da máquina (limpar a muralha, capturar as
   criaturas, apagar os holofotes). Vencer dá evolução + bola extra.
3. **MODO CHEFÃO** — o chefe da máquina sobe junto e luta em campo fechado, com
   ataques que mexem na mesa: ímãs que puxam a bola, pás que giram, chão que inclina.
   Vencer encerra a fase do chefe inteira e vale 10× o normal.
4. **TÚNEL MÁGICO** — campo em rolagem vertical: a bola sobe por um poço com obstáculos
   e o jogador guia com as palhetas. Chegar ao topo abre um atalho permanente para a
   próxima máquina da campanha.

Cada uma das 30 máquinas define qual dos quatro é o seu andar padrão e um segundo como
variação a partir da terceira visita.

---

## 7. ESTRUTURA DE REGRAS DA MESA PRINCIPAL

Herdado e expandido da versão 2. Toda máquina tem:

- **Chefe central** com 3 fases de 3→5 golpes. Derrubar uma fase dá evolução, dobra
  pontos por 30 s e abre, em rodízio: chuva de estrelas (bola a mais) → subfase →
  modo mago.
- **Cinco missões** cronometradas (48 s), acesas no portal: rampas, bumpers, órbitas,
  alvos, chefe. Cumprir as cinco dá bola extra e reinicia o ciclo valendo mais.
- **Multibola** por duas travas no portal, com jackpot nas rampas e órbitas e super
  jackpot no chefe a cada 3 jackpots.
- **Modo mago** (nome próprio por máquina): 48 s, 3 bolas, todo alvo vale fixo e alto.
  Vencer sobe o nível da máquina e conta para a mestria.
- **Câmara Alta**: campo selado no alto à esquerda, com palheta própria controlada pelo
  botão esquerdo, 3 alvos e um bumper, 12 s. Limpar os 3 alvos dá prêmio alto e, a cada
  duas limpezas, uma evolução.
- **Subfases em campo separado** (3 por máquina, a mesma estrutura das arenas da versão 2,
  com chão selado): Coração do Núcleo, Enxame, Muralha — e as variantes da seção 8.
- **Tiro certeiro** no lançamento: uma das faixas do topo pisca; acertá-la vale alto.
- **Bônus de fim de bola** contado item a item no backbox, multiplicado pelo bônus X.
- **Combo** por rampas em sequência, dobrado quando alterna esquerda/direita.
- **Tilt** em 3 sacudidas, com aviso em 2.

---

## 8. AS 30 MÁQUINAS

Ordem de desbloqueio = ordem da lista. Cada uma precisa ser jogável até o modo mago.
**Assinatura** é a mecânica que só ela tem; é o que faz valer a pena trocar de máquina.

| # | Máquina | Clima | Assinatura (mecânica exclusiva) | Chefe | Andar de cima |
|---|---|---|---|---|---|
| 1 | **Aurora** | céu noturno, constelações | acender constelação ligando alvos em sequência | Estrela Rubra | Fase bônus: Observatório |
| 2 | **Passo Lunar** | pista de dança, gravidade 0.88 | acertos no compasso da música valem o dobro | Globo de Espelhos | Premium: Palco Suspenso |
| 3 | **Bestiário Astral** | floresta de luz | capturar criaturas que orbitam e evoluem em 3 estágios | Ninho Astral | Premium: Ninho Alto |
| 4 | **Cidadela do Eclipse** | castelo sitiado | 4 escudos giratórios bloqueiam o chefe até caírem | Portão | Chefão: Torre de Vigia |
| 5 | **Invasão** | ficção científica | o chefe salta de posição a cada golpe | Nave-Mãe | Chefão: Convés |
| 6 | **Caverna de Cristal** | gruta mineral | ímã que agarra a bola no ar e a solta em ângulo escolhido | Golem de Quartzo | Premium: Veio Profundo |
| 7 | **Expresso Fantasma** | trem noturno | locomotiva percorre um trilho cruzando a mesa e bloqueia tiros | Maquinista | Túnel: Vagão-Teto |
| 8 | **Oficina do Relojoeiro** | engrenagens | relógio analógico: a hora marcada define qual modo começa | Engrenagem-Mestra | Bônus: Mecanismo |
| 9 | **Feira Elétrica** | parque de diversões | roda-gigante gira e trava até 3 bolas nas cabines | Palhaço Voltaico | Premium: Topo da Roda |
| 10 | **Abissal** | fundo do mar | boca que engole a bola e a devolve por um de 3 canos | Kraken | Chefão: Plataforma |
| 11 | **Vulcão Rubro** | lava | rampa de salto: a bola voa por cima da mesa e cai do outro lado | Coração de Magma | Túnel: Cratera |
| 12 | **Rota das Especiarias** | mercado | caminho de aventura: labirinto inclinável pelas palhetas | Vizir | Bônus: Terraço |
| 13 | **Corrida Zero-G** | pista orbital | combo de voltas: cada órbita seguida acelera a mesa inteira | Piloto Sombrio | Premium: Pit Stop |
| 14 | **Floresta de Vidro** | mata cristalina | alvos em 3 camadas que estilhaçam uma de cada vez | Árvore-Mãe | Premium: Copa |
| 15 | **Estação Órion** | estação espacial | braço robótico pega a bola e arremessa para onde o jogador mirar | IA-Órion | Chefão: Anel de Gravidade |
| 16 | **Catacumbas** | cripta | caveira que come a bola e cospe em multibola | Guardião | Túnel: Cripta |
| 17 | **Tempestade** | moinhos | pás giratórias rebatem a bola com força variável | Olho do Ciclone | Chefão: Torre do Vento |
| 18 | **Circo Gravitacional** | circo | canhão humano: lança a bola direto no andar de cima | Mestre de Pista | Premium: Trapézio |
| 19 | **Laboratório Prisma** | ótica | a bola atravessa o prisma e vira 3 bolas coloridas com regras próprias | Prisma | Bônus: Sala Branca |
| 20 | **Deserto de Sal** | dunas | poço de areia movediça que suga a bola por 3 s e cospe | Verme | Premium: Duna Alta |
| 21 | **Biblioteca Infinita** | estantes | a cada livro aberto, escolha 1 de 3 modos (carta na mão) | Bibliotecário | Bônus: Mezanino |
| 22 | **Reator** | usina | superaquecimento: quanto mais acerta, mais vale e mais rápido fica | Núcleo | Chefão: Sala de Controle |
| 23 | **Carnaval de Máscaras** | folia | escolher 1 de 4 máscaras no início, cada uma com vantagem própria | Rei Momo | Premium: Camarote |
| 24 | **Cidade Neon** | metrópole | alvos que andam pela mesa em trilhos, perseguição | Sindicato | Chefão: Cobertura |
| 25 | **Jardim Suspenso** | estufa | flores que abrem e fecham buracos no tablado | Rainha-Raiz | Premium: Estufa |
| 26 | **Mina Profunda** | mina | elevador leva a bola a 3 níveis — único andar que **desce** | Capataz | Premium: Nível −3 |
| 27 | **Templo da Serpente** | ruínas | serpente mecânica que bloqueia e libera a rampa principal | Serpente | Chefão: Altar |
| 28 | **Estúdio 45** | estúdio musical | disco de vinil giratório que lança a bola conforme a rotação | Produtor | Bônus: Cabine |
| 29 | **Fronteira Gelada** | geleira | o gelo muda o atrito: a bola desliza e as palhetas escorregam | Colosso | Chefão: Geleira |
| 30 | **O Relâmpago** | final | reúne 6 assinaturas das máquinas anteriores, sorteadas por partida | O Primeiro | Túnel: Olimpo |

Cada arquivo de máquina precisa trazer: paleta, arte do tablado (função de desenho com
no mínimo 6 elementos gráficos distintos), arte do backglass, 5 nomes de missão, nome do
modo mago, 4 falas do narrador e os parâmetros da assinatura.

---

## 9. CAMPANHA, MODO ETERNO E PROGRESSO

### 9.1 Campanha

- Começa só a máquina 1 desbloqueada.
- **Vencer o modo mago** de uma máquina desbloqueia a próxima e mostra uma tela de
  passagem: a máquina atual recua, a nova desce dos trilhos, o backbox apresenta o tema.
- O jogador pode voltar a qualquer máquina já desbloqueada.
- **Mapa das máquinas**: tela de seleção em grade 5×6 com a arte do backglass de cada
  uma, mestria em estrelas, recorde e cadeado nas bloqueadas.

### 9.2 Modo eterno

Em qualquer máquina desbloqueada: **bolas infinitas, dificuldade crescente**. A cada
3 minutos sobe um "degrau": gravidade +2%, chefe +1 golpe, bola protegida −2 s,
canaletas mais abertas. Placar próprio, separado do normal. O objetivo é durar.
Mostrar sempre o degrau atual e o recorde de tempo no backbox.

### 9.3 Progresso salvo

`localStorage`, uma chave por item, com `try/catch` em tudo:
máquinas desbloqueadas, recorde por máquina, mestria por máquina, recorde do modo
eterno, preferências (som, música, narrador, canhoto/destro), total de partidas.
Botão "apagar progresso" nas opções, com confirmação.

---

## 10. ÁUDIO

Tudo sintetizado em Web Audio, sem arquivos.

- **Cadeia:** fontes → ganho de SFX / ganho de música → compressor → saída, com envio
  para uma reverberação feita de dois delays (71 ms e 113 ms) em realimentação 0.42
  com filtro passa-baixa em 2.6 kHz.
- **Trilha adaptativa por máquina:** sequenciador em semicolcheias no `bpm` da máquina,
  usando a escala e a raiz definidas. Quatro camadas que entram conforme a intensidade:
  base (bumbo + baixo) → caixa e chimbal → arpejo → contracanto. Multibola sobe para 3,
  modo mago para 4, andar de cima troca a progressão.
- **Efeitos obrigatórios** (cada um com timbre próprio): palheta sobe, palheta desce,
  bumper (3 alturas diferentes), estilingue, alvo fixo, alvo de queda, tijolo, faixa,
  giro, rampa (arpejo de 4 notas subindo), órbita (varredura de filtro), golpe no chefe,
  escudo, explosão do chefe, jackpot, super jackpot, bola extra, missão iniciada, missão
  cumprida, evolução, entrada no túnel, saída do túnel, lançador (altura conforme a
  força), dreno, bola salva, poste defendeu, resgate, trava, tilt, aviso, relógio.
- **Narrador** em `pt-BR` via `speechSynthesis`, `rate 1.12`, `pitch 0.68`, com trava de
  800 ms entre falas. Desligável. Cada máquina tem 4 falas próprias.
- Três interruptores independentes no menu: som, música, narrador.

---

## 11. INTERFACE E CONTROLES

- **Celular:** toque na metade esquerda e direita da mesa para as palhetas; segurar à
  direita puxa o lançador com força proporcional ao tempo; botão SACUDIR embaixo;
  suporte a multitoque real (as duas palhetas ao mesmo tempo).
- **Teclado:** `←`/`Z`/`A` e `→`/`M`/`L` palhetas, `Espaço` lançador, `↑` sacudir,
  `P`/`Esc` pausa, `Enter` confirmar.
- **Menu:** mapa das 30 máquinas, recordes, opções, e um atrativo (attract mode) que
  roda sozinho depois de 20 s parado, com a mesa jogando sozinha e o backbox mostrando
  recordes — igual máquina de fliperama.
- **Tela de fim de partida:** placar grande, estatísticas (núcleos, missões, subfases,
  evoluções, nível), comparação com o recorde, botão jogar de novo e trocar de máquina.
- **Pausa** com resumo das evoluções conquistadas.
- Tudo em **português do Brasil**.

---

## 12. PROTOCOLO DE TESTE — OBRIGATÓRIO

Este protocolo é o que separa "parece pronto" de "está pronto". Implemente antes de
construir a segunda máquina.

### 12.1 Ganchos de teste

Exponha em `window.__cintila` quando `import.meta.env.DEV`: o estado do jogo, a lista de
bolas, as palhetas, `setFlip(i, bool)`, `step(dt)` (um passo de física sem render),
`stopLoop()`, `loadMachine(id)`, `grantUpgrade()`, `enterUpper()`. Sem isso não dá para
testar — foi assim que os defeitos da versão 2 apareceram.

### 12.2 Robô jogador e métricas de dreno

`test/bot.ts`: um jogador automático que aciona a palheta quando a bola está na janela
de interceptação, com limiar aleatório para não ser perfeito. Rode 5 minutos simulados
por máquina e meça:

| Métrica | Meta |
|---|---|
| Dreno pela lateral | **< 8%** dos drenos |
| Bola parada (v < 6 u/s por > 5 s fora da palheta) | **0 ocorrências** |
| Erros de console | **0** |
| Quadros com `NaN` em posição | **0** |
| Tempo médio de bola | **> 20 s** |
| Entrou no andar de cima pelo menos uma vez | **sim** |

### 12.3 Varredura das 30 máquinas

`test/machines.spec.ts`: para cada máquina, carregue, jogue 90 s com o robô, force
entrada no andar de cima, force cada subfase, force o modo mago, e verifique:
carrega sem erro, volta da subfase para a mesa, o chefe morre e renasce, o modo mago
termina, nenhuma bola some, nenhum `NaN`. Uma máquina que não passar não entra no commit.

### 12.4 Desempenho

Meça o tempo de quadro em 2000 quadros com 4 bolas e 300 partículas. Mediana abaixo de
**9 ms**. Acima disso, otimize antes de prosseguir.

---

## 13. O QUE ESTÁ PRONTO E PODE SER APROVEITADO

O `index.html` do Cintila 2 está neste repositório e já contém, funcionando e testado:

- o motor de física com substeps e todas as constantes da seção 4;
- a geometria de baixo que resolveu o dreno lateral (seção 4.3);
- palhetas, bumpers, estilingues, alvos fixos, banco de queda, rampas com trilho,
  órbitas, giro, portal, poste central, resgate, ímã;
- 5 máquinas com chefe, 5 missões, multibola, modo mago, Câmara Alta e 3 subfases;
- sintetizador de áudio completo e trilha adaptativa;
- sistema de evoluções e mestria;
- o painel de pontos com animações.

**Porte este código para TypeScript** dividido nos módulos da seção 2.2, em vez de
começar do zero. Depois acrescente perspectiva, backbox, andar de cima e as 25 máquinas
novas. As 5 existentes viram as máquinas 1 a 5 da campanha.

---

## 14. ORDEM DE EXECUÇÃO

Faça nesta ordem, com commit e push ao fim de cada fase.

| Fase | Entrega | Critério para avançar |
|---|---|---|
| **1** | Projeto Vite + TS, repositório no GitHub, deploy na Vercel com uma tela "carregando" | URL pública abre |
| **2** | Porte do motor da v2 para os módulos de `core/` e `game/`, 1 máquina jogável, ganchos de teste | Teste 12.2 passa na máquina 1 |
| **3** | Projeção 2.5D, alturas, sombras, gabinete | 60 fps, nada deformado |
| **4** | Backbox animado com todos os eventos | Cada evento tem animação própria |
| **5** | Andar de cima: transição, 4 tipos de fase, volta | Teste 12.3 entra e sai 50× sem falha |
| **6** | `MachineDef` + as 5 máquinas da v2 convertidas em dados | Trocar de máquina sem recarregar |
| **7** | Campanha, mapa das máquinas, modo eterno, progresso salvo | Desbloqueio funciona |
| **8** | Máquinas 6 a 15, com assinatura, arte e áudio próprios | Teste 12.3 em todas |
| **9** | Máquinas 16 a 30 | Teste 12.3 em todas |
| **10** | Attract mode, polimento, ajuste de dificuldade, revisão de áudio | Teste 12.2 em todas as 30 |
| **11** | Deploy final, README com capturas, tag `v3.0.0` | URL pública com as 30 máquinas |

Ao fim de cada fase, escreva no chat: o que entregou, o resultado dos testes em números,
e o que vem na próxima. Não peça aprovação — siga.

---

## 15. CRITÉRIO DE ACEITE FINAL

A entrega está pronta quando, na URL pública:

1. As 30 máquinas abrem, jogam e chegam ao modo mago.
2. O dreno lateral fica abaixo de 8% em todas, medido pelo robô.
3. O andar de cima desce, é jogável e volta, em todas.
4. O backbox anima em todos os eventos.
5. A campanha desbloqueia da 1 à 30 e o modo eterno funciona.
6. Roda a 60 fps em celular.
7. Não há nenhuma marca, personagem ou arte de terceiro em lugar nenhum.
8. Um jogador que nunca viu o jogo entende o que fazer em 10 segundos.
