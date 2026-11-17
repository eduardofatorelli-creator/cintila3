# Visual R04 · Guia das 30 máquinas

Gerado a partir dos dados reais (`src/machines/*` + `src/visual/manifesto.ts`) por `npx vite-node test/guia.ts`; as composições estão em `src/visual/cenas.ts` (uma função por id). Capturas: `evidencias/visual-r04/depois/maquinas-*` (fora do Git).

## O que toda máquina recebeu

- Cena autoral do tablado (fundo, grafismos, emblema gravado sob o chefe com o nome dele, arte presa à posição real da assinatura).
- Acabamento comum: poças de luz sob os bumpers, setas abaixo das entradas reais de rampas e órbitas, canaleta do lançador em aço, zona calma embaixo, grão e vinheta.
- Material, forma de inserto, luz dominante, ambiente animado, partícula e choque próprios.
- Backglass com a cena da máquina ao fundo e o título em letreiro metálico; gabinete e backbox com o metal da máquina.
- Andar de cima e subfases com a cena da máquina apagada e o emblema do tipo de fase (bônus, premium, chefão, túnel).

## Limitações honestas

- As cenas são vetoriais/procedurais em Canvas 2D: não há ilustração pintada à mão nem gerada por IA (nenhuma ferramenta de geração de imagem estava disponível).
- Efeitos dinâmicos ligados à mecânica além dos genéricos: só nos 3 pilotos (traço de constelação, cometa no cano da Boca, rastro no trilho da perseguição) e no cometa de rampas e órbitas, que vale para todas. Nas outras 27, a ligação com a mecânica é pela arte parada na posição real da peça + choque/partícula da máquina nos eventos.
- Os selos do Relâmpago são seis, mas não mostram quais poderes saíram no sorteio.
- Ninguém jogou nem avaliou a arte; a revisão foi por capturas.

### 01. Aurora (`aurora`)

- **Conceito:** Céu polar: cortinas de aurora sobre um lago espelhado, constelações gravadas em prata.
- **Mecânica real:** Constelação — Acerte os alvos numerados em ordem. Chefe Estrela Rubra; andar de cima Observatório (bonus); modo mago Aurora Boreal.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de estrela; paleta #7df9ff / #b48cff / #ff6fb5.
- **Luz e camada viva:** luz dominante #7df9ff; ambiente animado "aurora".
- **Acertos:** choque "estrela" nos bumpers e golpes; partícula "estrela".
- **Efeito ligado à mecânica:** Linhas de constelação pintadas ligam os alvos numerados na ordem real; cada estrela acertada manda um traço de luz até a próxima da sequência.

### 02. Passo Lunar (`passo-lunar`)

- **Conceito:** Salão de dança na Lua: piso quadriculado iluminado, globo de espelhos e a Terra no horizonte.
- **Mecânica real:** No Compasso — Acertos no tempo da música valem o dobro. Chefe Globo de Espelhos; andar de cima Palco Suspenso (premium); modo mago Febre Lunar.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de quadrado; paleta #ffe14d / #ff4fd8 / #4dd2ff.
- **Luz e camada viva:** luz dominante #ff4fd8; ambiente animado "feixes".
- **Acertos:** choque "quadrado" nos bumpers e golpes; partícula "pixel".
- **Efeito ligado à mecânica:** Pista quadriculada pintada sob o Globo de Espelhos; feixes de luz varrem a mesa devagar; os acertos soltam quadrados de luz.

### 03. Bestiário Astral (`bestiario`)

- **Conceito:** Livro mágico aberto: gravuras em hachura, olhos na floresta e criaturas de luz.
- **Mecânica real:** Captura — Acerte as criaturas que orbitam: 3 golpes capturam. Chefe Ninho Astral; andar de cima Ninho Alto (premium); modo mago Migração Astral.
- **Material e peças:** latao (tampas dos bumpers, trilhos, pivôs); insertos em forma de gota; paleta #8dff6a / #3ad6c0 / #ffd166.
- **Luz e camada viva:** luz dominante #8dff6a; ambiente animado "vagalumes".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "folha".
- **Efeito ligado à mecânica:** Roseta rúnica no ninho do chefe e no centro das criaturas; vagalumes no ar; acertar uma criatura solta um anel ondulado.

