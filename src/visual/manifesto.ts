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
  aurora: { conceito: 'Céu polar: cortinas de aurora sobre um lago espelhado, constelações gravadas em prata', material: 'cromo', insert: 'estrela', ambiente: 'aurora', particula: 'estrela', choque: 'estrela', luz: '#7df9ff', efeito: 'Linhas de constelação pintadas ligam os alvos numerados na ordem real; cada estrela acertada manda um traço de luz até a próxima da sequência' },
  'passo-lunar': { conceito: 'Salão de dança na Lua: piso quadriculado iluminado, globo de espelhos e a Terra no horizonte', material: 'cromo', insert: 'quadrado', ambiente: 'feixes', particula: 'pixel', choque: 'quadrado', luz: '#ff4fd8', efeito: 'Pista quadriculada pintada sob o Globo de Espelhos; feixes de luz varrem a mesa devagar; os acertos soltam quadrados de luz' },
  bestiario: { conceito: 'Livro mágico aberto: gravuras em hachura, olhos na floresta e criaturas de luz', material: 'latao', insert: 'gota', ambiente: 'vagalumes', particula: 'folha', choque: 'onda', luz: '#8dff6a', efeito: 'Roseta rúnica no ninho do chefe e no centro das criaturas; vagalumes no ar; acertar uma criatura solta um anel ondulado' },
  cidadela: { conceito: 'Muralha de pedra sob eclipse: torres, brasões e um portão de ferro no centro', material: 'ferro', insert: 'escudo', ambiente: 'poeira', particula: 'grao', choque: 'anel', luz: '#ffb347', efeito: 'Brasão pintado com os quatro escudos sob o Portão; cada escudo atingido solta um anel e lascas de pedra' },
  invasao: { conceito: 'Cidade sob ataque: feixe de abdução, painel de radar e luz verde alienígena', material: 'grafite', insert: 'triangulo', ambiente: 'feixes', particula: 'pixel', choque: 'anel', luz: '#5cff9d', efeito: 'Grade de radar com varredura pintada sob a Nave-Mãe; os golpes na nave disparam um choque elétrico' },
  caverna: { conceito: 'Gruta de geodos: veios minerais, estalactites e reflexos de cristal no chão molhado', material: 'cristal', insert: 'losango', ambiente: 'cintilar', particula: 'cristal', choque: 'cristal', luz: '#c58cff', efeito: 'O ímã fica no meio de um geodo aberto (cristais pintados em volta da posição real); acertos soltam estilhaços de cristal' },
  expresso: { conceito: 'Estação fantasma: trilhos que somem na névoa, relógio de plataforma e vapor esverdeado', material: 'cobre', insert: 'redondo', ambiente: 'vapor', particula: 'brasa', choque: 'onda', luz: '#aaffee', efeito: 'Leito de trilhos pintado exatamente na linha por onde a locomotiva passa; vapor sobe o tempo todo pela mesa' },
  relojoeiro: { conceito: 'Bancada de relojoeiro: mostradores, engrenagens de latão e pinos de rubi', material: 'latao', insert: 'redondo', ambiente: 'poeira', particula: 'engrenagem', choque: 'engrenagem', luz: '#ffd27a', efeito: 'O bumper-relógio fica sobre um mostrador gravado com as quatro horas de prêmio (dobro, ouro, escudo, bônus); acertos soltam engrenagens' },
  feira: { conceito: 'Parque à noite: lâmpadas de marquise, lona listrada e a roda-gigante iluminada', material: 'cromo', insert: 'estrela', ambiente: 'confete', particula: 'confete', choque: 'estrela', luz: '#ff5ea8', efeito: 'Roda-gigante pintada em volta da roda real, lona listrada e lâmpadas de marquise; cabines e bumpers soltam confete' },
  abissal: { conceito: 'Fossa oceânica: feixes de luz que descem, recife bioluminescente e o covil do Kraken', material: 'coral', insert: 'gota', ambiente: 'bolhas', particula: 'bolha', choque: 'onda', luz: '#4dfff0', efeito: 'A Boca é um redemoinho pintado com as trilhas dos três canos; a bola cuspida percorre o cano com um cometa de luz e solta bolhas na saída' },
  vulcao: { conceito: 'Cratera ativa: rios de magma, basalto rachado e céu de cinzas', material: 'ferro', insert: 'triangulo', ambiente: 'brasas', particula: 'brasa', choque: 'raio', luz: '#ff4a1c', efeito: 'Rio de lava pintado sob o caminho das rampas; o pouso da rampa de salto solta um choque e brasas' },
  especiarias: { conceito: 'Bazar de especiarias: azulejos, montes de pigmento e arcos mouriscos', material: 'cobre', insert: 'losango', ambiente: 'poeira', particula: 'grao', choque: 'petalas', luz: '#ffcc4d', efeito: 'Tapete de azulejos sob o labirinto e luz dourada nas duas saídas reais; acertos soltam pétalas' },
  'zero-g': { conceito: 'Pista orbital: anel de corrida em volta de um planeta, faixas de velocidade', material: 'cromo', insert: 'seta', ambiente: 'raios', particula: 'faisca', choque: 'anel', luz: '#39e0ff', efeito: 'Setas de velocidade pintadas nas pistas das órbitas; cada órbita lança um cometa de luz pela pista lateral' },
  'floresta-vidro': { conceito: 'Bosque de vidro: troncos translúcidos, folhas facetadas e luz filtrada', material: 'cristal', insert: 'losango', ambiente: 'cintilar', particula: 'cristal', choque: 'cristal', luz: '#6fe3c1', efeito: 'Vitral pintado sob cada alvo de três camadas; os acertos soltam estilhaços facetados' },
  orion: { conceito: 'Estação orbital: painéis solares, mapa estelar técnico e a nebulosa de Órion', material: 'cromo', insert: 'hex', ambiente: 'cintilar', particula: 'pixel', choque: 'anel', luz: '#6ee7ff', efeito: 'Doca hexagonal com marcas de mira pintada sob o braço robótico; o arremesso solta um anel' },
  catacumbas: { conceito: 'Galerias de ossos: arcos de pedra, nichos com velas e símbolos gravados', material: 'osso', insert: 'escudo', ambiente: 'vagalumes', particula: 'grao', choque: 'onda', luz: '#b6ff5c', efeito: 'Nicho octogonal pintado sob a caveira, velas nas galerias; a cuspida da caveira solta um choque ondulado' },
  tempestade: { conceito: 'Moinho na tormenta: nuvens em espiral, chuva diagonal e relâmpagos', material: 'ferro', insert: 'seta', ambiente: 'chuva', particula: 'raio', choque: 'raio', luz: '#6f8cff', efeito: 'O moinho fica no olho de um ciclone pintado; as pás atingidas soltam um choque de raio' },
  circo: { conceito: 'Picadeiro: lona listrada, holofotes cruzados e serragem no chão', material: 'latao', insert: 'estrela', ambiente: 'feixes', particula: 'confete', choque: 'estrela', luz: '#ffd84d', efeito: 'Alvo de picadeiro pintado sob o canhão e holofotes cruzados; o disparo solta confete' },
  prisma: { conceito: 'Laboratório óptico: bancada de lentes, feixe branco que se divide em espectro', material: 'cristal', insert: 'triangulo', ambiente: 'prisma', particula: 'cristal', choque: 'cristal', luz: '#ffffff', efeito: 'Um feixe branco pintado chega ao prisma e sai em espectro; as três bolas coloridas deixam rastro da sua cor' },
  deserto: { conceito: 'Salar ao meio-dia: dunas, ruínas douradas e o sol dramático', material: 'ouro', insert: 'triangulo', ambiente: 'poeira', particula: 'grao', choque: 'onda', luz: '#e0a34d', efeito: 'Redemoinho de areia pintado sob o poço; a cuspida solta um choque e poeira dourada' },
  biblioteca: { conceito: 'Biblioteca sem fim: estantes em perspectiva, escada e páginas que voam', material: 'madeira', insert: 'escudo', ambiente: 'poeira', particula: 'folha', choque: 'onda', luz: '#ffd9a0', efeito: 'Estantes em perspectiva, escada e páginas soltas; o banco de queda (que abre as cartas) solta páginas' },
  reator: { conceito: 'Núcleo de energia: tubulações, chapas rebitadas e anéis de contenção', material: 'ferro', insert: 'hex', ambiente: 'faiscas', particula: 'faisca', choque: 'raio', luz: '#c6ff3d', efeito: 'Núcleo com anéis de contenção pintado sob o chefe e tubulações nas laterais; acertos soltam faíscas e choques de raio' },
  carnaval: { conceito: 'Desfile: serpentinas, plumas, máscaras e a avenida iluminada', material: 'ouro', insert: 'losango', ambiente: 'confete', particula: 'confete', choque: 'petalas', luz: '#ff3fa4', efeito: 'Serpentinas pintadas que levam às duas rampas reais, plumas e avenida iluminada; acertos soltam confete' },
  'cidade-neon': { conceito: 'Metrópole na chuva: letreiros de neon, asfalto molhado e viadutos', material: 'grafite', insert: 'seta', ambiente: 'neon', particula: 'pixel', choque: 'quadrado', luz: '#ff2bd6', efeito: 'Os trilhos da perseguição são linhas de neon no asfalto, na posição real; cada alvo pego dispara um rastro de luz pelo trilho' },
  jardim: { conceito: 'Jardim suspenso: canteiros em terraço, cipós, flores e vagalumes', material: 'jade', insert: 'gota', ambiente: 'petalas', particula: 'petala', choque: 'petalas', luz: '#7be36a', efeito: 'Canteiros pintados sob as três flores reais; visitar uma flor solta pétalas e um giro de luz' },
  mina: { conceito: 'Poço de mina: escoras de madeira, trilhos, minério brilhando e lanternas', material: 'cobre', insert: 'redondo', ambiente: 'poeira', particula: 'grao', choque: 'onda', luz: '#ffc24d', efeito: 'Escoras de madeira e lanternas pintadas em volta do poço do elevador real; acertos levantam poeira' },
  templo: { conceito: 'Templo na selva: colunas, degraus, glifos de serpente e chamas cerimoniais', material: 'jade', insert: 'triangulo', ambiente: 'vagalumes', particula: 'folha', choque: 'onda', luz: '#37d67a', efeito: 'Escamas pintadas ao longo da rampa da serpente; glifos e chamas cerimoniais nas laterais' },
  estudio45: { conceito: 'Estúdio analógico: mesa de som, VU-metros, fita de rolo e o vinil girando', material: 'cromo', insert: 'redondo', ambiente: 'notas', particula: 'nota', choque: 'onda', luz: '#ff9f43', efeito: 'Prato gravado com as rotações (33 · 45 · 78) sob o vinil real; notas sobem pela mesa' },
  gelada: { conceito: 'Fronteira gelada: geleira azul, cristais de neve e aurora pálida', material: 'gelo', insert: 'losango', ambiente: 'neve', particula: 'floco', choque: 'cristal', luz: '#6fc3ff', efeito: 'Piso de gelo com rachaduras e geleira ao fundo; neve cai sobre a mesa; acertos soltam flocos' },
  relampago: { conceito: 'A última máquina: céu monumental de tempestade, colunas de mármore e ouro elétrico', material: 'ouro', insert: 'estrela', ambiente: 'raios', particula: 'raio', choque: 'raio', luz: '#fff36b', efeito: 'Seis selos dourados em volta do chefe (um por poder sorteado); relâmpagos cruzam o alto da mesa e os golpes no chefe disparam choques de raio' },
};

export const visualDe = (id: string): VisualDef => VISUAIS[id] || VISUAIS.aurora;
export const materialDe = (id: string): Material => MATERIAIS[visualDe(id).material];
