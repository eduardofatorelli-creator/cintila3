// Manifesto visual das 30 máquinas. Associação sempre pelo id da máquina (nunca pela posição na lista).
// Não repete dado de jogo: nome, paleta, chefe e assinatura continuam em MachineDef.

export type Insert = 'redondo' | 'seta' | 'losango' | 'estrela' | 'hex' | 'gota' | 'escudo' | 'triangulo' | 'quadrado';
export type Ambiente = 'cintilar' | 'aurora' | 'bolhas' | 'brasas' | 'neve' | 'chuva' | 'vagalumes' | 'faiscas' | 'poeira' | 'neon' | 'notas' | 'confete' | 'petalas' | 'vapor' | 'feixes' | 'pixels' | 'prisma' | 'folhas' | 'raios';
export type Particula = 'estrela' | 'bolha' | 'brasa' | 'floco' | 'nota' | 'petala' | 'faisca' | 'pixel' | 'cristal' | 'folha' | 'engrenagem' | 'confete' | 'grao' | 'raio';
export type Choque = 'anel' | 'onda' | 'estrela' | 'raio' | 'quadrado' | 'petalas' | 'engrenagem' | 'cristal';

export interface Material {
  /** escuro, médio, brilho do metal (trilhos, saias, pivôs) */
  metal: [string, string, string];
  /** cor da borracha (anéis das palhetas e estilingues) */
  borracha: string;
  /** como a tampa do bumper é desenhada */
  tampa: 'domo' | 'anel' | 'facetado' | 'vidro' | 'disco';
}
export const MATERIAIS: Record<string, Material> = {
  cromo: { metal: ['#30364a', '#a9b3ca', '#ffffff'], borracha: '#f1f3ff', tampa: 'domo' },
  latao: { metal: ['#3e2a0c', '#c79b45', '#fff0bf'], borracha: '#1d1712', tampa: 'anel' },
  cobre: { metal: ['#3d1a0b', '#c3703a', '#ffd8b5'], borracha: '#1f1410', tampa: 'disco' },
  ferro: { metal: ['#17191e', '#5b616d', '#c9cfdb'], borracha: '#2b2b2f', tampa: 'disco' },
  gelo: { metal: ['#24506b', '#b8ecff', '#ffffff'], borracha: '#e9fbff', tampa: 'vidro' },
  ouro: { metal: ['#4d3806', '#e2b843', '#fff7cf'], borracha: '#f7f1e0', tampa: 'facetado' },
  grafite: { metal: ['#0b0b14', '#3a3552', '#e2d8ff'], borracha: '#161320', tampa: 'anel' },
  osso: { metal: ['#322d24', '#c8bea5', '#fffbea'], borracha: '#2a2620', tampa: 'domo' },
  coral: { metal: ['#09283a', '#4a8ca8', '#d4fbff'], borracha: '#0f3346', tampa: 'vidro' },
  madeira: { metal: ['#26140a', '#8b5a31', '#f2c992'], borracha: '#1a110b', tampa: 'disco' },
  jade: { metal: ['#0b2818', '#3aa874', '#d6ffe6'], borracha: '#0f2216', tampa: 'facetado' },
  cristal: { metal: ['#2c2a52', '#c8c4ff', '#ffffff'], borracha: '#f4f2ff', tampa: 'facetado' },
};

export interface VisualDef {
  /** frase de direção de arte, usada no guia e na entrada */
  conceito: string;
  material: keyof typeof MATERIAIS;
  insert: Insert;
  ambiente: Ambiente;
  particula: Particula;
  choque: Choque;
  /** luz dominante do gabinete e do reflexo do vidro */
  luz: string;
  /** o efeito especial ligado à mecânica real (descrição para o guia) */
  efeito: string;
}

