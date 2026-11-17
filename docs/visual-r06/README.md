# Visual R06 · Arcade Premium Collection

Branch `visual-r06`, criada a partir da `visual-r05` (árvore limpa). `main` e produção (v3.0.2) intocadas.
Física, regras, peças, chefes (movimento e vidas), assinaturas, progressão e chaves de `localStorage` não mudaram:
`git diff visual-r05 --stat -- src/core src/game src/machines` está vazio (a única mudança fora da camada visual desde a R04 continua sendo a preferência `curtas`).

| Evidência | |
|---|---|
| R05 × R06 nas 30 máquinas, em partida, 1440×900 | `r05-x-r06-maquinas-1.jpg` … `-5.jpg` |
| Jogo intenso (mago + multibola + chefe na última vida + jackpot) nas 30 | `intenso-30.jpg`, `intenso-celular.jpg` |
| Galeria, arena do chefão, fase bônus | `galeria.jpg`, `arena-chefao-celular.jpg`, `andar-bonus.jpg` |
| Capturas completas (fora do Git) | `evidencias/visual-r06/{r05,r06}/` (110 cada), `pares/` (30), `intenso/`, `lado-*.png` |

## 1. Arquitetura

A arquitetura da Aurora R05 virou a base comum:

- `src/visual/r06/paleta.ts`: acabamento de cada máquina, indexado pelo id: cores e decalques de bumper, acrílico do estilingue, alvos, banco, trilho e fio de luz, palheta, piso das rampas, saucers, insertos de estado, chefe (material, acessório, pedestal).
- `src/visual/r06/pecas.ts`: as peças premium da Aurora generalizadas. Inclui bumper, estilingue com borracha que chuta, postes, alvos com trincas reais, banco de queda, rampa de acrílico com arame, saucer, spinner, joia das fases de cima, vinil girando, pás do moinho e boca/caveira. Também tem as paredes cromadas, a luz por fonte e os insertos de estado (bônus, missões, bola protegida).
- **Cache de peça parada:** estilingues, rampas, alvos, banco e spinner são pintados uma vez por estado real e só copiados enquanto não mudam.
- `src/visual/r06/chefes.ts`: 9 corpos de chefe (estrela, globo de espelhos, engrenagem, tentáculos, cristal, máscara, olho, serpente, monólito). Cada um combina:
  - 14 materiais e 13 acessórios;
  - olhos que seguem a bola;
  - expressão e clarão no golpe, a partir do `dor` real;
  - escudo quando a peça está protegida;
  - versão em sprite único no modo econômico.
- `src/visual/r06/arte.ts` e `cenas.ts`: biblioteca de pintura (pedra chanfrada, madeira, chapas rebitadas, engrenagens, cristais facetados, tubos, nuvens, cidade, lona, lâmpadas, placa gravada do chefe) e as 29 receitas de tablado. O acabamento comum é a função `finaliza()`.
- `src/visual/r06/andar.ts`: ambientes especiais por tipo de fase. O túnel ganhou fundo de vórtice próprio (`skin.tunel`).
- `src/visual/r06/assinaturas.ts`: efeitos contínuos que leem o estado real (batida, medidores, rotação do vinil, cabines, poderes sorteados, modo mago). Os efeitos de evento estão em `src/visual/eventos.ts`.
- `src/visual/r06/skins.ts`: registra as 30 skins e gera o backglass premium (cena + retrato do chefe + letreiro cromado).
- `src/visual/estado.ts`: fonte única das missões e regras da fila do painel de pontos.

## 2. As 30 máquinas

Todas usam peças premium, paredes com fio de luz próprio, insertos de estado, chefe premium, backglass premium e ambiente especial. As 29 ganharam tablado novo; a Aurora manteve o da R05, aprovado. O guia detalhado de cada uma está no fim deste arquivo, gerado dos dados reais por `npx vite-node test/guia-r06.ts`.

## 3. Correções

1. **Visibilidade da bola.** Um mapa de luminância do tablado (40×76) dá o fundo no ponto exato da bola:
   - em fundo claro, o contorno escuro fica mais grosso;
   - em fundo escuro, ganha um aro claro (resolve a confusão com estrelas observada na gravação da Aurora);
   - as bolas extras da multibola ganham aro na cor da máquina;
   - o rastro só aparece com a bola rápida (> 650 u/s);
   - posição e tamanho de colisão não mudaram.
