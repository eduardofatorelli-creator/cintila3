// R06 · Paleta de acabamento por máquina (indexada pelo id). Define só aparência: materiais das peças,
// decalques, luz, chefe. Nada de regra ou geometria.

export type Decal = 'estrela' | 'circulo' | 'diamante' | 'engrenagem' | 'gota' | 'chama' | 'floco' | 'olho' | 'raio' | 'folha' | 'nota' | 'coroa' | 'caveira' | 'hex' | 'lua' | 'onda' | 'triangulo' | 'espiral' | 'flor';
export type MatChefe = 'rubi' | 'ouro' | 'prata' | 'pedra' | 'madeira' | 'cristal' | 'neon' | 'osso' | 'jade' | 'bronze' | 'obsidiana' | 'gelo' | 'lava' | 'esmalte';
export type Acessorio = 'halo' | 'coroa' | 'chifres' | 'engrenagens' | 'chamas' | 'gelo' | 'antena' | 'plumas' | 'raios' | 'olhos' | 'nenhum' | 'cartola' | 'folhas' | 'notas';
export interface PalR06 {
  luz: string;
  bumper: { corpo: string; tampa: string; luz: string; decal: string; forma: Decal; base?: string };
  sling: { plastico: string; fundo: string; decal: Decal; borracha: string };
  alvo: { face: string; aceso: string; tinta: string };
  banco: string;
  parede: { topo: string; baixo: string; fio: string; cromo: string };
  palheta: { corpo: string; base: string; borracha: string };
  piso: string;
  saucer: string;
  insertos: { bonus: string; missao: string; protegida: string };
  chefe: { material: MatChefe; acessorio: Acessorio; pedestal: { corpo: string; tampa: string; luz: string } };
  rotulo: string;
}

const P = (luz: string, bc: string, bt: string, bf: Decal, sp: string, sd: Decal, af: string, aa: string, pf: string, cr: string, ch: PalR06['chefe'], extra: Partial<PalR06> = {}): PalR06 => ({
  luz,
  bumper: { corpo: bc, tampa: bt, luz, decal: '#f4f8ff', forma: bf },
  sling: { plastico: sp, fundo: '#1a1430', decal: sd, borracha: '#e9ecf6' },
  alvo: { face: af, aceso: aa, tinta: '#10142a' },
  banco: af,
  parede: { topo: '#2a2450', baixo: '#07060f', fio: pf, cromo: cr },
  palheta: { corpo: '#eef2ff', base: '#6f78a8', borracha: luz },
  piso: luz, saucer: luz,
  insertos: { bonus: '#ffd27a', missao: luz, protegida: '#7dffb0' },
  chefe: ch, rotulo: '#c9d6ff', ...extra,
});

