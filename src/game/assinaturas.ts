// As mecânicas-assinatura: o que cada máquina tem de exclusivo. Cada uma é um módulo independente,
// para que a máquina final possa reunir várias.
import type { Bola } from '../core/physics';
import { clamp, embaralha, entre, rng, sorteia } from '../core/vec';
import type { AssinaturaDef } from '../machines/_schema';
import * as P from './elements';
import type { Game } from './rules';

export interface Sig {
  nome: string;
  ev?(tipo: string, b: Bola | null | undefined, d: any): void;
  mult?(tipo: string, b?: Bola | null): number;
  ritmo?(): number; update?(dt: number): void; inicio?(): void; bola?(): void;
  info?(): string; medidor?(): number;
  /** só na máquina final: os seis poderes sorteados nesta partida (leitura para a apresentação) */
  poderes?: readonly string[];
}
type Fab = (J: Game, p: AssinaturaDef) => Sig;
const GOLPES = ['bumper', 'alvo', 'queda', 'rampa', 'orbita', 'chefe'];
const xy = (p: AssinaturaDef): [number, number] => [p.x ?? 190, p.y ?? 456];

export const ASSINATURAS: Record<string, Fab> = {
  constelacao(J, p) {
    const C = J.mesa, novos = [[158, 470, 0.3], [222, 470, -0.3], [190, 122, 0]].map(a => C.add(new P.AlvoFixo(J, C, a[0], a[1], a[2])));
    const est = [...J.m.alvos, ...novos]; let i = 0;
    const marca = () => est.forEach((a, k) => { a.aceso = k < i; a.vale = k === i ? 1 : 0; a.rotulo = String(k + 1); });
    marca();
    return {
      nome: p.nome, info: () => 'ESTRELA ' + (i + 1) + '/' + est.length, medidor: () => i / est.length,
      update: () => { est.forEach((a, k) => { a.vale = k === i ? 1 : 0; }); },
      ev(t, b, d) {
        if (t !== 'alvo' || d !== est[i]) return;
        i++; J.assinou(b, 12000 * i, 'ESTRELA ' + i);
        if (i >= est.length) { i = 0; J.pontua(150000, b, 'assinatura', 'CONSTELAÇÃO!'); J.anuncia('assinaturaTotal', 'CONSTELAÇÃO ACESA'); J.pisca(J.cores.c1, 0.8); J.bonusX = Math.min(9, J.bonusX + 1); }
        marca();
      },
    };
  },
  compasso(J, p) {
    let seq = 0, ult = false;
    const noTempo = () => { const f = J.batida(); return f < 0.17 || f > 0.83; };
    return {
      nome: p.nome, info: () => 'NO COMPASSO ' + seq, medidor: () => 1 - Math.min(1, Math.abs(J.batida() - 0.5) * 2 < 0.66 ? 0 : 1) * 0 - Math.min(J.batida(), 1 - J.batida()) * 2,
      mult: t => (GOLPES.includes(t) && (ult = noTempo()) ? 2 : 1),
      ev(t, b) {
        if (!GOLPES.includes(t)) return;
        if (noTempo()) { seq++; if (b) J.fx('pontos', b.x, b.y - 14, '#ffffff', 0, 'NO COMPASSO'); if (seq % 4 === 0) J.assinou(b, 20000, 'COMPASSO x' + seq); } else seq = 0;
      },
    };
  },
  criaturas(J, p) {
    const [x, y] = xy(p), g = J.mesa.add(new P.AlvoGiratorio(J, J.mesa, x, y, 46, 3, 0.9, 3)); g.forma = 'criatura'; let cap = 0;
    return {
      nome: p.nome, info: () => 'CAPTURADAS ' + cap, medidor: () => (3 - g.vivos) / 3,
      ev(t, b, d) {
        if (t === 'giratorio') { d.c.est = 4 - d.c.vidas; if (d.quebrou) { cap++; J.assinou(b, 30000, 'CAPTURADA!'); J.fx('explosao', d.x, d.y, J.cores.c1, 20); } else { J.pontua(6000, b, 'assinatura', 'EVOLUIU'); J.som('evolucao'); } }
        if (t === 'giratorioFim') { J.pontua(120000, b, 'assinatura', 'BESTIÁRIO COMPLETO'); g.volta = 5; for (const c of g.cs) c.est = 1; }
      },
    };
  },
  escudos(J, p) {
    const ch = J.m.chefe, g = J.mesa.add(new P.AlvoGiratorio(J, J.mesa, ch.x, ch.y, 42, 4, 1.4, 1)); g.evento = 'escudoGira';
    return {
      nome: p.nome, info: () => 'ESCUDOS ' + g.vivos, medidor: () => 1 - g.vivos / 4,
      update() { g.x = ch.x; g.y = ch.y; ch.protegido = g.vivos > 0 && !ch.c.off; },
      ev(t, b, d) {
        if (t === 'escudoGira') { J.som('escudo'); if (d.quebrou) J.assinou(b, 8000, 'ESCUDO QUEBRADO'); else J.pontua(5000, b, 'assinatura'); }
        if (t === 'escudoGiraFim') { J.assinou(b, 40000, 'PORTÃO ABERTO'); g.volta = 14; }
        if (t === 'chefeVolta') g.renasce();
      },
    };
  },
  salta(J, p) { return { nome: p.nome, info: () => 'A NAVE SALTA', ev(t, b) { if (t === 'chefe') J.assinou(b, 8000, 'SALTO!'); } }; },
  ima(J, p) {
    const [x, y] = xy(p); J.mesa.add(new P.Ima(J, J.mesa, x, y)); let n = 0;
    return { nome: p.nome, info: () => 'DISPAROS ' + n, ev(t, b) { if (t === 'mira') { J.som('trava'); J.anuncia('dica', 'APERTE PARA SOLTAR'); } if (t === 'disparo') { n++; J.assinou(b, 15000, 'DISPARO MAGNÉTICO'); } } };
  },
  trem(J, p) {
    const t = J.mesa.add(new P.PortaMovel(J, J.mesa, 0, 0, 0, 0, [76, p.y ?? 492, 304, p.y ?? 492])); t.velT = 80; t.meiaL = 26; let ult = -9;
    return { nome: p.nome, info: () => 'LOCOMOTIVA NA LINHA', ev(e, b, d) { if (e === 'porta' && d === t && J.tempo - ult > 1.5) { ult = J.tempo; J.assinou(b, 14000, 'LOCOMOTIVA!'); } } };
  },
  relogio(J, p) {
    const [x, y] = xy(p), bp = J.mesa.add(new P.Bumper(J, J.mesa, x, y, 15, 1)); let ang = 0; const modos = ['PONTOS EM DOBRO', 'RAMPA DE OURO', 'BOLA PROTEGIDA', 'BÔNUS +1'];
    let ouro = 0;
    J.mesa.add({ tipo: 'ponteiro', y: y + 1, desenhar(g: any) { const a = ang - Math.PI / 2; g.anel(x, y, 30, J.cores.c3, 2, 1, 0.8); for (let i = 0; i < 12; i++) { const q = i / 12 * Math.PI * 2; g.disco(x + Math.cos(q) * 30, y + Math.sin(q) * 30, i % 3 ? 1.2 : 2.6, '#fff', 1, 0.8); } g.linha([[x, y, 18], [x + Math.cos(a) * 28, y + Math.sin(a) * 28, 18]], '#ffffff', 3); } });
    return {
      nome: p.nome, info: () => 'HORA: ' + modos[Math.floor(ang / (Math.PI / 2)) % 4], medidor: () => ang / (Math.PI * 2),
      update(dt) { ang = (ang + dt * 0.52) % (Math.PI * 2); if (ouro > 0) ouro -= dt; },
      mult: t => (t === 'rampa' && ouro > 0 ? 4 : 1),
      ev(t, b, d) {
        if (t !== 'bumper' || d !== bp) return;
        const h = Math.floor(ang / (Math.PI / 2)) % 4; J.assinou(b, 10000, modos[h]);
        if (h === 0) J.dobro = Math.max(J.dobro, 20); else if (h === 1) ouro = 20; else if (h === 2) J.salva = Math.max(J.salva, 12); else J.bonusX = Math.min(9, J.bonusX + 1);
      },
    };
  },
  roda(J, p) {
    const [x, y] = xy(p), r = J.mesa.add(new P.RodaGigante(J, J.mesa, x, y, 40, 5));
    return {
      nome: p.nome, info: () => 'CABINES ' + r.presas + '/3', medidor: () => r.presas / 3,
      ev(t, b, d) {
        if (t === 'roda') { J.assinou(b, 12000, 'CABINE ' + r.presas); J.som('trava'); if (!J.mesa.bolas.some(o => !o.preso) && J.fila === 0) J.adicionaBola(1); }
        if (t === 'rodaSolta') { J.pontua(20000 * d.n * d.n, null, 'assinatura'); J.anuncia('assinaturaTotal', 'RODA SOLTA ' + d.n + ' BOLAS'); if (d.n >= 2) { J.multibola = true; J.salva = Math.max(J.salva, 8); } }
      },
    };
  },
  boca(J, p) {
    const [x, y] = xy(p); J.mesa.add(new P.BocaQueEngole(J, J.mesa, x, y, [[70, 488, 70, 160], [190, 128, 0, 120], [310, 488, -70, 160]]));
    const nomes = ['CANO DA ESQUERDA', 'CANO DO ALTO', 'CANO DA DIREITA'];
    return { nome: p.nome, info: () => 'A BOCA ESPERA', ev(t, b, d) { if (t === 'cano') J.assinou(b, 12000 + d.i * 6000, nomes[d.i]); } };
  },
  salto(J, p) {
    const r = J.m.rampas[p.rampa ?? 0]; r.salto = true; let n = 0;
    return { nome: p.nome, info: () => 'SALTOS ' + n, ev(t, b, d) { if (t === 'pouso' && d === r) { n++; J.assinou(b, 18000, 'SALTO!'); J.fx('faisca', b!.x, b!.y, '#ffb347', 14); J.tremor = 0.4; } } };
  },
  labirinto(J, p) {
    const [x, y] = xy(p), C = J.mesa, e = C.add(new P.Esteira(J, C, x, y, 130, 96, 1900, 0)); e.controlavel = true;
    for (const q of [[-40, -28], [0, -28], [40, -28], [-20, 4], [20, 4], [-40, 34], [40, 34]]) C.add(new P.Poste(J, C, x + q[0], y + q[1], 4));
    const sE = C.add(new P.Sensor(J, C, x - 46, y + 62, 14, 'labSaida', 1, 'SAÍDA')), sD = C.add(new P.Sensor(J, C, x + 46, y + 62, 14, 'labSaida', -1, 'SAÍDA')); let alvo = 1, n = 0;
    return {
      nome: p.nome, info: () => 'SAIA PELA ' + (alvo > 0 ? 'ESQUERDA' : 'DIREITA'), update() { sE.vale = alvo > 0 ? 1 : 0; sD.vale = alvo < 0 ? 1 : 0; },
      ev(t, b, d) { if (t !== 'labSaida') return; if (d.lado === alvo) { n++; J.assinou(b, 16000, 'ROTA CERTA'); alvo = rng() < 0.5 ? 1 : -1; } else J.pontua(2000, b, 'assinatura'); },
    };
  },
  aceleracao(J, p) {
    let n = 0, t = 0;
    return {
      nome: p.nome, info: () => 'VELOCIDADE ' + (n + 1) + 'X', medidor: () => n / 5, ritmo: () => 1 + n * 0.055, mult: () => 1 + n * 0.25,
      update(dt) { if (n > 0) { t -= dt; if (t <= 0) { n--; t = 6; } } },
      ev(e, b) { if (e !== 'orbita') return; n = Math.min(5, n + 1); t = 9; J.assinou(b, 6000 * n, 'TURBO ' + n); },
    };
  },
  vidro(J, p) {
    const [x, y] = xy(p), C = J.mesa, vs = [[-52, 14, 0.35], [-18, 0, 0.1], [18, 0, -0.1], [52, 14, -0.35]].map(a => C.add(new P.AlvoFixo(J, C, x + a[0], y + a[1], a[2], 3)));
    return {
      nome: p.nome, info: () => 'CAMADAS ' + vs.reduce((s, a) => s + (a.s.off ? 0 : a.vidas), 0), medidor: () => 1 - vs.reduce((s, a) => s + (a.s.off ? 0 : a.vidas), 0) / 12,
      ev(t, b, d) { if (t !== 'alvo' || !vs.includes(d)) return; J.som('tijolo'); if (b) J.fx('faisca', b.x, b.y, '#dff6ff', 10); if (d.s.off) { J.assinou(b, 25000, 'ESTILHAÇOU!'); if (vs.every(a => a.s.off)) J.pontua(120000, b, 'assinatura', 'FLORESTA LIMPA'); } },
    };
  },
  braco(J, p) {
    const [x, y] = xy(p); J.mesa.add(new P.BracoRobotico(J, J.mesa, x, y)); let n = 0;
    return { nome: p.nome, info: () => 'ARREMESSOS ' + n, ev(t, b) { if (t === 'mira') { J.som('trava'); J.anuncia('dica', 'APERTE PARA ARREMESSAR'); } if (t === 'disparo') { n++; J.assinou(b, 15000, 'ARREMESSO!'); } } };
  },
  caveira(J, p) {
    const [x, y] = xy(p), bc = J.mesa.add(new P.BocaQueEngole(J, J.mesa, x, y, [[x - 42, y + 30, -160, -420], [x + 42, y + 30, 160, -420]])); bc.forma = 'caveira'; bc.rotulo = 'CAVEIRA';
    return {
      nome: p.nome, info: () => 'A CAVEIRA TEM FOME',
      ev(t, b) { if (t !== 'cano') return; J.assinou(b, 14000, 'CUSPIU!'); if (J.mesa.bolas.length + J.fila < 3 && !J.mago) { J.adicionaBola(1); J.multibola = true; J.salva = Math.max(J.salva, 8); J.anuncia('assinaturaTotal', 'MULTIBOLA DA CAVEIRA'); } },
    };
  },
  pas(J, p) {
    const [x, y] = xy(p), m = J.mesa.add(new P.PasDeMoinho(J, J.mesa, x, y, 40, 3)); let ult = -9;
    return { nome: p.nome, info: () => 'VENTO ' + Math.round(Math.abs(m.w) * 20) + ' KM/H', medidor: () => Math.abs(m.w) / 4.4, ev(t, b, d) { if (t === 'pas' && d === m && J.tempo - ult > 1) { ult = J.tempo; J.assinou(b, Math.round(4000 * Math.abs(m.w)), 'RAJADA!'); } } };
  },
  canhaoAndar(J, p) {
    const [x, y] = xy(p), c = J.mesa.add(new P.Canhao(J, J.mesa, x, y)); c.a0 = -2.3; c.a1 = -0.85; let n = 0;
    return {
      nome: p.nome, info: () => (J.andarAceso ? 'CANHÃO: RUMO AO ANDAR' : 'DISPAROS ' + n + '/3'), medidor: () => Math.min(1, n / 3),
      ev(t, b) {
        if (t === 'mira' && J.andarAceso && !J.mago) { J.fx('explosao', x, y, '#ffffff', 30); J.som('explosao'); J.sobe(b!, c); n = 0; return; }
        if (t === 'mira') J.anuncia('dica', 'APERTE PARA DISPARAR');
        if (t === 'disparo') { n++; J.assinou(b, 15000, 'HOMEM-BALA!'); }
      },
    };
  },
  prisma(J, p) {
    const [x, y] = xy(p), c = J.mesa.add(new P.Captor(J, J.mesa, x, y)); c.evento = 'prisma'; c.espera = 0.6; c.vy = -520; c.rotulo = 'PRISMA';
    const cores = ['#ff4d6d', '#4dff88', '#4da6ff'];
    J.mesa.add({ tipo: 'prismaArte', y: y + 1, desenhar(g: any) { g.poli([[x - 18, y + 12, 16], [x + 18, y + 12, 16], [x, y - 18, 16]], '#ffffff', 0.35); g.linha([[x - 18, y + 12, 16], [x + 18, y + 12, 16], [x, y - 18, 16], [x - 18, y + 12, 16]], '#fff', 1.5); cores.forEach((k, i) => g.glow(x + (i - 1) * 9, y + 4, 10, k, 16, 0.5)); } });
    return {
      nome: p.nome, info: () => 'VERMELHA BUMPERS · VERDE RAMPAS · AZUL CHEFE',
      mult: (t, b) => (!b?.cor ? 1 : b.cor === cores[0] && t === 'bumper' ? 4 : b.cor === cores[1] && (t === 'rampa' || t === 'orbita') ? 3 : b.cor === cores[2] && (t === 'chefe' || t === 'alvo' || t === 'queda') ? 3 : 1),
      ev(t, b) {
        if (t !== 'prisma' || !b) return;
        if (b.cor || J.mesa.bolas.length + J.fila >= 3 || J.mago) { J.pontua(8000, b, 'assinatura'); return; }
        J.assinou(b, 20000, 'TRÊS CORES!'); b.cor = cores[0]; J.multibola = true; J.salva = Math.max(J.salva, 8); J.pisca('#ffffff', 0.6);
        for (let i = 1; i < 3; i++) { const o = J.novaNaCanaleta(); o.x = x + (i === 1 ? -14 : 14); o.y = y - 16; o.vx = i === 1 ? -260 : 260; o.vy = -480; o.cor = cores[i]; }
      },
    };
  },
  poco(J, p) {
    const [x, y] = xy(p); J.mesa.add(new P.PocoDeAreia(J, J.mesa, x, y)); let n = 0;
    return { nome: p.nome, info: () => 'ENGOLIDAS ' + n, ev(t, b) { if (t === 'poco') J.som('giro'); if (t === 'pocoCospe') { n++; J.assinou(b, 16000, 'CUSPIDA!'); if (b) J.fx('faisca', b.x, b.y, '#ffe9a8', 16); } } };
  },
  cartas(J, p) {
    const cartas = [
      { nome: 'OURO', texto: 'pontos em dobro por 25 s', f: () => { J.dobro = Math.max(J.dobro, 25); } },
      { nome: 'ESCUDO', texto: 'bola protegida por 15 s', f: () => { J.salva = Math.max(J.salva, 15); } },
      { nome: 'ESTRELA', texto: 'uma bola a mais na mesa', f: () => { J.adicionaBola(1); J.multibola = true; } },
      { nome: 'FORJA', texto: 'uma evolução agora', f: () => J.evolui() },
      { nome: 'COROA', texto: 'bônus de fim de bola +2X', f: () => { J.bonusX = Math.min(9, J.bonusX + 2); } },
    ];
    let lidos = 0;
    return {
      nome: p.nome, info: () => 'LIVROS ABERTOS ' + lidos,
      ev(t, b) {
        if (t !== 'banco' || J.escolha) return;
        lidos++; const mao = embaralha(cartas.slice()).slice(0, 3);
        J.escolha = { titulo: 'ESCOLHA UMA CARTA', opcoes: mao, i: 1, t: 6, fim: i => { mao[i].f(); J.assinou(b, 15000, 'CARTA ' + mao[i].nome); } };
        J.anuncia('escolha', 'ESCOLHA UMA CARTA');
      },
    };
  },
  calor(J, p) {
    let c = 0;
    return {
      nome: p.nome, info: () => 'CALOR ' + Math.round(c) + '%', medidor: () => c / 100, mult: () => 1 + c / 50, ritmo: () => 1 + c / 800,
      update(dt) { c = Math.max(0, c - dt * 5); },
      ev(t, b) { if (!GOLPES.includes(t)) return; c = Math.min(100, c + (t === 'bumper' ? 5 : 12)); if (c >= 100) { c = 45; J.assinou(b, 60000, 'SUPERAQUECIMENTO!'); J.pisca('#ff7a1a', 0.8); J.tremor = 0.8; } },
    };
  },
  mascaras(J, p) {
    const ms = [
      { nome: 'FERA', texto: 'bumpers valem 3X', t: 'bumper', m: 3 }, { nome: 'PÁSSARO', texto: 'rampas e órbitas valem 2X', t: 'rampa', m: 2 },
      { nome: 'MARÉ', texto: 'bola protegida +12 s', t: '', m: 1 }, { nome: 'SOL', texto: 'bônus de fim de bola começa em 3X', t: '', m: 1 },
    ];
    let m = -1, n = 0;
    const aplica = () => { if (m === 2) J.salva += 12; if (m === 3) J.bonusX = Math.max(J.bonusX, 3); };
    return {
      nome: p.nome, info: () => (m < 0 ? 'ESCOLHA SUA MÁSCARA' : 'MÁSCARA ' + ms[m].nome),
      inicio() { J.escolha = { titulo: 'ESCOLHA SUA MÁSCARA', opcoes: ms, i: 0, t: 9, fim: i => { m = i; J.anuncia('assinatura', 'MÁSCARA ' + ms[i].nome); if (m === 3) J.bonusX = 3; } }; },
      bola: aplica,
      mult: t => (m < 0 ? 1 : (ms[m].t === t || (m === 1 && t === 'orbita')) ? ms[m].m : 1),
      ev(t, b) { if (t === 'lancou' && m === 2) return; if (GOLPES.includes(t) && ++n % 8 === 0) J.assinou(b, 12000, 'FOLIA!'); if (m === 2 && t === 'faixa' && J.salva < 6) J.salva = 6; },
    };
  },
  trilhos(J, p) {
    const [x, y] = xy(p), g = J.mesa.add(new P.AlvoGiratorio(J, J.mesa, x, y, 0, 3, 1.5, 1)); g.trilho = [[x - 84, y + 26], [x - 30, y - 8], [x + 30, y - 8], [x + 84, y + 26]]; let n = 0;
    return {
      nome: p.nome, info: () => 'ALVOS EM FUGA ' + g.vivos, medidor: () => 1 - g.vivos / 3,
      ev(t, b, d) { if (t === 'giratorio') { n++; J.assinou(b, 14000, 'PEGOU!'); J.fx('explosao', d.x, d.y, J.cores.c1, 16); } if (t === 'giratorioFim') { J.pontua(90000, b, 'assinatura', 'PERSEGUIÇÃO VENCIDA'); g.volta = 4; g.vel += 0.25; } },
    };
  },
  flores(J, p) {
    const [x, y] = xy(p); [[-50, 18, 0], [0, -6, 2.3], [50, 18, 4.6]].forEach(q => J.mesa.add(new P.Flor(J, J.mesa, x + q[0], y + q[1], q[2]))); let n = 0;
    return { nome: p.nome, info: () => 'FLORES VISITADAS ' + n, ev(t, b) { if (t === 'flor') { n++; J.assinou(b, 15000, 'FLOR ABERTA'); } } };
  },
  elevador(J, p) {
    const [x, y] = xy(p); J.mesa.add(new P.Elevador(J, J.mesa, x, y, [[190, 128, 0, 120], [92, 232, 90, 60], [288, 232, -90, 60]])); const nomes = ['NÍVEL 1', 'NÍVEL 2', 'NÍVEL 3'];
    return { nome: p.nome, info: () => 'ELEVADOR DE 3 NÍVEIS', ev(t, b, d) { if (t === 'elevadorEntra') J.som('tunelEntra'); if (t === 'elevador') J.assinou(b, 9000 * (d.nivel + 1), nomes[d.nivel]); } };
  },
  serpente(J, p) {
    const r = J.m.rampas[p.rampa ?? 1]; let t = 5, golpes = 0;
    J.mesa.add({ tipo: 'serpenteArte', y: 396, desenhar(g: any) { if (!r.bloqueada) return; const pts: number[][] = []; for (let i = 0; i <= 10; i++) pts.push([r.mx - 22 + i * 4.4, 392 + Math.sin(g.t * 5 + i) * 3, 16 + Math.sin(g.t * 3 + i * 0.8) * 3]); g.linha(pts, '#37d67a', 6); g.cil(r.mx + 22, 392, 5, 18, '#37d67a', '#eaffea'); } });
    return {
      nome: p.nome, info: () => (r.bloqueada ? 'SERPENTE NA RAMPA ' + golpes + '/3' : 'RAMPA LIVRE: VALE 3X'), medidor: () => (r.bloqueada ? golpes / 3 : 1),
      mult: (e) => (e === 'rampa' && !r.bloqueada ? 3 : 1),
      update(dt) { t -= dt; if (t <= 0) { r.bloqueada = !r.bloqueada; t = r.bloqueada ? 14 : 12; golpes = 0; } },
      ev(e, b, d) { if (e === 'rampaFechada' && d === r) { golpes++; J.som('escudo'); J.pontua(4000, b, 'assinatura'); if (golpes >= 3) { r.bloqueada = false; t = 14; golpes = 0; J.assinou(b, 30000, 'SERPENTE RECUOU'); } } },
    };
  },
  vinil(J, p) {
    const [x, y] = xy(p), v = J.mesa.add(new P.RodaDeVinil(J, J.mesa, x, y, 44));
    return { nome: p.nome, info: () => 'ROTAÇÃO ' + Math.round(Math.abs(v.w) * 5) + ' RPM', medidor: () => Math.abs(v.w) / 9, ev(t, b, d) { if (t === 'vinil' && d === v) J.assinou(b, Math.round(2500 * Math.abs(v.w)), 'NA AGULHA!'); } };
  },
  gelo(J, p) {
    for (const s of J.mesa.segs) s.e *= 0.55;
    for (const f of J.mesa.pas) { f.atraso = 0.055; f.sobe = 21; }
    return { nome: p.nome, info: () => 'PISO CONGELADO', mult: () => 1.4, ev(t, b) { if (t === 'chefe' || t === 'banco') J.assinou(b, 15000, 'GELO TRINCOU'); } };
  },
  /** A máquina final: reúne seis assinaturas das anteriores, sorteadas a cada partida. */
  relampago(J, p) {
    const def = (tipo: string, nome: string, extra: any = {}): AssinaturaDef => ({ tipo, nome, dica: '', ...extra });
    const centro = sorteia(['ima', 'roda', 'boca', 'braco', 'pas', 'poco', 'vinil', 'flores', 'trilhos', 'criaturas', 'caveira']);
    const chefe = sorteia(['escudos', 'salta']);
    const regras = embaralha(['compasso', 'calor', 'aceleracao', 'salto', 'serpente', 'cartas']).slice(0, 4);
    const tipos = [centro, chefe, ...regras], subs = tipos.map(t => ASSINATURAS[t](J, def(t, t.toUpperCase())));
    return {
      poderes: Object.freeze(tipos.slice()),
      nome: p.nome, info: () => subs.map(s => s.info?.() || '').filter(Boolean)[Math.floor(J.tempo / 3) % subs.length] || '',
      medidor: () => { const s = subs[Math.floor(J.tempo / 3) % subs.length]; return s.medidor ? s.medidor() : 0; },
      ev: (t, b, d) => { for (const s of subs) s.ev?.(t, b, d); },
      mult: (t, b) => subs.reduce((m, s) => m * (s.mult ? s.mult(t, b) : 1), 1),
      ritmo: () => clamp(subs.reduce((m, s) => m * (s.ritmo ? s.ritmo() : 1), 1), 1, 1.45),
      update: dt => { for (const s of subs) s.update?.(dt); },
      inicio: () => { J.anuncia('assinaturaTotal', 'SEIS PODERES: ' + tipos.join(' · ').toUpperCase()); for (const s of subs) s.inicio?.(); },
      bola: () => { for (const s of subs) s.bola?.(); },
    };
  },
};
void entre;