2. **Hierarquia de letreiros.** Há 3 níveis: comum, sem letreiro; importante (missão, evolução, andar, ataque, chefe voltou); especial (multibola, jackpot, super, núcleo destruído, mago, mago vencido, atalho).
   - O especial encurta o letreiro em curso, com 0,2 s de saída.
   - A fila é ordenada por prioridade e depois pela ordem dos acontecimentos.
   - Letreiros que esperaram demais saem (2,5 s; especiais 4 s).
   - Especiais dão um pulso de borda.
   - Títulos longos quebram em duas linhas.
   - Nada disso atrasa o jogo: os letreiros só leem.
3. **Missões sincronizadas.** A causa provável da diferença vista na gravação: o painel de pontos enfileira até 5 animações. A animação "missão iniciada" mostrava 0/meta e a de progresso lia o objeto mutável da missão, enquanto o painel lateral mostrava o estado atual (com até 125 ms de atraso de cache).
   - Agora as animações fotografam o valor do momento do evento.
   - Um progresso novo substitui o pendente; conclusão ou falha descartam as pendências.
   - A tela-base do backbox e o painel lateral leem a mesma `estadoMissao(J)`.
   - O painel é redesenhado na hora em qualquer evento de missão.
   - Testado em `test/missoes.spec.ts`.
4. **Erro intermitente "Cannot read properties of null (reading 'def')".** **Reproduzido:** no modo de atração o backbox é desenhado sem jogo, e a animação `chefeDano` lê `J.def`. Corrigido: sem jogo, nenhuma animação de evento roda. O teste `test/atracao.mjs` falha sem a correção (mesma mensagem) e passa com ela.
5. **Backbox:** texto que não cabe nem no menor tamanho rola horizontalmente, em vez de ser cortado. A rolagem cobre:
   - nome da missão;
   - linha de informação;
   - dica da fase;
   - centralizados longos.
6. **Celular:** o enquadramento respeita `env(safe-area-inset-*)` (entalhe e barra de gestos).
7. **Áudio:** `test/sons.spec.ts` confere que nenhum acontecimento dispara o mesmo som duas vezes. Cobre bumper, alvo, queda, órbita, rampa, spinner e chefe até cair, em 4 máquinas, e confirma que mago e multibola têm som. Não houve duplicação, então a síntese não foi tocada. Não houve validação de ouvido.

## 4. Testes

| Teste | R05 | R06 |
|---|---|---|
| `npm test` | 67 de 67 | **77 de 77** (+5 missões, +5 sons) |
| Dreno lateral | 6,1% | 6,1% (idêntico) |
| `test/e2e.mjs` (30 máquinas, campanha, eterno) | passa | passa, 0 erros |
| `test/telas.mjs` | passa | passa (2 de 2 isolado). Uma rodada dentro da bateria completa falhou por tempo: a espera fixa de 7,5 s não bastou com o sistema carregado |
| `test/visual.mjs` (bola em 8 situações × 30 máquinas, bloqueio do mapa) | 1440, 390 | 1440, 390 **e 360**: passa |
| `test/atracao.mjs` | — | passa |
| `test/audio.mjs` | aprovado | aprovado |
| Capturas em partida | Aurora | 30 máquinas × 2 tamanhos + 5 tamanhos de tela + intensos |
| Build | 331,9 kB | 417,2 kB (140,4 kB gzip) |

## 5. Desempenho

Medido nesta máquina. Celular **emulado**, com CPU estrangulada e sem GPU.

| Medida | R05 | R06 |
|---|---|---|
| Desktop, Aurora: script por quadro com 4 bolas e 300 partículas (mesma sessão) | mediana 1,7 ms, p95 7,7 | mediana 1,8 ms, p95 9,6 |
| Desktop, cadência real | 16,7 ms | 16,7 ms |
| Celular 4×, Aurora: quadros > 20 ms | 0% | 0% |
| Celular 6×, Aurora: quadros > 20 ms (3 rodadas) | 47–53% | **25–28%** |
| Celular 4×, O Relâmpago: quadros > 20 ms | 0,3–14,7% | 0,3–1,9% |
| Celular 6×, O Relâmpago: quadros > 20 ms (3 rodadas) | 52–67% | 57–79% |