### 04. Cidadela do Eclipse (`cidadela`)

- **Conceito:** Muralha de pedra sob eclipse: torres, brasões e um portão de ferro no centro.
- **Mecânica real:** Escudos Giratórios — Quebre os 4 escudos que giram para ferir o Portão. Chefe Portão; andar de cima Torre de Vigia (chefao); modo mago Eclipse Total.
- **Material e peças:** ferro (tampas dos bumpers, trilhos, pivôs); insertos em forma de escudo; paleta #ffb347 / #c0c7e0 / #ff5a5f.
- **Luz e camada viva:** luz dominante #ffb347; ambiente animado "poeira".
- **Acertos:** choque "anel" nos bumpers e golpes; partícula "grao".
- **Efeito ligado à mecânica:** Brasão pintado com os quatro escudos sob o Portão; cada escudo atingido solta um anel e lascas de pedra.

### 05. Invasão (`invasao`)

- **Conceito:** Cidade sob ataque: feixe de abdução, painel de radar e luz verde alienígena.
- **Mecânica real:** Salto Dimensional — A Nave-Mãe muda de lugar a cada golpe: persiga-a. Chefe Nave-Mãe; andar de cima Convés (chefao); modo mago Contra-Ataque.
- **Material e peças:** grafite (tampas dos bumpers, trilhos, pivôs); insertos em forma de triangulo; paleta #5cff9d / #9d7bff / #ff4d6d.
- **Luz e camada viva:** luz dominante #5cff9d; ambiente animado "feixes".
- **Acertos:** choque "anel" nos bumpers e golpes; partícula "pixel".
- **Efeito ligado à mecânica:** Grade de radar com varredura pintada sob a Nave-Mãe; os golpes na nave disparam um choque elétrico.

### 06. Caverna de Cristal (`caverna`)

- **Conceito:** Gruta de geodos: veios minerais, estalactites e reflexos de cristal no chão molhado.
- **Mecânica real:** Ímã de Cristal — O ímã agarra a bola: aperte uma palheta para soltar na mira. Chefe Golem de Quartzo; andar de cima Veio Profundo (premium); modo mago Geodo Aberto.
- **Material e peças:** cristal (tampas dos bumpers, trilhos, pivôs); insertos em forma de losango; paleta #7ff0ff / #c58cff / #ff9de1.
- **Luz e camada viva:** luz dominante #c58cff; ambiente animado "cintilar".
- **Acertos:** choque "cristal" nos bumpers e golpes; partícula "cristal".
- **Efeito ligado à mecânica:** O ímã fica no meio de um geodo aberto (cristais pintados em volta da posição real); acertos soltam estilhaços de cristal.

### 07. Expresso Fantasma (`expresso`)

- **Conceito:** Estação fantasma: trilhos que somem na névoa, relógio de plataforma e vapor esverdeado.
- **Mecânica real:** Locomotiva — A locomotiva cruza a mesa: acerte-a ou passe por trás dela. Chefe Maquinista; andar de cima Vagão-Teto (tunel); modo mago Última Estação.
- **Material e peças:** cobre (tampas dos bumpers, trilhos, pivôs); insertos em forma de redondo; paleta #aaffee / #8f9bd9 / #ffcf5c.
- **Luz e camada viva:** luz dominante #aaffee; ambiente animado "vapor".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "brasa".
- **Efeito ligado à mecânica:** Leito de trilhos pintado exatamente na linha por onde a locomotiva passa; vapor sobe o tempo todo pela mesa.

### 08. Oficina do Relojoeiro (`relojoeiro`)

