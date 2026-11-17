# Playtest público R06.2

**Link público (sem login):** https://cintila3-playtest.vercel.app

| | |
|---|---|
| Branch | `playtest-r06-2` (a partir da `visual-r06-1`) |
| Commit do código publicado | `b510de9` (aparece no rodapé da galeria: "playtest R06.2 · build b510de9") |
| Projeto Vercel | `cintila3-playtest` (`prj_7ReCjCvd4oNJufDDNos72eDTWnru`), separado do projeto oficial `cintila3` |
| Deployment | `dpl_4hLQ5abokE2hrHqSJhj3hrpX5SEy` (produção do projeto de playtest), bundle `assets/index-SrTY7tZX.js` |
| Produção oficial | https://cintila3.vercel.app, **intocada** (v3.0.2, sem noindex, com bloqueios) |

## Como funciona o modo de testes

- **Ativação:** é feita só na build, com a variável `VITE_PLAYTEST=1` (`src/playtest.ts`). A build oficial (`npm run build` sem a variável) continua exatamente como antes. Isso é verificado por `OFICIAL=1 node test/playtest.mjs`: 29 bloqueadas e nenhum laboratório.
- **30 máquinas liberadas:** `salvo.desbloqueadas()` devolve 30 no playtest sem gravar nada. As regras de desbloqueio (`src/game/campaign.ts`) não mudaram.
- **Progresso isolado:** fica no prefixo `cintila3.playtest.*` do armazenamento local de cada aparelho. Cada testador tem o seu, não há login nem banco de dados, e nada é coletado.
- **Partida normal (▶ JOGAR):** é idêntica à oficial e grava recorde, mestria e partidas no prefixo do playtest.
- **🧪 TESTAR RECURSOS:** aparece só no playtest, na vitrine da máquina selecionada. Abre uma **partida de demonstração** já no estado pedido, chamando métodos reais do jogo. Demonstrações não gravam recorde, mestria, partidas nem desbloqueio. Os 15 recursos:
  - confronto com o chefe (andar no modo chefão);
  - derrubar a fase do chefe (`derrubaFase`);
  - chefe na última vida;
  - modo mago (`iniciaMago`);
  - multibola (duas travas reais);
  - jackpot;
  - super jackpot (três jackpots acendem o super e o golpe no chefe paga);
  - acender o andar de cima;
  - fase bônus;
  - etapa premium;
  - túnel mágico;
  - subfases núcleo, enxame e muralha;
  - Câmara Alta.
- **Mecânica-assinatura:** acontece jogando. O laboratório explica o que fazer e oferece "Só jogar (demonstração)". Não foi criado gatilho artificial para ela.
- **Na pausa de uma demonstração:** cada recurso abre uma demonstração nova na mesma máquina, porque alguns estados não combinam (por regra, não se sobe ao andar durante o modo mago).
- **O Relâmpago:** a partida normal sorteia os seis poderes como sempre. Os nomes aparecem nos selos em volta do chefe, no painel esquerdo (desktop) e na pausa. A leitura vem do dado estruturado `sigs[0].poderes`; o sorteio não muda.
- **Facilidades:**
  - guia rápido na galeria (escolher, jogar, lançar, palhetas, pausar, voltar, testar recursos);
  - botão de pausa ❚❚ na tela, respeitando a área segura;
  - música, efeitos e narrador ligáveis na pausa e em OPÇÕES.
  - O áudio começa no primeiro toque ou clique, como os navegadores móveis exigem; a síntese não foi tocada.
- **Indexação:** `<meta name="robots" content="noindex,nofollow,noarchive">` (só na build de playtest), cabeçalho `X-Robots-Tag: noindex, nofollow, noarchive` e `robots.txt` com `Disallow: /`. Nada disso impede abrir pelo link.

## Publicação (como foi feita)

```bash
VITE_PLAYTEST=1 VITE_COMMIT=$(git rev-parse --short HEAD) npm run build
# copiar dist/ para a pasta de deploy ../cintila3-playtest (fora do repositório), com vercel.json (X-Robots-Tag) e robots.txt
cd ../cintila3-playtest && vercel deploy --prod --yes
```

**Acesso:** a URL `cintila3-playtest.vercel.app` é o domínio de produção desse projeto, e a proteção padrão da Vercel não se aplica a ele. Por isso abre sem login, e nenhuma configuração de proteção foi alterada. O endereço específico de cada deployment (`cintila3-playtest-<hash>-…vercel.app`) continua protegido (302), que é o comportamento padrão.

## Como desativar no futuro

1. Na Vercel, apagar o projeto `cintila3-playtest` (Settings → Delete Project) ou remover o domínio dele. O projeto oficial `cintila3` não é afetado.
2. O código do modo de testes só liga com `VITE_PLAYTEST=1`. Builds oficiais não precisam de mudança; para retirar o código, basta reverter os commits da branch `playtest-r06-2` antes de promover para a `main`.

## Testes

| Teste | Resultado |
|---|---|
| `npm test` | 80 de 80; dreno lateral 6,1% (física e regras sem nenhuma linha alterada desde a R06.1) |
| `test/e2e.mjs` (30 máquinas, campanha, eterno) | passa, 0 erros |
| `test/telas.mjs`, `test/atracao.mjs`, `test/progresso.mjs` | passam |
| `test/visual.mjs` 1440×900 e 390×844 (inclui bloqueios preservados na build oficial) | passa |
| `test/audio.mjs` | aprovado |
| `test/playtest.mjs` (dev com playtest; desktop e celular): 30 livres, máquina 30 direto, 6 poderes, lançamento e palheta por teclado e por toque, pausa na tela, som e poderes na pausa, 8 recursos do laboratório, fim de demonstração sem gravar, armazenamento isolado | passa |
| `OFICIAL=1 test/playtest.mjs` | build oficial com 29 bloqueadas e sem laboratório |
| `test/laboratorio.mjs`: 15 recursos × 30 máquinas, 4 s de simulação real depois de cada um | 450 de 450 chegaram ao estado pedido, 0 NaN, 0 erros |
| `test/recorde-playtest.mjs` | partida normal grava recorde só em `cintila3.playtest.*` |
| `test/publico.mjs` na **URL pública**, contexto anônimo, só pela interface, em 1366×768, 390×844 e 360×640 | ver abaixo |
| Build oficial | sem noindex |

Itens verificados pelo `test/publico.mjs`, todos ok:

- HTTP 200 sem login, cabeçalho e meta `noindex`, `robots.txt`;
- 30 máquinas e nenhuma bloqueada;
- máquina 17 selecionada direto;
- áudio `running` após o clique ou toque;
- botão de pausa e som na pausa;
- laboratório abrindo modo mago e chefão;
- 0 erros de console.

## Limitações (precisam de gente e de aparelho)

- **Nada foi jogado em celular físico.** Os testes de toque usam eventos de toque emulados no Chrome desktop. Safari e Chrome no iPhone, Android real, entalhe e barra de gestos precisam ser conferidos pelos testadores.
- **Áudio:** só foi verificado que o contexto de áudio liga após a interação. A qualidade do som e da música precisa ser ouvida.
- **Desempenho:** em aparelhos de entrada é desconhecido. A emulação com CPU 6× mostra quadros lentos ocasionais (ver R06.1).
- **Orientação:** o jogo funciona em retrato e em paisagem, sem bloqueio. Em celular deitado a mesa fica pequena; recomenda-se jogar em pé (retrato).
- **Armazenamento local:** recordes ficam no navegador de cada pessoa e somem se ela limpar os dados do site. Não há placar compartilhado.