- **A 6×** o ambiente oscila muito: a mesma R05 já deu 3 de 3 aprovadas e depois 0 de 3. Nesse caso extremo, a máquina 30 com os poderes sorteados continua perdendo quadros, como na R05.
- **Onde a R06 reduziu custo:** os caches de peça parada e o chefe em sprite no modo econômico cortaram pela metade os quadros longos da Aurora.

## 6. Limitações reais

- **Arte:** é procedural, gerada por código. Não havia ferramenta de geração de imagem nem arquivo de arte de referência. A qualidade das peças grandes (bumpers, chefes, rampas) é a da Aurora R05; tablados e chefes das 29 são novos e não foram avaliados por pessoas.
- **Peças secundárias:** algumas continuam com o desenho R04 sobre os materiais. São elas: alvo giratório (criaturas, escudos, perseguição), esteira do labirinto, elevador, canhão, ímã, braço robótico, porta/locomotiva, roda-gigante, flores e bola cativa. Os tablados e efeitos dessas máquinas foram feitos em volta delas.
- **O Relâmpago:** os selos mostram os seis poderes sorteados lendo o anúncio real de início ("SEIS PODERES: …"). Se esse texto mudar nas regras, os selos somem; não há outra fonte pública.
- **Não validado:** celular físico, Safari/iOS (a área segura foi implementada, mas sem aparelho com entalhe), validação auditiva e opinião de jogadores.
- **Preview:** fica atrás do login da Vercel. O teste de fumaça foi feito no mesmo build servido localmente.

---

# Guia das 30 máquinas (gerado)

### 01. Aurora

- **Peças:** bumper com corpo #4a3a9a, tampa #5fd8f0 e decalque "estrela"; estilingue de acrílico #b48cff com decalque "estrela"; alvos #ffd27a (acesos #7df9ff); trilhos com fio de luz #b48cff; palhetas com borracha #7df9ff.
- **Chefe Estrela Rubra:** forma "estrela" (6 pontas, 2 olhos), material rubi, acessório nenhum, luz #ff3355; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Constelação):** traço de luz do alvo acertado até a próxima estrela da sequência (R05).
- **Andar de cima:** Observatório (bonus; variação premium); ambiente R06 por tipo de fase.

### 02. Passo Lunar

- **Peças:** bumper com corpo #5a5f78, tampa #e8ecff e decalque "lua"; estilingue de acrílico #ff4fd8 com decalque "circulo"; alvos #d8dcf0 (acesos #4dd2ff); trilhos com fio de luz #ff4fd8; palhetas com borracha #ff4fd8.
- **Chefe Globo de Espelhos:** forma "globo" (6 pontas, 2 olhos), material prata, acessório raios, luz #ff4fd8; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (No Compasso):** acerto no tempo da batida solta pulso gravitacional e poeira lunar; anel da pista pulsa com a batida real.
- **Andar de cima:** Palco Suspenso (premium; variação bonus); ambiente R06 por tipo de fase.

### 03. Bestiário Astral

- **Peças:** bumper com corpo #3a2a14, tampa #8dff6a e decalque "olho"; estilingue de acrílico #3ad6c0 com decalque "folha"; alvos #ffd166 (acesos #8dff6a); trilhos com fio de luz #ffd166; palhetas com borracha #8dff6a.
- **Chefe Ninho Astral:** forma "tentaculos" (7 pontas, 3 olhos), material jade, acessório chifres, luz #8dff6a; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Captura):** criatura capturada sobe como cometa com folhas; evolução abre pulso no ponto.
- **Andar de cima:** Ninho Alto (premium; variação chefao); ambiente R06 por tipo de fase.

### 04. Cidadela do Eclipse

- **Peças:** bumper com corpo #3a3440, tampa #ffb347 e decalque "coroa"; estilingue de acrílico #c0c7e0 com decalque "triangulo"; alvos #c0c7e0 (acesos #ffb347); trilhos com fio de luz #ffb347; palhetas com borracha #ff5a5f.
- **Chefe Portão:** forma "bloco" (5 pontas, 2 olhos), material pedra, acessório coroa, luz #ffb347; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Escudos Giratórios):** escudo quebrado solta lascas e anel; portão aberto dispara pulso grande no chefe.
- **Andar de cima:** Torre de Vigia (chefao; variação premium); ambiente R06 por tipo de fase.

### 05. Invasão

