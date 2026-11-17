# Visual R04 · Direção artística

## A ideia

Trinta máquinas de fliperama de uma mesma fábrica, cada uma com tema, material e luz próprios. A fábrica dá a gramática comum (gabinete, trilhos, painel de pontos, tipografia); a máquina dá o mundo.

A referência pedida (pinball futurista com azul, rosa, violeta, laranja e dourado, rampas metálicas e peças translúcidas) foi usada como **nível de acabamento**, não como paleta. Nenhuma imagem de referência foi encontrada na máquina; não usamos imagem de terceiros. Toda a arte é vetorial e procedural, escrita em código (Canvas 2D), e não há arquivo de imagem novo no projeto.

## Regras que valem para as 30

1. **A bola manda.** É de aço cromado com contorno escuro e um halo escuro curto, para se separar de qualquer arte clara. Um teste automático confere a legibilidade dela em quatro pontos da mesa, no estado normal e no momento mais intenso (mago + multibola + chefe + letreiro), nas 30 máquinas, no desktop e no celular.
2. **A metade de baixo é calma.** Toda cena recebe uma faixa escura a partir de y = 540 (zona das palhetas, estilingues e canaletas).
3. **Arte não inventa caminho.** Nada decorativo desenha linha clara longa e contínua que pareça parede, trilho ou rampa. As setas pintadas ficam **embaixo da entrada real** de cada rampa e órbita e apontam para ela. Quando a arte segue um caminho, é um caminho real lido das peças montadas (trilhos do trem, trilhos da perseguição, canos da Boca, caminho das rampas). Os rios de lava do Vulcão foram suavizados depois da primeira revisão justamente por parecerem guias.
4. **Profundidade por camadas:** fundo temático → grafismos → poças de luz sob os bumpers → peças com material → bola → efeitos → reflexo do vidro → interface.
5. **Movimento é curto.** Efeitos de acerto duram de 0,22 s a 0,9 s. O clarão de tela foi limitado a 30% (10% com "reduzir movimento"). Não há piscar contínuo de tela inteira.
6. **Informação fora da mesa.** Letreiros de evento aparecem no backglass, acima do painel de pontos, nunca sobre a mesa. Na mesa, os estados (chefe na última vida, modo mago, multibola) aparecem só nas bordas.

## Materiais

Cada máquina escolhe um de 12 materiais, que muda tampa dos bumpers, cor do fio de brilho dos trilhos, borracha das palhetas, pivôs, botões do gabinete, aro do backbox e barra de travamento:

| Material | Uso típico | Tampa do bumper |
|---|---|---|
| cromo | Aurora, Passo Lunar, Feira, Zero-G, Órion, Estúdio 45 | domo |
| latão | Bestiário, Relojoeiro, Circo | anel |
| cobre | Expresso, Especiarias, Mina | disco |
| ferro | Cidadela, Vulcão, Tempestade, Reator | disco |
| gelo | Fronteira Gelada | vidro |
| ouro | Deserto, Carnaval, O Relâmpago | facetado |
| grafite | Invasão, Cidade Neon | anel |
| osso | Catacumbas | domo |
| coral | Abissal | vidro |
| madeira | Biblioteca | disco |
| jade | Jardim, Templo | facetado |
| cristal | Caverna, Floresta de Vidro, Prisma | facetado |

## Insertos (luzes do tablado)

Nove formas: redondo, seta, losango, estrela, hexágono, gota, escudo, triângulo e quadrado. Cada inserto tem moldura escura, lente na cor do evento e núcleo branco quando aceso. A forma muda por máquina (estrelas na Aurora, gotas no Abissal, setas na Cidade Neon…).

## Luz e camada viva

Cada máquina tem uma luz dominante (vaza por trás do gabinete, tinge o reflexo da bola) e um efeito ambiente animado entre o tablado e as peças: aurora, bolhas, brasas, neve, chuva, chuva de neon, vagalumes, faíscas, poeira, confete, pétalas, vapor, feixes, prisma, notas, raios. No modo mago o ambiente dobra; no modo econômico fica com 60% e perde as faixas de área grande.

## Pilotos

- **Aurora** (céu): cortinas de aurora, lago espelhado com montanhas, constelações gravadas que ligam os alvos numerados na ordem real, tampas cromadas em domo e insertos de estrela. Ao acertar a estrela da vez, um traço de luz vai até a próxima.
- **Abissal** (profundidade): feixes de luz descendo da superfície, recife bioluminescente, tentáculos no fundo, redemoinho pintado sob a Boca e as trilhas dos três canos. Material coral (tampas de vidro), insertos em gota, bolhas subindo. A bola cuspida percorre o cano com um cometa e solta bolhas.
- **Cidade Neon** (intensidade urbana): horizonte com janelas, letreiros de neon (HOTEL, BAR 24H, NOODLE), asfalto molhado com reflexos, viaduto, faixa de pedestre e os trilhos da perseguição em neon na posição real. Material grafite, insertos de seta, chuva de neon. Cada alvo pego dispara um rastro de luz pelo trilho.

As três mostram diferença de material, insertos, ambiente, partícula e choque, além da cena.

## A máquina 30

O Relâmpago é a única com ouro facetado + céu monumental + escadaria do Olimpo + seis selos dourados em volta do chefe (um por poder sorteado). O sorteio dos seis poderes não foi tocado.