export const PALETAS: Record<string, PalR06> = {
  aurora: P('#7df9ff', '#4a3a9a', '#5fd8f0', 'estrela', '#b48cff', 'estrela', '#ffd27a', '#7df9ff', '#b48cff', '#c3cbe8', { material: 'rubi', acessorio: 'nenhum', pedestal: { corpo: '#3a0f22', tampa: '#5a1a2e', luz: '#ff3355' } }),
  'passo-lunar': P('#ff4fd8', '#5a5f78', '#e8ecff', 'lua', '#ff4fd8', 'circulo', '#d8dcf0', '#4dd2ff', '#ff4fd8', '#e4e8f8', { material: 'prata', acessorio: 'raios', pedestal: { corpo: '#2a2a3e', tampa: '#5a5f78', luz: '#ff4fd8' } },
    { palheta: { corpo: '#f2f4fb', base: '#7a7f98', borracha: '#ff4fd8' }, parede: { topo: '#3a3a52', baixo: '#0a0a14', fio: '#ff4fd8', cromo: '#eef0fa' } }),
  bestiario: P('#8dff6a', '#3a2a14', '#8dff6a', 'olho', '#3ad6c0', 'folha', '#ffd166', '#8dff6a', '#ffd166', '#d8b878', { material: 'jade', acessorio: 'chifres', pedestal: { corpo: '#2a1a0a', tampa: '#5a3a1a', luz: '#8dff6a' } },
    { palheta: { corpo: '#f2e6c8', base: '#6a4a24', borracha: '#8dff6a' }, parede: { topo: '#3a2a14', baixo: '#0a0804', fio: '#ffd166', cromo: '#d8b878' }, rotulo: '#ffe2a0' }),
  cidadela: P('#ffb347', '#3a3440', '#ffb347', 'coroa', '#c0c7e0', 'triangulo', '#c0c7e0', '#ffb347', '#ff5a5f', '#aeb4c8', { material: 'pedra', acessorio: 'coroa', pedestal: { corpo: '#2a2430', tampa: '#4a4252', luz: '#ffb347' } },
    { palheta: { corpo: '#d8dce8', base: '#4a4a58', borracha: '#ff5a5f' }, parede: { topo: '#3a3440', baixo: '#0c0a10', fio: '#ffb347', cromo: '#aeb4c8' } }),
  invasao: P('#5cff9d', '#1a2a3a', '#5cff9d', 'triangulo', '#9d7bff', 'hex', '#9d7bff', '#5cff9d', '#5cff9d', '#b8c8d8', { material: 'neon', acessorio: 'antena', pedestal: { corpo: '#0a1a1a', tampa: '#1a3a3a', luz: '#5cff9d' } },
    { palheta: { corpo: '#e8f6f0', base: '#3a5a50', borracha: '#5cff9d' } }),
  caverna: P('#c58cff', '#2a1a4a', '#c9f6ff', 'diamante', '#7ff0ff', 'diamante', '#ff9de1', '#7ff0ff', '#c58cff', '#d8d0ff', { material: 'cristal', acessorio: 'gelo', pedestal: { corpo: '#1a1030', tampa: '#3a2a60', luz: '#c58cff' } }),
  expresso: P('#aaffee', '#4a2a14', '#ffcf5c', 'circulo', '#8f9bd9', 'raio', '#ffcf5c', '#aaffee', '#ffcf5c', '#e0b070', { material: 'bronze', acessorio: 'cartola', pedestal: { corpo: '#2a1a0a', tampa: '#6a3a14', luz: '#aaffee' } },
    { palheta: { corpo: '#f0e4cc', base: '#6a4a24', borracha: '#aaffee' }, parede: { topo: '#3a2a1a', baixo: '#0a0604', fio: '#ffcf5c', cromo: '#e0b070' } }),
  relojoeiro: P('#ffd27a', '#5a3a14', '#ffd27a', 'engrenagem', '#c98b4a', 'engrenagem', '#7fe0d0', '#ffd27a', '#c98b4a', '#f0c070', { material: 'ouro', acessorio: 'engrenagens', pedestal: { corpo: '#3a240a', tampa: '#7a5020', luz: '#ffd27a' } },
    { palheta: { corpo: '#f6ead0', base: '#7a5020', borracha: '#c98b4a' }, parede: { topo: '#3a2810', baixo: '#0c0804', fio: '#ffd27a', cromo: '#f0c070' } }),
  feira: P('#ff5ea8', '#c8304a', '#ffe45c', 'estrela', '#ff5ea8', 'estrela', '#5ce1ff', '#ffe45c', '#ffe45c', '#f0e8ff', { material: 'esmalte', acessorio: 'cartola', pedestal: { corpo: '#3a0a1a', tampa: '#c8304a', luz: '#ff5ea8' } }),
  abissal: P('#4dfff0', '#0d3a7a', '#4dfff0', 'gota', '#3a7bff', 'onda', '#ff7ad9', '#4dfff0', '#3a7bff', '#bfefff', { material: 'neon', acessorio: 'nenhum', pedestal: { corpo: '#04203a', tampa: '#0d3a7a', luz: '#4dfff0' } },
    { palheta: { corpo: '#e6faff', base: '#2a5a8a', borracha: '#4dfff0' }, parede: { topo: '#0d2a4a', baixo: '#02060c', fio: '#4dfff0', cromo: '#bfefff' } }),
  vulcao: P('#ff7a1a', '#2a1410', '#ffb02e', 'chama', '#ff4a1c', 'chama', '#ffe08a', '#ff7a1a', '#ff4a1c', '#c8a090', { material: 'lava', acessorio: 'chamas', pedestal: { corpo: '#1a0804', tampa: '#3a1408', luz: '#ff4a1c' } },
    { palheta: { corpo: '#f4e4d8', base: '#5a3020', borracha: '#ff7a1a' }, parede: { topo: '#3a1a10', baixo: '#0a0302', fio: '#ff4a1c', cromo: '#c8a090' } }),
  especiarias: P('#ffcc4d', '#7a2a10', '#ffcc4d', 'flor', '#e2572b', 'diamante', '#38d6b0', '#ffcc4d', '#e2572b', '#e8b070', { material: 'esmalte', acessorio: 'plumas', pedestal: { corpo: '#3a1408', tampa: '#7a2a10', luz: '#ffcc4d' } },
    { palheta: { corpo: '#f6e6cc', base: '#7a3a1a', borracha: '#38d6b0' }, parede: { topo: '#4a1f0e', baixo: '#0c0402', fio: '#ffcc4d', cromo: '#e8b070' } }),
  'zero-g': P('#39e0ff', '#2a2f48', '#f5ff4d', 'raio', '#ff3d81', 'triangulo', '#f5ff4d', '#39e0ff', '#ff3d81', '#e0e8ff', { material: 'obsidiana', acessorio: 'antena', pedestal: { corpo: '#10142a', tampa: '#30364d', luz: '#39e0ff' } }),
  'floresta-vidro': P('#6fe3c1', '#1a4a40', '#d8fbff', 'folha', '#6fe3c1', 'folha', '#b59bff', '#d8fbff', '#6fe3c1', '#e0fff6', { material: 'cristal', acessorio: 'folhas', pedestal: { corpo: '#0a2a24', tampa: '#1a4a40', luz: '#6fe3c1' } }),
  orion: P('#6ee7ff', '#2a3448', '#e6ecff', 'hex', '#ff8a3d', 'hex', '#e6ecff', '#6ee7ff', '#6ee7ff', '#f0f4ff', { material: 'prata', acessorio: 'antena', pedestal: { corpo: '#14182a', tampa: '#3a4460', luz: '#ff5533' } }),
  catacumbas: P('#b6ff5c', '#2a2620', '#d9d3c2', 'caveira', '#a45cff', 'caveira', '#c9c2b0', '#b6ff5c', '#a45cff', '#c9c2b0', { material: 'osso', acessorio: 'chamas', pedestal: { corpo: '#1a1612', tampa: '#3a342a', luz: '#b6ff5c' } },
    { palheta: { corpo: '#e8e2d0', base: '#5a5240', borracha: '#b6ff5c' }, parede: { topo: '#2a2620', baixo: '#08070a', fio: '#b6ff5c', cromo: '#c9c2b0' } }),
  tempestade: P('#6f8cff', '#1a2440', '#c8f1ff', 'raio', '#6f8cff', 'raio', '#ffe35c', '#c8f1ff', '#ffe35c', '#d0d8f0', { material: 'prata', acessorio: 'raios', pedestal: { corpo: '#0a1020', tampa: '#2a3458', luz: '#6f8cff' } }),
  circo: P('#ffd84d', '#c8203a', '#ffd84d', 'estrela', '#ff3b4e', 'estrela', '#4de1c1', '#ffd84d', '#ffd84d', '#f0e0b0', { material: 'esmalte', acessorio: 'cartola', pedestal: { corpo: '#3a0a14', tampa: '#c8203a', luz: '#ffd84d' } },
    { palheta: { corpo: '#fff6e0', base: '#8a2030', borracha: '#ffd84d' } }),
  prisma: P('#ffffff', '#2a2f48', '#e8f0ff', 'triangulo', '#7aa2ff', 'triangulo', '#ff6b9a', '#ffffff', '#7aa2ff', '#f4f8ff', { material: 'cristal', acessorio: 'raios', pedestal: { corpo: '#14182a', tampa: '#3a4460', luz: '#ffffff' } }),
  deserto: P('#e0a34d', '#6a4818', '#ffe9a8', 'triangulo', '#e0a34d', 'triangulo', '#59d8ff', '#ffe9a8', '#e0a34d', '#f0d08a', { material: 'ouro', acessorio: 'nenhum', pedestal: { corpo: '#3a2408', tampa: '#7a5020', luz: '#e0a34d' } },
    { palheta: { corpo: '#fff2d8', base: '#7a5020', borracha: '#59d8ff' }, parede: { topo: '#4a3010', baixo: '#0c0804', fio: '#e0a34d', cromo: '#f0d08a' } }),
  biblioteca: P('#ffd9a0', '#4a2a14', '#ffd9a0', 'circulo', '#b0703c', 'coroa', '#7fd1ff', '#ffd9a0', '#b0703c', '#d8b080', { material: 'madeira', acessorio: 'olhos', pedestal: { corpo: '#2a160a', tampa: '#5a3418', luz: '#ffd9a0' } },
    { palheta: { corpo: '#f4e6cc', base: '#6a4020', borracha: '#7fd1ff' }, parede: { topo: '#3a2414', baixo: '#0a0604', fio: '#ffd9a0', cromo: '#d8b080' } }),
  reator: P('#c6ff3d', '#1a2a1a', '#c6ff3d', 'raio', '#ff7a1a', 'hex', '#3df2ff', '#c6ff3d', '#ff7a1a', '#b0c0b0', { material: 'bronze', acessorio: 'raios', pedestal: { corpo: '#0a140a', tampa: '#2a3a2a', luz: '#c6ff3d' } },
    { parede: { topo: '#1a2a1e', baixo: '#040806', fio: '#c6ff3d', cromo: '#b0c0b0' } }),
  carnaval: P('#ff3fa4', '#5a1a7a', '#ffe14d', 'estrela', '#ff3fa4', 'flor', '#33e0a1', '#ffe14d', '#ffe14d', '#ffe8a0', { material: 'ouro', acessorio: 'plumas', pedestal: { corpo: '#2a0a3a', tampa: '#5a1a7a', luz: '#ffe14d' } }),
  'cidade-neon': P('#ff2bd6', '#1a1040', '#21e6ff', 'triangulo', '#ff2bd6', 'raio', '#ffe53b', '#21e6ff', '#21e6ff', '#d0c8ff', { material: 'neon', acessorio: 'olhos', pedestal: { corpo: '#0a0620', tampa: '#2a1a5a', luz: '#ff2bd6' } }),
  jardim: P('#7be36a', '#1a4a24', '#ff8fc7', 'flor', '#7be36a', 'folha', '#ffe46b', '#ff8fc7', '#7be36a', '#d8f0c0', { material: 'jade', acessorio: 'folhas', pedestal: { corpo: '#0a2a14', tampa: '#1a4a24', luz: '#ff8fc7' } },
    { palheta: { corpo: '#f2fae8', base: '#3a6a3a', borracha: '#ff8fc7' }, parede: { topo: '#14382a', baixo: '#040c08', fio: '#7be36a', cromo: '#d8f0c0' } }),
  mina: P('#ffc24d', '#4a3420', '#ffc24d', 'diamante', '#9c7b5a', 'diamante', '#5cf2c8', '#ffc24d', '#ffc24d', '#c8a080', { material: 'pedra', acessorio: 'chifres', pedestal: { corpo: '#22170e', tampa: '#4a3420', luz: '#ffc24d' } },
    { palheta: { corpo: '#ece0cc', base: '#5a4430', borracha: '#5cf2c8' }, parede: { topo: '#3a2a1a', baixo: '#0a0604', fio: '#ffc24d', cromo: '#c8a080' } }),
  templo: P('#37d67a', '#1a3a20', '#d9b25c', 'espiral', '#37d67a', 'triangulo', '#d9b25c', '#37d67a', '#d9b25c', '#e0d0a0', { material: 'jade', acessorio: 'coroa', pedestal: { corpo: '#0a1a0c', tampa: '#3a4a20', luz: '#37d67a' } },
    { palheta: { corpo: '#f0ead0', base: '#5a5a30', borracha: '#37d67a' }, parede: { topo: '#2a3a1a', baixo: '#060a04', fio: '#d9b25c', cromo: '#e0d0a0' } }),
  estudio45: P('#ff9f43', '#2a1a30', '#ff9f43', 'nota', '#ee5a8a', 'nota', '#54e0c7', '#ff9f43', '#ee5a8a', '#e8d8f0', { material: 'esmalte', acessorio: 'notas', pedestal: { corpo: '#1a0a1e', tampa: '#3a1a40', luz: '#ff9f43' } }),
  gelada: P('#6fc3ff', '#1a3a5a', '#e6fbff', 'floco', '#6fc3ff', 'floco', '#b9a4ff', '#e6fbff', '#6fc3ff', '#f0fbff', { material: 'gelo', acessorio: 'gelo', pedestal: { corpo: '#0a1a2a', tampa: '#2a5a7a', luz: '#6fc3ff' } },
    { palheta: { corpo: '#f4fcff', base: '#5a8aaa', borracha: '#6fc3ff' } }),
  relampago: P('#fff36b', '#2a2f56', '#fff36b', 'raio', '#8ab4ff', 'raio', '#fff36b', '#ffffff', '#fff36b', '#f8f0c0', { material: 'ouro', acessorio: 'raios', pedestal: { corpo: '#14183a', tampa: '#3a4070', luz: '#fff36b' } },
    { palheta: { corpo: '#fffbe8', base: '#6a6a90', borracha: '#fff36b' }, parede: { topo: '#2a2f56', baixo: '#05061a', fio: '#fff36b', cromo: '#f8f0c0' } }),
};
export const paletaDe = (id: string) => PALETAS[id] || PALETAS.aurora;