- **Peças:** bumper com corpo #1a2a3a, tampa #5cff9d e decalque "triangulo"; estilingue de acrílico #9d7bff com decalque "hex"; alvos #9d7bff (acesos #5cff9d); trilhos com fio de luz #5cff9d; palhetas com borracha #5cff9d.
- **Chefe Nave-Mãe:** forma "olho" (8 pontas, 1 olhos), material neon, acessório antena, luz #5cff9d; movimento "salta" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Salto Dimensional):** cada salto da nave-mãe deixa pulso e pixels na posição nova.
- **Andar de cima:** Convés (chefao; variação bonus); ambiente R06 por tipo de fase.

### 06. Caverna de Cristal

- **Peças:** bumper com corpo #2a1a4a, tampa #c9f6ff e decalque "diamante"; estilingue de acrílico #7ff0ff com decalque "diamante"; alvos #ff9de1 (acesos #7ff0ff); trilhos com fio de luz #c58cff; palhetas com borracha #c58cff.
- **Chefe Golem de Quartzo:** forma "cristal" (6 pontas, 2 olhos), material cristal, acessório gelo, luz #c58cff; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Ímã de Cristal):** pulso quando o ímã prende; cometa na direção real do disparo.
- **Andar de cima:** Veio Profundo (premium; variação bonus); ambiente R06 por tipo de fase.

### 07. Expresso Fantasma

- **Peças:** bumper com corpo #4a2a14, tampa #ffcf5c e decalque "circulo"; estilingue de acrílico #8f9bd9 com decalque "raio"; alvos #ffcf5c (acesos #aaffee); trilhos com fio de luz #ffcf5c; palhetas com borracha #aaffee.
- **Chefe Maquinista:** forma "mascara" (3 pontas, 2 olhos), material bronze, acessório cartola, luz #aaffee; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Locomotiva):** vapor sobe da locomotiva quando ela fecha um tiro.
- **Andar de cima:** Vagão-Teto (tunel; variação bonus); ambiente R06 por tipo de fase.

### 08. Oficina do Relojoeiro

- **Peças:** bumper com corpo #5a3a14, tampa #ffd27a e decalque "engrenagem"; estilingue de acrílico #c98b4a com decalque "engrenagem"; alvos #7fe0d0 (acesos #ffd27a); trilhos com fio de luz #ffd27a; palhetas com borracha #c98b4a.
- **Chefe Engrenagem-Mestra:** forma "engrenagem" (10 pontas, 2 olhos), material ouro, acessório engrenagens, luz #ffd27a; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (A Hora Marcada):** engrenagem gira em volta do mostrador quando o bumper-relógio é acertado.
- **Andar de cima:** Mecanismo (bonus; variação premium); ambiente R06 por tipo de fase.

### 09. Feira Elétrica

- **Peças:** bumper com corpo #c8304a, tampa #ffe45c e decalque "estrela"; estilingue de acrílico #ff5ea8 com decalque "estrela"; alvos #5ce1ff (acesos #ffe45c); trilhos com fio de luz #ffe45c; palhetas com borracha #ff5ea8.
- **Chefe Palhaço Voltaico:** forma "mascara" (5 pontas, 2 olhos), material esmalte, acessório cartola, luz #ff5ea8; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Roda-Gigante):** luzes correm em volta da roda conforme as cabines presas; roda solta dispara fogos e confete.
- **Andar de cima:** Topo da Roda (premium; variação bonus); ambiente R06 por tipo de fase.

### 10. Abissal

- **Peças:** bumper com corpo #0d3a7a, tampa #4dfff0 e decalque "gota"; estilingue de acrílico #3a7bff com decalque "onda"; alvos #ff7ad9 (acesos #4dfff0); trilhos com fio de luz #4dfff0; palhetas com borracha #4dfff0.
- **Chefe Kraken:** forma "tentaculos" (8 pontas, 2 olhos), material neon, acessório nenhum, luz #4dfff0; movimento "orbita" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (A Boca):** cometa percorre o cano sorteado e solta bolhas na saída (R04/R05).
- **Andar de cima:** Plataforma (chefao; variação premium); ambiente R06 por tipo de fase.

### 11. Vulcão Rubro

- **Peças:** bumper com corpo #2a1410, tampa #ffb02e e decalque "chama"; estilingue de acrílico #ff4a1c com decalque "chama"; alvos #ffe08a (acesos #ff7a1a); trilhos com fio de luz #ff4a1c; palhetas com borracha #ff7a1a.
- **Chefe Coração de Magma:** forma "estrela" (9 pontas, 2 olhos), material lava, acessório chamas, luz #ff4a1c; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Rampa de Salto):** pouso da rampa de salto: pulso de lava e brasas.
- **Andar de cima:** Cratera (tunel; variação chefao); ambiente R06 por tipo de fase.