export const VISUAIS: Record<string, VisualDef> = {
  aurora: { conceito: 'Céu polar: cortinas de aurora sobre um lago espelhado, constelações gravadas em prata', material: 'cromo', insert: 'estrela', ambiente: 'aurora', particula: 'estrela', choque: 'estrela', luz: '#7df9ff', efeito: 'Linhas de constelação ligam os alvos numerados; cada estrela acesa dispara um traço de luz até a próxima' },
  'passo-lunar': { conceito: 'Salão de dança na Lua: piso quadriculado iluminado, globo de espelhos e a Terra no horizonte', material: 'cromo', insert: 'quadrado', ambiente: 'feixes', particula: 'pixel', choque: 'quadrado', luz: '#ff4fd8', efeito: 'Feixes do globo varrem a mesa no compasso da música; acertos no tempo soltam quadrados de piso aceso' },
  bestiario: { conceito: 'Livro mágico aberto: gravuras em hachura, olhos na floresta e criaturas de luz', material: 'latao', insert: 'gota', ambiente: 'vagalumes', particula: 'folha', choque: 'onda', luz: '#8dff6a', efeito: 'Vagalumes orbitam as criaturas; cada captura abre um círculo rúnico no ponto do golpe' },
  cidadela: { conceito: 'Muralha de pedra sob eclipse: torres, brasões e um portão de ferro no centro', material: 'ferro', insert: 'escudo', ambiente: 'poeira', particula: 'grao', choque: 'anel', luz: '#ffb347', efeito: 'Os quatro escudos giram sobre um brasão pintado; cada escudo quebrado espalha lascas de pedra' },
  invasao: { conceito: 'Cidade sob ataque: feixe de abdução, painel de radar e luz verde alienígena', material: 'grafite', insert: 'triangulo', ambiente: 'feixes', particula: 'pixel', choque: 'anel', luz: '#5cff9d', efeito: 'Grade de radar sob a nave-mãe; cada salto da nave deixa um anel de varredura' },
  caverna: { conceito: 'Gruta de geodos: veios minerais, estalactites e reflexos de cristal no chão molhado', material: 'cristal', insert: 'losango', ambiente: 'cintilar', particula: 'cristal', choque: 'cristal', luz: '#c58cff', efeito: 'O ímã é um geodo aberto; cristais acendem em volta enquanto a bola está presa' },
  expresso: { conceito: 'Estação fantasma: trilhos que somem na névoa, relógio de plataforma e vapor esverdeado', material: 'cobre', insert: 'redondo', ambiente: 'vapor', particula: 'brasa', choque: 'onda', luz: '#aaffee', efeito: 'A linha da locomotiva é um leito de trilhos pintado; vapor sobe quando o trem passa' },
  relojoeiro: { conceito: 'Bancada de relojoeiro: mostradores, engrenagens de latão e pinos de rubi', material: 'latao', insert: 'redondo', ambiente: 'poeira', particula: 'engrenagem', choque: 'engrenagem', luz: '#ffd27a', efeito: 'O bumper-relógio fica sobre um mostrador gravado com as 4 horas de prêmio' },
  feira: { conceito: 'Parque à noite: lâmpadas de marquise, lona listrada e a roda-gigante iluminada', material: 'cromo', insert: 'estrela', ambiente: 'confete', particula: 'confete', choque: 'estrela', luz: '#ff5ea8', efeito: 'Lâmpadas de marquise piscam em corrida a cada cabine travada na roda' },
  abissal: { conceito: 'Fossa oceânica: feixes de luz que descem, recife bioluminescente e o covil do Kraken', material: 'coral', insert: 'gota', ambiente: 'bolhas', particula: 'bolha', choque: 'onda', luz: '#4dfff0', efeito: 'A Boca é um redemoinho pintado; os três canos têm trilhas luminosas e a bola cuspida solta bolhas' },
  vulcao: { conceito: 'Cratera ativa: rios de magma, basalto rachado e céu de cinzas', material: 'ferro', insert: 'triangulo', ambiente: 'brasas', particula: 'brasa', choque: 'raio', luz: '#ff4a1c', efeito: 'A rampa de salto tem um rio de lava pintado por baixo; o pouso solta brasas' },
  especiarias: { conceito: 'Bazar de especiarias: azulejos, montes de pigmento e arcos mouriscos', material: 'cobre', insert: 'losango', ambiente: 'poeira', particula: 'grao', choque: 'petalas', luz: '#ffcc4d', efeito: 'O labirinto é um tapete de azulejos; as saídas certas são marcadas em ouro' },
  'zero-g': { conceito: 'Pista orbital: anel de corrida em volta de um planeta, faixas de velocidade', material: 'cromo', insert: 'seta', ambiente: 'raios', particula: 'faisca', choque: 'anel', luz: '#39e0ff', efeito: 'Cada órbita seguida acende mais faixas de velocidade nas laterais' },
  'floresta-vidro': { conceito: 'Bosque de vidro: troncos translúcidos, folhas facetadas e luz filtrada', material: 'cristal', insert: 'losango', ambiente: 'cintilar', particula: 'cristal', choque: 'cristal', luz: '#6fe3c1', efeito: 'Os alvos de três camadas trincam em estilhaços facetados' },
  orion: { conceito: 'Estação orbital: painéis solares, mapa estelar técnico e a nebulosa de Órion', material: 'cromo', insert: 'hex', ambiente: 'cintilar', particula: 'pixel', choque: 'anel', luz: '#6ee7ff', efeito: 'O braço robótico trabalha sobre uma doca hexagonal com marcações de mira' },
  catacumbas: { conceito: 'Galerias de ossos: arcos de pedra, nichos com velas e símbolos gravados', material: 'osso', insert: 'escudo', ambiente: 'vagalumes', particula: 'grao', choque: 'onda', luz: '#b6ff5c', efeito: 'A caveira fica num nicho de velas; a multibola dela sai entre chamas verdes' },
  tempestade: { conceito: 'Moinho na tormenta: nuvens em espiral, chuva diagonal e relâmpagos', material: 'ferro', insert: 'seta', ambiente: 'chuva', particula: 'raio', choque: 'raio', luz: '#6f8cff', efeito: 'O moinho fica no olho do ciclone; rajadas fortes soltam faíscas elétricas' },
  circo: { conceito: 'Picadeiro: lona listrada, holofotes cruzados e serragem no chão', material: 'latao', insert: 'estrela', ambiente: 'feixes', particula: 'confete', choque: 'estrela', luz: '#ffd84d', efeito: 'O canhão é a atração principal: alvo pintado no picadeiro e holofotes que o seguem' },
  prisma: { conceito: 'Laboratório óptico: bancada de lentes, feixe branco que se divide em espectro', material: 'cristal', insert: 'triangulo', ambiente: 'prisma', particula: 'cristal', choque: 'cristal', luz: '#ffffff', efeito: 'O prisma recebe um feixe branco pintado e solta o espectro; as três bolas deixam rastro da sua cor' },
  deserto: { conceito: 'Salar ao meio-dia: dunas, ruínas douradas e o sol dramático', material: 'ouro', insert: 'triangulo', ambiente: 'poeira', particula: 'grao', choque: 'onda', luz: '#e0a34d', efeito: 'O poço de areia é um redemoinho de dunas; a cuspida levanta poeira dourada' },
  biblioteca: { conceito: 'Biblioteca sem fim: estantes em perspectiva, escada e páginas que voam', material: 'madeira', insert: 'escudo', ambiente: 'poeira', particula: 'folha', choque: 'onda', luz: '#ffd9a0', efeito: 'O banco de queda é uma fileira de lombadas; cada livro aberto solta páginas' },
  reator: { conceito: 'Núcleo de energia: tubulações, chapas rebitadas e anéis de contenção', material: 'ferro', insert: 'hex', ambiente: 'faiscas', particula: 'faisca', choque: 'raio', luz: '#c6ff3d', efeito: 'O medidor de calor tinge o núcleo pintado; no superaquecimento a mesa inteira ferve' },
  carnaval: { conceito: 'Desfile: serpentinas, plumas, máscaras e a avenida iluminada', material: 'ouro', insert: 'losango', ambiente: 'confete', particula: 'confete', choque: 'petalas', luz: '#ff3fa4', efeito: 'Serpentinas pintadas guiam para as rampas; a máscara escolhida tinge o confete' },
  'cidade-neon': { conceito: 'Metrópole na chuva: letreiros de neon, asfalto molhado e viadutos', material: 'grafite', insert: 'seta', ambiente: 'neon', particula: 'pixel', choque: 'quadrado', luz: '#ff2bd6', efeito: 'Os trilhos da perseguição são linhas de neon no asfalto; cada alvo pego deixa um rastro de luz' },
  jardim: { conceito: 'Jardim suspenso: canteiros em terraço, cipós, flores e vagalumes', material: 'jade', insert: 'gota', ambiente: 'petalas', particula: 'petala', choque: 'petalas', luz: '#7be36a', efeito: 'As flores abrem sobre canteiros pintados; cada visita solta pétalas' },
  mina: { conceito: 'Poço de mina: escoras de madeira, trilhos, minério brilhando e lanternas', material: 'cobre', insert: 'redondo', ambiente: 'poeira', particula: 'grao', choque: 'onda', luz: '#ffc24d', efeito: 'O elevador corre num poço com escoras; cada nível acende uma lanterna' },
  templo: { conceito: 'Templo na selva: colunas, degraus, glifos de serpente e chamas cerimoniais', material: 'jade', insert: 'triangulo', ambiente: 'vagalumes', particula: 'folha', choque: 'onda', luz: '#37d67a', efeito: 'A rampa da serpente tem escamas pintadas; quando ela recua a rampa ganha brilho de ouro' },
  estudio45: { conceito: 'Estúdio analógico: mesa de som, VU-metros, fita de rolo e o vinil girando', material: 'cromo', insert: 'redondo', ambiente: 'notas', particula: 'nota', choque: 'onda', luz: '#ff9f43', efeito: 'O vinil fica sobre um prato gravado; a rotação solta notas no ritmo' },
  gelada: { conceito: 'Fronteira gelada: geleira azul, cristais de neve e aurora pálida', material: 'gelo', insert: 'losango', ambiente: 'neve', particula: 'floco', choque: 'cristal', luz: '#6fc3ff', efeito: 'O piso inteiro é gelo com rachaduras; a mesa brilha mais forte quando o gelo trinca' },
  relampago: { conceito: 'A última máquina: céu monumental de tempestade, colunas de mármore e ouro elétrico', material: 'ouro', insert: 'estrela', ambiente: 'raios', particula: 'raio', choque: 'raio', luz: '#fff36b', efeito: 'Os seis poderes sorteados aparecem como selos dourados; relâmpagos ligam as peças em cada golpe forte' },
};

export const visualDe = (id: string): VisualDef => VISUAIS[id] || VISUAIS.aurora;
export const materialDe = (id: string): Material => MATERIAIS[visualDe(id).material];