- **Conceito:** Bancada de relojoeiro: mostradores, engrenagens de latão e pinos de rubi.
- **Mecânica real:** A Hora Marcada — Acerte o relógio: o ponteiro decide qual prêmio começa. Chefe Engrenagem-Mestra; andar de cima Mecanismo (bonus); modo mago Meia-Noite.
- **Material e peças:** latao (tampas dos bumpers, trilhos, pivôs); insertos em forma de redondo; paleta #ffd27a / #c98b4a / #7fe0d0.
- **Luz e camada viva:** luz dominante #ffd27a; ambiente animado "poeira".
- **Acertos:** choque "engrenagem" nos bumpers e golpes; partícula "engrenagem".
- **Efeito ligado à mecânica:** O bumper-relógio fica sobre um mostrador gravado com as quatro horas de prêmio (dobro, ouro, escudo, bônus); acertos soltam engrenagens.

### 09. Feira Elétrica (`feira`)

- **Conceito:** Parque à noite: lâmpadas de marquise, lona listrada e a roda-gigante iluminada.
- **Mecânica real:** Roda-Gigante — Encaixe bolas nas cabines da roda: três soltam a multibola. Chefe Palhaço Voltaico; andar de cima Topo da Roda (premium); modo mago Noite de Fogos.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de estrela; paleta #ff5ea8 / #ffe45c / #5ce1ff.
- **Luz e camada viva:** luz dominante #ff5ea8; ambiente animado "confete".
- **Acertos:** choque "estrela" nos bumpers e golpes; partícula "confete".
- **Efeito ligado à mecânica:** Roda-gigante pintada em volta da roda real, lona listrada e lâmpadas de marquise; cabines e bumpers soltam confete.

### 10. Abissal (`abissal`)

- **Conceito:** Fossa oceânica: feixes de luz que descem, recife bioluminescente e o covil do Kraken.
- **Mecânica real:** A Boca — A boca engole a bola e a devolve por um de 3 canos. Chefe Kraken; andar de cima Plataforma (chefao); modo mago Maré Negra.
- **Material e peças:** coral (tampas dos bumpers, trilhos, pivôs); insertos em forma de gota; paleta #4dfff0 / #3a7bff / #ff7ad9.
- **Luz e camada viva:** luz dominante #4dfff0; ambiente animado "bolhas".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "bolha".
- **Efeito ligado à mecânica:** A Boca é um redemoinho pintado com as trilhas dos três canos; a bola cuspida percorre o cano com um cometa de luz e solta bolhas na saída.

### 11. Vulcão Rubro (`vulcao`)

- **Conceito:** Cratera ativa: rios de magma, basalto rachado e céu de cinzas.
- **Mecânica real:** Rampa de Salto — A rampa esquerda é de salto: a bola voa e cai do outro lado. Chefe Coração de Magma; andar de cima Cratera (tunel); modo mago Erupção Final.
- **Material e peças:** ferro (tampas dos bumpers, trilhos, pivôs); insertos em forma de triangulo; paleta #ffb02e / #ff4a1c / #ffe08a.
- **Luz e camada viva:** luz dominante #ff4a1c; ambiente animado "brasas".
- **Acertos:** choque "raio" nos bumpers e golpes; partícula "brasa".
- **Efeito ligado à mecânica:** Rio de lava pintado sob o caminho das rampas; o pouso da rampa de salto solta um choque e brasas.

### 12. Rota das Especiarias (`especiarias`)

- **Conceito:** Bazar de especiarias: azulejos, montes de pigmento e arcos mouriscos.
- **Mecânica real:** Caminho de Aventura — No labirinto central, as palhetas inclinam a bola: saia pelo lado aceso. Chefe Vizir; andar de cima Terraço (bonus); modo mago Grande Bazar.
- **Material e peças:** cobre (tampas dos bumpers, trilhos, pivôs); insertos em forma de losango; paleta #ffcc4d / #e2572b / #38d6b0.
- **Luz e camada viva:** luz dominante #ffcc4d; ambiente animado "poeira".
- **Acertos:** choque "petalas" nos bumpers e golpes; partícula "grao".
- **Efeito ligado à mecânica:** Tapete de azulejos sob o labirinto e luz dourada nas duas saídas reais; acertos soltam pétalas.