### 12. Rota das Especiarias

- **Peças:** bumper com corpo #7a2a10, tampa #ffcc4d e decalque "flor"; estilingue de acrílico #e2572b com decalque "diamante"; alvos #38d6b0 (acesos #ffcc4d); trilhos com fio de luz #ffcc4d; palhetas com borracha #38d6b0.
- **Chefe Vizir:** forma "mascara" (7 pontas, 2 olhos), material esmalte, acessório plumas, luz #ffcc4d; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Caminho de Aventura):** saída do labirinto: pulso dourado e pigmentos.
- **Andar de cima:** Terraço (bonus; variação premium); ambiente R06 por tipo de fase.

### 13. Corrida Zero-G

- **Peças:** bumper com corpo #2a2f48, tampa #f5ff4d e decalque "raio"; estilingue de acrílico #ff3d81 com decalque "triangulo"; alvos #f5ff4d (acesos #39e0ff); trilhos com fio de luz #ff3d81; palhetas com borracha #39e0ff.
- **Chefe Piloto Sombrio:** forma "cristal" (3 pontas, 1 olhos), material obsidiana, acessório antena, luz #39e0ff; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Turbo de Órbita):** faixas de velocidade nas órbitas proporcionais ao medidor real de turbo; faíscas a cada órbita.
- **Andar de cima:** Pit Stop (premium; variação bonus); ambiente R06 por tipo de fase.

### 14. Floresta de Vidro

- **Peças:** bumper com corpo #1a4a40, tampa #d8fbff e decalque "folha"; estilingue de acrílico #6fe3c1 com decalque "folha"; alvos #b59bff (acesos #d8fbff); trilhos com fio de luz #6fe3c1; palhetas com borracha #6fe3c1.
- **Chefe Árvore-Mãe:** forma "cristal" (8 pontas, 3 olhos), material cristal, acessório folhas, luz #6fe3c1; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Três Camadas):** camada estilhaçada: cacos facetados; trincas visíveis no alvo conforme as vidas reais.
- **Andar de cima:** Copa (premium; variação chefao); ambiente R06 por tipo de fase.

### 15. Estação Órion

- **Peças:** bumper com corpo #2a3448, tampa #e6ecff e decalque "hex"; estilingue de acrílico #ff8a3d com decalque "hex"; alvos #e6ecff (acesos #6ee7ff); trilhos com fio de luz #6ee7ff; palhetas com borracha #6ee7ff.
- **Chefe IA-Órion:** forma "olho" (6 pontas, 1 olhos), material prata, acessório antena, luz #ff5533; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Braço Robótico):** pulso ao agarrar; cometa na direção real do arremesso.
- **Andar de cima:** Anel de Gravidade (chefao; variação premium); ambiente R06 por tipo de fase.

### 16. Catacumbas

- **Peças:** bumper com corpo #2a2620, tampa #d9d3c2 e decalque "caveira"; estilingue de acrílico #a45cff com decalque "caveira"; alvos #c9c2b0 (acesos #b6ff5c); trilhos com fio de luz #b6ff5c; palhetas com borracha #b6ff5c.
- **Chefe Guardião:** forma "mascara" (4 pontas, 2 olhos), material osso, acessório chamas, luz #b6ff5c; movimento "orbita" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (A Caveira):** chamas verdes ao engolir e ao cuspir.
- **Andar de cima:** Cripta (tunel; variação chefao); ambiente R06 por tipo de fase.

### 17. Tempestade

- **Peças:** bumper com corpo #1a2440, tampa #c8f1ff e decalque "raio"; estilingue de acrílico #6f8cff com decalque "raio"; alvos #ffe35c (acesos #c8f1ff); trilhos com fio de luz #ffe35c; palhetas com borracha #6f8cff.
- **Chefe Olho do Ciclone:** forma "olho" (12 pontas, 1 olhos), material prata, acessório raios, luz #6f8cff; movimento "orbita" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Pás do Moinho):** raio elétrico das pás até a bola quando a pá a rebate.
- **Andar de cima:** Torre do Vento (chefao; variação bonus); ambiente R06 por tipo de fase.

### 18. Circo Gravitacional