### 13. Corrida Zero-G (`zero-g`)

- **Conceito:** Pista orbital: anel de corrida em volta de um planeta, faixas de velocidade.
- **Mecânica real:** Turbo de Órbita — Órbitas em sequência aceleram a mesa e multiplicam os pontos. Chefe Piloto Sombrio; andar de cima Pit Stop (premium); modo mago Volta Final.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de seta; paleta #f5ff4d / #ff3d81 / #39e0ff.
- **Luz e camada viva:** luz dominante #39e0ff; ambiente animado "raios".
- **Acertos:** choque "anel" nos bumpers e golpes; partícula "faisca".
- **Efeito ligado à mecânica:** Setas de velocidade pintadas nas pistas das órbitas; cada órbita lança um cometa de luz pela pista lateral.

### 14. Floresta de Vidro (`floresta-vidro`)

- **Conceito:** Bosque de vidro: troncos translúcidos, folhas facetadas e luz filtrada.
- **Mecânica real:** Três Camadas — Os alvos centrais têm 3 camadas: três golpes estilhaçam cada um. Chefe Árvore-Mãe; andar de cima Copa (premium); modo mago Chuva de Estilhaços.
- **Material e peças:** cristal (tampas dos bumpers, trilhos, pivôs); insertos em forma de losango; paleta #d8fbff / #6fe3c1 / #b59bff.
- **Luz e camada viva:** luz dominante #6fe3c1; ambiente animado "cintilar".
- **Acertos:** choque "cristal" nos bumpers e golpes; partícula "cristal".
- **Efeito ligado à mecânica:** Vitral pintado sob cada alvo de três camadas; os acertos soltam estilhaços facetados.

### 15. Estação Órion (`orion`)

- **Conceito:** Estação orbital: painéis solares, mapa estelar técnico e a nebulosa de Órion.
- **Mecânica real:** Braço Robótico — O braço pega a bola: aperte uma palheta para arremessar na mira. Chefe IA-Órion; andar de cima Anel de Gravidade (chefao); modo mago Protocolo Zero.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de hex; paleta #6ee7ff / #e6ecff / #ff8a3d.
- **Luz e camada viva:** luz dominante #6ee7ff; ambiente animado "cintilar".
- **Acertos:** choque "anel" nos bumpers e golpes; partícula "pixel".
- **Efeito ligado à mecânica:** Doca hexagonal com marcas de mira pintada sob o braço robótico; o arremesso solta um anel.

### 16. Catacumbas (`catacumbas`)

- **Conceito:** Galerias de ossos: arcos de pedra, nichos com velas e símbolos gravados.
- **Mecânica real:** A Caveira — Alimente a caveira: ela cospe a bola e mais uma em multibola. Chefe Guardião; andar de cima Cripta (tunel); modo mago Dança dos Ossos.
- **Material e peças:** osso (tampas dos bumpers, trilhos, pivôs); insertos em forma de escudo; paleta #b6ff5c / #c9c2b0 / #a45cff.
- **Luz e camada viva:** luz dominante #b6ff5c; ambiente animado "vagalumes".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "grao".
- **Efeito ligado à mecânica:** Nicho octogonal pintado sob a caveira, velas nas galerias; a cuspida da caveira solta um choque ondulado.

### 17. Tempestade (`tempestade`)

- **Conceito:** Moinho na tormenta: nuvens em espiral, chuva diagonal e relâmpagos.
- **Mecânica real:** Pás do Moinho — As pás giram mais rápido e mais devagar: acerte no auge do vento. Chefe Olho do Ciclone; andar de cima Torre do Vento (chefao); modo mago Furacão.
- **Material e peças:** ferro (tampas dos bumpers, trilhos, pivôs); insertos em forma de seta; paleta #c8f1ff / #6f8cff / #ffe35c.
- **Luz e camada viva:** luz dominante #6f8cff; ambiente animado "chuva".
- **Acertos:** choque "raio" nos bumpers e golpes; partícula "raio".
- **Efeito ligado à mecânica:** O moinho fica no olho de um ciclone pintado; as pás atingidas soltam um choque de raio.

### 18. Circo Gravitacional (`circo`)

- **Conceito:** Picadeiro: lona listrada, holofotes cruzados e serragem no chão.
- **Mecânica real:** Canhão Humano — Entre no canhão e dispare: com o andar aceso, ele lança direto lá para cima. Chefe Mestre de Pista; andar de cima Trapézio (premium); modo mago Grande Final.
- **Material e peças:** latao (tampas dos bumpers, trilhos, pivôs); insertos em forma de estrela; paleta #ffd84d / #ff3b4e / #4de1c1.
- **Luz e camada viva:** luz dominante #ffd84d; ambiente animado "feixes".
- **Acertos:** choque "estrela" nos bumpers e golpes; partícula "confete".
- **Efeito ligado à mecânica:** Alvo de picadeiro pintado sob o canhão e holofotes cruzados; o disparo solta confete.

### 19. Laboratório Prisma (`prisma`)

- **Conceito:** Laboratório óptico: bancada de lentes, feixe branco que se divide em espectro.
- **Mecânica real:** Refração — Entre no prisma: a bola vira 3 — vermelha (bumpers), verde (rampas), azul (chefe). Chefe Prisma; andar de cima Sala Branca (bonus); modo mago Luz Branca.
- **Material e peças:** cristal (tampas dos bumpers, trilhos, pivôs); insertos em forma de triangulo; paleta #ffffff / #7aa2ff / #ff6b9a.
- **Luz e camada viva:** luz dominante #ffffff; ambiente animado "prisma".
- **Acertos:** choque "cristal" nos bumpers e golpes; partícula "cristal".
- **Efeito ligado à mecânica:** Um feixe branco pintado chega ao prisma e sai em espectro; as três bolas coloridas deixam rastro da sua cor.

### 20. Deserto de Sal (`deserto`)

- **Conceito:** Salar ao meio-dia: dunas, ruínas douradas e o sol dramático.
- **Mecânica real:** Areia Movediça — O poço de areia suga a bola por 3 segundos e a cospe para cima. Chefe Verme; andar de cima Duna Alta (premium); modo mago Miragem.
- **Material e peças:** ouro (tampas dos bumpers, trilhos, pivôs); insertos em forma de triangulo; paleta #ffe9a8 / #e0a34d / #59d8ff.
- **Luz e camada viva:** luz dominante #e0a34d; ambiente animado "poeira".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "grao".
- **Efeito ligado à mecânica:** Redemoinho de areia pintado sob o poço; a cuspida solta um choque e poeira dourada.

### 21. Biblioteca Infinita (`biblioteca`)

- **Conceito:** Biblioteca sem fim: estantes em perspectiva, escada e páginas que voam.
- **Mecânica real:** Carta na Mão — Derrube o banco de alvos para abrir um livro e escolher 1 de 3 cartas. Chefe Bibliotecário; andar de cima Mezanino (bonus); modo mago Último Capítulo.
- **Material e peças:** madeira (tampas dos bumpers, trilhos, pivôs); insertos em forma de escudo; paleta #ffd9a0 / #b0703c / #7fd1ff.
- **Luz e camada viva:** luz dominante #ffd9a0; ambiente animado "poeira".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "folha".
- **Efeito ligado à mecânica:** Estantes em perspectiva, escada e páginas soltas; o banco de queda (que abre as cartas) solta páginas.