- **Peças:** bumper com corpo #c8203a, tampa #ffd84d e decalque "estrela"; estilingue de acrílico #ff3b4e com decalque "estrela"; alvos #4de1c1 (acesos #ffd84d); trilhos com fio de luz #ffd84d; palhetas com borracha #ffd84d.
- **Chefe Mestre de Pista:** forma "mascara" (1 pontas, 2 olhos), material esmalte, acessório cartola, luz #ffd84d; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Canhão Humano):** disparo do homem-bala solta confete.
- **Andar de cima:** Trapézio (premium; variação bonus); ambiente R06 por tipo de fase.

### 19. Laboratório Prisma

- **Peças:** bumper com corpo #2a2f48, tampa #e8f0ff e decalque "triangulo"; estilingue de acrílico #7aa2ff com decalque "triangulo"; alvos #ff6b9a (acesos #ffffff); trilhos com fio de luz #7aa2ff; palhetas com borracha #ffffff.
- **Chefe Prisma:** forma "cristal" (3 pontas, 1 olhos), material cristal, acessório raios, luz #ffffff; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Refração):** três cometas nas cores das bolas saem do prisma.
- **Andar de cima:** Sala Branca (bonus; variação premium); ambiente R06 por tipo de fase.

### 20. Deserto de Sal

- **Peças:** bumper com corpo #6a4818, tampa #ffe9a8 e decalque "triangulo"; estilingue de acrílico #e0a34d com decalque "triangulo"; alvos #59d8ff (acesos #ffe9a8); trilhos com fio de luz #e0a34d; palhetas com borracha #59d8ff.
- **Chefe Verme:** forma "serpente" (5 pontas, 1 olhos), material ouro, acessório nenhum, luz #e0a34d; movimento "orbita" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Areia Movediça):** cuspida do poço: pulso e poeira de areia.
- **Andar de cima:** Duna Alta (premium; variação chefao); ambiente R06 por tipo de fase.

### 21. Biblioteca Infinita

- **Peças:** bumper com corpo #4a2a14, tampa #ffd9a0 e decalque "circulo"; estilingue de acrílico #b0703c com decalque "coroa"; alvos #7fd1ff (acesos #ffd9a0); trilhos com fio de luz #ffd9a0; palhetas com borracha #7fd1ff.
- **Chefe Bibliotecário:** forma "bloco" (6 pontas, 2 olhos), material madeira, acessório olhos, luz #ffd9a0; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Carta na Mão):** livro aberto (banco de queda): pulso e páginas voando.
- **Andar de cima:** Mezanino (bonus; variação premium); ambiente R06 por tipo de fase.

### 22. Reator

- **Peças:** bumper com corpo #1a2a1a, tampa #c6ff3d e decalque "raio"; estilingue de acrílico #ff7a1a com decalque "hex"; alvos #3df2ff (acesos #c6ff3d); trilhos com fio de luz #c6ff3d; palhetas com borracha #c6ff3d.
- **Chefe Núcleo:** forma "engrenagem" (6 pontas, 1 olhos), material bronze, acessório raios, luz #c6ff3d; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Superaquecimento):** núcleo brilha conforme o medidor real de calor; faíscas acima de 70%.
- **Andar de cima:** Sala de Controle (chefao; variação bonus); ambiente R06 por tipo de fase.

### 23. Carnaval de Máscaras

- **Peças:** bumper com corpo #5a1a7a, tampa #ffe14d e decalque "estrela"; estilingue de acrílico #ff3fa4 com decalque "flor"; alvos #33e0a1 (acesos #ffe14d); trilhos com fio de luz #ffe14d; palhetas com borracha #ff3fa4.
- **Chefe Rei Momo:** forma "mascara" (5 pontas, 2 olhos), material ouro, acessório plumas, luz #ffe14d; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Quatro Máscaras):** pagamento da assinatura com confete (FOLIA).
- **Andar de cima:** Camarote (premium; variação bonus); ambiente R06 por tipo de fase.

### 24. Cidade Neon

- **Peças:** bumper com corpo #1a1040, tampa #21e6ff e decalque "triangulo"; estilingue de acrílico #ff2bd6 com decalque "raio"; alvos #ffe53b (acesos #21e6ff); trilhos com fio de luz #21e6ff; palhetas com borracha #ff2bd6.
- **Chefe Sindicato:** forma "bloco" (4 pontas, 3 olhos), material neon, acessório olhos, luz #ff2bd6; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Perseguição):** rastro de luz pelo trilho quando um alvo é pego (R04/R05).
- **Andar de cima:** Cobertura (chefao; variação premium); ambiente R06 por tipo de fase.