### 22. Reator (`reator`)

- **Conceito:** Núcleo de energia: tubulações, chapas rebitadas e anéis de contenção.
- **Mecânica real:** Superaquecimento — Cada acerto esquenta o reator: tudo vale mais e a mesa acelera. Chefe Núcleo; andar de cima Sala de Controle (chefao); modo mago Fusão Total.
- **Material e peças:** ferro (tampas dos bumpers, trilhos, pivôs); insertos em forma de hex; paleta #c6ff3d / #ff7a1a / #3df2ff.
- **Luz e camada viva:** luz dominante #c6ff3d; ambiente animado "faiscas".
- **Acertos:** choque "raio" nos bumpers e golpes; partícula "faisca".
- **Efeito ligado à mecânica:** Núcleo com anéis de contenção pintado sob o chefe e tubulações nas laterais; acertos soltam faíscas e choques de raio.

### 23. Carnaval de Máscaras (`carnaval`)

- **Conceito:** Desfile: serpentinas, plumas, máscaras e a avenida iluminada.
- **Mecânica real:** Quatro Máscaras — No início, escolha uma máscara: Fera, Pássaro, Maré ou Sol. Chefe Rei Momo; andar de cima Camarote (premium); modo mago Apoteose.
- **Material e peças:** ouro (tampas dos bumpers, trilhos, pivôs); insertos em forma de losango; paleta #ffe14d / #ff3fa4 / #33e0a1.
- **Luz e camada viva:** luz dominante #ff3fa4; ambiente animado "confete".
- **Acertos:** choque "petalas" nos bumpers e golpes; partícula "confete".
- **Efeito ligado à mecânica:** Serpentinas pintadas que levam às duas rampas reais, plumas e avenida iluminada; acertos soltam confete.

### 24. Cidade Neon (`cidade-neon`)

- **Conceito:** Metrópole na chuva: letreiros de neon, asfalto molhado e viadutos.
- **Mecânica real:** Perseguição — Três alvos correm pelos trilhos do centro: pegue todos. Chefe Sindicato; andar de cima Cobertura (chefao); modo mago Apagão.
- **Material e peças:** grafite (tampas dos bumpers, trilhos, pivôs); insertos em forma de seta; paleta #ff2bd6 / #21e6ff / #ffe53b.
- **Luz e camada viva:** luz dominante #ff2bd6; ambiente animado "neon".
- **Acertos:** choque "quadrado" nos bumpers e golpes; partícula "pixel".
- **Efeito ligado à mecânica:** Os trilhos da perseguição são linhas de neon no asfalto, na posição real; cada alvo pego dispara um rastro de luz pelo trilho.

### 25. Jardim Suspenso (`jardim`)

- **Conceito:** Jardim suspenso: canteiros em terraço, cipós, flores e vagalumes.
- **Mecânica real:** Flores Vivas — As flores abertas engolem a bola e a jogam para cima: acerte enquanto estão abertas. Chefe Rainha-Raiz; andar de cima Estufa (premium); modo mago Primavera Eterna.
- **Material e peças:** jade (tampas dos bumpers, trilhos, pivôs); insertos em forma de gota; paleta #ff8fc7 / #7be36a / #ffe46b.
- **Luz e camada viva:** luz dominante #7be36a; ambiente animado "petalas".
- **Acertos:** choque "petalas" nos bumpers e golpes; partícula "petala".
- **Efeito ligado à mecânica:** Canteiros pintados sob as três flores reais; visitar uma flor solta pétalas e um giro de luz.

### 26. Mina Profunda (`mina`)