### 25. Jardim Suspenso

- **Peças:** bumper com corpo #1a4a24, tampa #ff8fc7 e decalque "flor"; estilingue de acrílico #7be36a com decalque "folha"; alvos #ffe46b (acesos #ff8fc7); trilhos com fio de luz #7be36a; palhetas com borracha #ff8fc7.
- **Chefe Rainha-Raiz:** forma "tentaculos" (6 pontas, 2 olhos), material jade, acessório folhas, luz #ff8fc7; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Flores Vivas):** flor visitada: pulso rosa e pétalas.
- **Andar de cima:** Estufa (premium; variação chefao); ambiente R06 por tipo de fase.

### 26. Mina Profunda

- **Peças:** bumper com corpo #4a3420, tampa #ffc24d e decalque "diamante"; estilingue de acrílico #9c7b5a com decalque "diamante"; alvos #5cf2c8 (acesos #ffc24d); trilhos com fio de luz #ffc24d; palhetas com borracha #5cf2c8.
- **Chefe Capataz:** forma "bloco" (3 pontas, 2 olhos), material pedra, acessório chifres, luz #ffc24d; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Elevador):** cometa sobe o poço até a saída do nível real.
- **Andar de cima:** Nível −3 (premium; variação tunel); ambiente R06 por tipo de fase.

### 27. Templo da Serpente

- **Peças:** bumper com corpo #1a3a20, tampa #d9b25c e decalque "espiral"; estilingue de acrílico #37d67a com decalque "triangulo"; alvos #d9b25c (acesos #37d67a); trilhos com fio de luz #d9b25c; palhetas com borracha #37d67a.
- **Chefe Serpente:** forma "serpente" (6 pontas, 1 olhos), material jade, acessório coroa, luz #37d67a; movimento "orbita" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Serpente Mecânica):** escamas faiscam quando a serpente bloqueia a rampa.
- **Andar de cima:** Altar (chefao; variação bonus); ambiente R06 por tipo de fase.

### 28. Estúdio 45

- **Peças:** bumper com corpo #2a1a30, tampa #ff9f43 e decalque "nota"; estilingue de acrílico #ee5a8a com decalque "nota"; alvos #54e0c7 (acesos #ff9f43); trilhos com fio de luz #ee5a8a; palhetas com borracha #ff9f43.
- **Chefe Produtor:** forma "globo" (4 pontas, 2 olhos), material esmalte, acessório notas, luz #ff9f43; movimento "vaga" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Disco Giratório):** anéis em volta do vinil pela rotação real; notas a cada acerto.
- **Andar de cima:** Cabine (bonus; variação premium); ambiente R06 por tipo de fase.

### 29. Fronteira Gelada

- **Peças:** bumper com corpo #1a3a5a, tampa #e6fbff e decalque "floco"; estilingue de acrílico #6fc3ff com decalque "floco"; alvos #b9a4ff (acesos #e6fbff); trilhos com fio de luz #6fc3ff; palhetas com borracha #6fc3ff.
- **Chefe Colosso:** forma "cristal" (5 pontas, 2 olhos), material gelo, acessório gelo, luz #6fc3ff; movimento "fixo" e vidas 3/4/5 inalterados.
- **Mecânica-assinatura (Piso Congelado):** gelo trincando: cristais e anel no chefe e no banco.
- **Andar de cima:** Geleira (chefao; variação bonus); ambiente R06 por tipo de fase.

### 30. O Relâmpago

- **Peças:** bumper com corpo #2a2f56, tampa #fff36b e decalque "raio"; estilingue de acrílico #8ab4ff com decalque "raio"; alvos #fff36b (acesos #ffffff); trilhos com fio de luz #fff36b; palhetas com borracha #fff36b.
- **Chefe O Primeiro:** forma "estrela" (12 pontas, 3 olhos), material ouro, acessório raios, luz #fff36b; movimento "orbita" e vidas 4/5/6 inalterados.
- **Mecânica-assinatura (Seis Poderes):** seis selos com os nomes dos poderes realmente sorteados; raio até a bola em cada golpe no chefe.
- **Andar de cima:** Olimpo (tunel; variação chefao); ambiente R06 por tipo de fase.