- **Conceito:** Poço de mina: escoras de madeira, trilhos, minério brilhando e lanternas.
- **Mecânica real:** Elevador — Entre no elevador central: ele leva a bola a um de 3 níveis da mesa. Chefe Capataz; andar de cima Nível −3 (premium); modo mago Corrida do Ouro.
- **Material e peças:** cobre (tampas dos bumpers, trilhos, pivôs); insertos em forma de redondo; paleta #ffc24d / #9c7b5a / #5cf2c8.
- **Luz e camada viva:** luz dominante #ffc24d; ambiente animado "poeira".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "grao".
- **Efeito ligado à mecânica:** Escoras de madeira e lanternas pintadas em volta do poço do elevador real; acertos levantam poeira.

### 27. Templo da Serpente (`templo`)

- **Conceito:** Templo na selva: colunas, degraus, glifos de serpente e chamas cerimoniais.
- **Mecânica real:** Serpente Mecânica — A serpente fecha a rampa direita: três golpes a afastam e a rampa vale 3X. Chefe Serpente; andar de cima Altar (chefao); modo mago Tesouro do Templo.
- **Material e peças:** jade (tampas dos bumpers, trilhos, pivôs); insertos em forma de triangulo; paleta #37d67a / #d9b25c / #ff5a3c.
- **Luz e camada viva:** luz dominante #37d67a; ambiente animado "vagalumes".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "folha".
- **Efeito ligado à mecânica:** Escamas pintadas ao longo da rampa da serpente; glifos e chamas cerimoniais nas laterais.

### 28. Estúdio 45 (`estudio45`)

- **Conceito:** Estúdio analógico: mesa de som, VU-metros, fita de rolo e o vinil girando.
- **Mecânica real:** Disco Giratório — O vinil central gira e arrasta a bola: use a rotação para mudar o tiro. Chefe Produtor; andar de cima Cabine (bonus); modo mago Disco de Ouro.
- **Material e peças:** cromo (tampas dos bumpers, trilhos, pivôs); insertos em forma de redondo; paleta #ff9f43 / #ee5a8a / #54e0c7.
- **Luz e camada viva:** luz dominante #ff9f43; ambiente animado "notas".
- **Acertos:** choque "onda" nos bumpers e golpes; partícula "nota".
- **Efeito ligado à mecânica:** Prato gravado com as rotações (33 · 45 · 78) sob o vinil real; notas sobem pela mesa.

### 29. Fronteira Gelada (`gelada`)

- **Conceito:** Fronteira gelada: geleira azul, cristais de neve e aurora pálida.
- **Mecânica real:** Piso Congelado — A bola quica menos e desliza; as palhetas respondem com atraso. Tudo vale 1,4X. Chefe Colosso; andar de cima Geleira (chefao); modo mago Degelo.
- **Material e peças:** gelo (tampas dos bumpers, trilhos, pivôs); insertos em forma de losango; paleta #e6fbff / #6fc3ff / #b9a4ff.
- **Luz e camada viva:** luz dominante #6fc3ff; ambiente animado "neve".
- **Acertos:** choque "cristal" nos bumpers e golpes; partícula "floco".
- **Efeito ligado à mecânica:** Piso de gelo com rachaduras e geleira ao fundo; neve cai sobre a mesa; acertos soltam flocos.

### 30. O Relâmpago (`relampago`)

- **Conceito:** A última máquina: céu monumental de tempestade, colunas de mármore e ouro elétrico.
- **Mecânica real:** Seis Poderes — Seis mecânicas das outras máquinas, sorteadas a cada partida. Chefe O Primeiro; andar de cima Olimpo (tunel); modo mago Trovão dos Trovões.
- **Material e peças:** ouro (tampas dos bumpers, trilhos, pivôs); insertos em forma de estrela; paleta #fff36b / #8ab4ff / #ffffff.
- **Luz e camada viva:** luz dominante #fff36b; ambiente animado "raios".
- **Acertos:** choque "raio" nos bumpers e golpes; partícula "raio".
- **Efeito ligado à mecânica:** Seis selos dourados em volta do chefe (um por poder sorteado); relâmpagos cruzam o alto da mesa e os golpes no chefe disparam choques de raio.

