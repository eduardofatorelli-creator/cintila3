// As regras: pontuação, missões, chefe, multibola, modo mago, sobrevivência da bola.
import { Bola, Campo, DT, G, novaBola } from '../core/physics';
import { clamp, entre, rng, semear } from '../core/vec';
import type { MachineDef, TipoAndar } from '../machines/_schema';
import { Mesa, montaMesa } from './machine';
import { EVOLUCOES, Niveis, extraPalheta, proximaEvolucao, semEvolucoes } from './upgrades';
import { SubFase, criaArena } from './arena';
import { criaAndar } from './upper';
import { ASSINATURAS, Sig } from './assinaturas';
import type { Captor } from './elements';
import type { Jogo } from './tipos';

export interface Anuncio { tipo: string; texto?: string; d?: any }
export interface FxEv { tipo: string; x: number; y: number; cor?: string; n?: number; texto?: string; z?: number }
export interface Missao { nome: string; tipo: string; meta: number; n: number; feita: boolean }
export interface Escolha { titulo: string; opcoes: { nome: string; texto: string }[]; i: number; t: number; fim: (i: number) => void }
export interface Passagem { dir: 1 | -1; t: number; dur: number; sub: SubFase; bola: Bola | null; retorno: Captor; cuspiu: boolean }
export type ModoJogo = 'normal' | 'eterno';

const TIPOS_MISSAO = ['rampas', 'bumpers', 'orbitas', 'alvos', 'chefe'], METAS = [3, 12, 3, 6, 3];
const ARENAS = ['nucleo', 'enxame', 'muralha'];

export class Game implements Jogo {
  m: Mesa; mesa: Campo; campo: Campo; sub: SubFase | null = null; trans: Passagem | null = null;
  tempo = 0; cores: { c1: string; c2: string; c3: string };
  botE = false; botD = false; toqueE = false; toqueD = false; carregando = false; carga = 0;
  estado: 'lancar' | 'jogo' | 'bonus' | 'fim' = 'lancar';
  pontos = 0; bola = 1; bolasTotal = 3; extras = 0; vidasEternas = 3;
  salva = 0; bonusX = 1; dobro = 0; combo = 0; ultRampaT = -99; ultRampaLado = 0;
  missoes: Missao[]; missaoAtiva = -1; missaoT = 0; ciclo = 1; missoesNaBola = 0;
  faseChefe = 0; rodizio = 0; ciclosChefe = 0; arenaN = 0;
  travas = 0; multibola = false; jackpots = 0; superAceso = false;
  mago = false; magoT = 0; magoN = 0; magoVenceu = false; nivel = 1;
  camaraAcesa = false; camaraLimpas = 0;
  andarAceso = false; andarVisitas = 0; orbitasAndar = 0; assinN = 0; rampasTot = 0; atalho = false;
  tiltN = 0; tiltT = 0; tilted = false; sacudeT = 0;
  evol: Niveis = semEvolucoes(); degrau = 0; tempoJogo = 0;
  fila = 0; servT = 0; laneAuto = 0; laneT = 0; certeiraT = 0; inicioBola = 0;
  flash = 0; tremor = 0; lenta = 0; flashCor = '#ffffff'; intensidade = 0;
  escolha: Escolha | null = null; bonusT = 0; bonusItens: [string, number][] = []; bonusTotal = 0;
  cont = { bumpers: 0, rampas: 0, orbitas: 0, chefe: 0, missoes: 0 };
  stats = { drenos: 0, laterais: 0, paradas: 0, empurroes: 0, nan: 0, fugas: 0, tempos: [] as number[], andar: 0, subfases: 0, nucleos: 0, missoes: 0, evolucoes: 0, magos: 0, erros: 0 };
  anuncios: Anuncio[] = []; fxs: FxEv[] = []; sigs: Sig[] = [];
  saidaSom: ((n: string, p?: number) => void) | null = null;
  saidaFala: ((t: string) => void) | null = null;
  aoFim: ((g: Game) => void) | null = null; aoVencerMago: ((g: Game) => void) | null = null; aoAtalho: ((g: Game) => void) | null = null;
  private antE = false; private antD = false;

  constructor(public def: MachineDef, public modo: ModoJogo = 'normal', mestria = 0, semente = 0) {
    if (semente) semear(semente);
    this.cores = { c1: def.paleta.c1, c2: def.paleta.c2, c3: def.paleta.c3 };
    this.m = montaMesa(this, def); this.mesa = this.campo = this.m.campo;
    this.missoes = def.missoes.map((nome, i) => ({ nome, tipo: TIPOS_MISSAO[i], meta: METAS[i], n: 0, feita: false }));
    const self = this;
    this.mesa.add({ tipo: 'guardiao', y: 0, colidir(b: Bola, h: number) { const n = self.evol.ima; if (n && b.y > 596 && b.y < 690) b.vx += (190 - b.x) * 3 * n * h; } });
    const f = ASSINATURAS[def.assinatura.tipo]; if (f) this.sigs.push(f(this, def.assinatura));
    this.m.chefe.vida = this.vidaChefe();
    for (let i = 0; i < mestria; i++) this.evolui(true);
    this.aplicaEvolucoes(); this.novaNaCanaleta(); this.m.resgE.armado = true;
    this.anuncia('inicio', def.nome); this.fala(def.vozes.inicio);
    for (const s of this.sigs) s.inicio?.();
  }

  // ---------- saídas ----------
  som(n: string, p?: number) { this.saidaSom?.(n, p); }
  fala(t: string) { this.saidaFala?.(t); }
  fx(tipo: string, x: number, y: number, cor?: string, n?: number, texto?: string) { if (this.fxs.length < 160) this.fxs.push({ tipo, x, y, cor, n, texto }); }
  anuncia(tipo: string, texto?: string, d?: any) { if (this.anuncios.length > 40) this.anuncios.shift(); this.anuncios.push({ tipo, texto, d }); }
  pisca(cor = '#ffffff', f = 0.6) { this.flash = Math.max(this.flash, f); this.flashCor = cor; }

  // ---------- entradas ----------
  setFlip(lado: 0 | 1, on: boolean) { if (lado === 0) this.botE = on; else this.botD = on; }
  sacudir(dir = 0) {
    if (this.tilted || this.sacudeT > 0 || this.estado !== 'jogo') return;
    this.sacudeT = 0.3; this.tremor = 1; const d = dir || (rng() < 0.5 ? -1 : 1);
    for (const b of this.campo.bolas) if (!b.preso && !b.trilho) { b.vx += d * 95; b.vy -= 120; b.parado = 0; }
    this.tiltN++; this.tiltT = 2.6; this.som('aviso');
    if (this.tiltN === 2) this.anuncia('aviso', 'CUIDADO');
    if (this.tiltN >= 3) { this.tilted = true; this.anuncia('tilt', 'TILT'); this.som('tilt'); }
  }
  bolaNaCanaleta(): Bola | null { for (const b of this.mesa.bolas) if (b.x > 362 && b.y > 690 && !b.preso && Math.abs(b.vy) < 70) return b; return null; }
  lancar(forca = 1): boolean {
    if (this.sub || this.trans || this.estado === 'fim' || this.estado === 'bonus' || this.escolha) return false;
    const b = this.bolaNaCanaleta(); if (!b) return false;
    b.vy = -(1130 + 270 * clamp(forca, 0, 1)) * Math.sqrt(this.mesa.g / G); b.vx = 0; b.parado = 0; this.laneT = 0;
    this.som('lancador', forca); this.fx('faisca', b.x, b.y, this.cores.c1, 8);
    if (this.estado === 'lancar') {
      this.estado = 'jogo'; this.salva = this.tempoSalva(); this.inicioBola = this.tempoJogo;
      this.m.faixas.certeira = Math.floor(rng() * 3) % 3; this.certeiraT = 7;
    }
    return true;
  }
  escolher(i: number) { const e = this.escolha; if (!e) return; this.escolha = null; e.fim(clamp(i, 0, e.opcoes.length - 1)); this.som('missaoOk'); }

  // ---------- pontuação ----------
  mult(tipo: string, b?: Bola | null) {
    let m = this.dobro > 0 ? 2 : 1;
    for (const s of this.sigs) if (s.mult) m *= s.mult(tipo, b);
    if (this.sub?.multiplicador) m *= this.sub.multiplicador;
    return m * (1 + (this.nivel - 1) * 0.25);
  }
  pontua(base: number, b?: Bola | null, tipo = '', texto = ''): number {
    const p = Math.round(base * this.mult(tipo, b) / 10) * 10; this.pontos += p;
    if (b && p >= 2500) this.fx('pontos', b.x, b.y, this.cores.c1, 0, texto || abrevia(p));
    return p;
  }
  /** golpe na mecânica-assinatura da máquina: pontua e conta para o gatilho "bater 3 vezes" */
  assinou(b: Bola | null | undefined, pts: number, texto: string) {
    this.pontua(pts, b, 'assinatura', texto); this.assinN++; this.som('assinatura'); this.anuncia('assinatura', texto);
    if (this.def.andar.gatilho === 'bater3' && this.assinN >= 3) this.acendeAndar();
    if (this.mago) this.contaMago('golpes');
  }
  acendeAndar() { if (this.andarAceso || this.mago) return; this.andarAceso = true; this.anuncia('andarAceso', this.def.andar.nome); this.som('missao'); }

  // ---------- acontecimentos de mesa ----------
  ev(tipo: string, b?: Bola | null, d?: any) {
    if (this.sub && this.campo === this.sub.campo) { this.sub.ev(tipo, b, d); return; }
    for (const s of this.sigs) s.ev?.(tipo, b, d);
    const M = this.m;
    switch (tipo) {
      case 'bumper': this.pontua(1000, b, tipo); this.cont.bumpers++; this.som('bumper', d?.tom || 0); this.missao('bumpers'); this.contaMago('bumpers'); this.intensidade += 0.04; break;
      case 'sling': this.pontua(110, b, tipo); this.som('estilingue'); break;
      case 'alvo': this.pontua(2500, b, tipo); this.som('alvo'); this.missao('alvos'); this.contaMago('golpes'); if (b) this.fx('faisca', b.x, b.y, this.cores.c3, 6); break;
      case 'queda': this.pontua(3000, b, tipo); this.som('queda'); this.missao('alvos'); this.contaMago('golpes'); break;
      case 'banco': this.pontua(15000, b, tipo, 'BANCO'); this.bonusX = Math.min(9, this.bonusX + 1); this.anuncia('bonusX', 'BÔNUS ' + this.bonusX + 'X'); break;
      case 'giro': this.pontua(400, null, tipo); this.som('giro'); break;
      case 'retorno': this.pontua(500, b, tipo); this.som('faixa'); break;
      case 'externa': this.pontua(5000, b, tipo); break;
      case 'faixa':
        this.som('faixa'); this.pontua(1500, b, tipo);
        if (d.certeira && this.certeiraT > 0) { this.pontua(40000 * this.bola, b, tipo, 'TIRO CERTEIRO'); this.anuncia('certeiro', 'TIRO CERTEIRO'); this.som('jackpot'); this.certeiraT = 0; M.faixas.certeira = -1; }
        break;
      case 'faixas':
        this.bonusX = Math.min(9, this.bonusX + 1); this.armaResgate(); this.camaraAcesa = true;
        this.anuncia('bonusX', 'BÔNUS ' + this.bonusX + 'X'); this.som('missao'); break;
      case 'rampa': this.rampa(b!, d); break;
      case 'orbita':
        this.pontua(6000, b, tipo); this.cont.orbitas++; this.som('orbita'); this.missao('orbitas'); this.contaMago('rampas');
        if (this.multibola) this.jackpot(b!);
        if (++this.orbitasAndar >= 5 && this.def.andar.gatilho === 'passar5') { this.orbitasAndar = 0; this.acendeAndar(); }
        break;
      case 'portal': this.portal(b!, d); break;
      case 'tunel': this.sobe(b!, d); break;
      case 'trava': this.trava(b!); break;
      case 'chefe': this.golpeChefe(b!); break;
      case 'chefeVolta': M.chefe.vida = this.vidaChefe(); this.anuncia('chefeVolta', this.def.chefe.nome); break;
      case 'escudo': this.som('escudo'); if (b) this.fx('faisca', b.x, b.y, '#9fe8ff', 8); break;
      case 'poste': this.som('poste'); this.anuncia('poste', 'POSTE DEFENDEU'); if (b) this.fx('faisca', 190, 714, '#7dffb0', 10); break;
      case 'resgate': this.som('resgate'); this.anuncia('resgate', 'RESGATE'); this.fx('faisca', d.x, 720, '#7dffb0', 14); this.pisca('#7dffb0', 0.3); break;
    }
  }
  private rampa(b: Bola, d: any) {
    const lado = d.lado;
    if (lado > 0 && this.camaraAcesa && !this.mago && !this.multibola) {
      this.camaraAcesa = false; b.trilho = undefined; b.z = 0;
      this.iniciaTrans(criaArena(this, 'camara'), b, this.m.trava); return;
    }
    if (lado < 0 && this.andarAceso && !this.mago) { b.trilho = undefined; b.z = 0; this.sobe(b, this.m.portal); return; }
    this.combo = this.tempo - this.ultRampaT < 7 ? this.combo + 1 : 1;
    const alterna = this.combo > 1 && lado !== this.ultRampaLado;
    this.ultRampaT = this.tempo; this.ultRampaLado = lado;
    this.pontua(8000 * this.combo * (alterna ? 2 : 1), b, 'rampa', this.combo > 1 ? 'COMBO ' + this.combo + (alterna ? ' x2' : '') : '');
    if (this.combo > 1) this.anuncia('combo', 'COMBO ' + this.combo, { n: this.combo, alterna });
    this.cont.rampas++; this.rampasTot++; this.som('rampa'); this.missao('rampas'); this.contaMago('rampas'); this.intensidade += 0.15;
    if (this.rampasTot % 4 === 0) this.armaResgate();
    if (this.rampasTot % 3 === 0 && this.def.andar.gatilho === 'tunel') this.acendeAndar();
    if (this.multibola) this.jackpot(b);
  }
  private armaResgate() { this.m.resgE.armado = true; if (this.evol.resgate) this.m.resgD.armado = true; }
  private jackpot(b: Bola) {
    this.jackpots++; this.pontua(60000, b, 'jackpot', 'JACKPOT'); this.anuncia('jackpot', 'JACKPOT'); this.som('jackpot'); this.pisca('#ffd24a', 0.5);
    if (this.jackpots % 3 === 0) { this.superAceso = true; this.anuncia('superAceso', 'SUPER NO CHEFE'); }
  }
  private iniciaMissao(b: Bola | null): boolean {
    const i = this.missoes.findIndex(m => !m.feita); if (i < 0 || this.missaoAtiva >= 0 || this.mago) return false;
    const m = this.missoes[i]; this.missaoAtiva = i; this.missaoT = 48; this.semMissao = 0; m.n = 0; m.meta = METAS[i] + this.ciclo - 1; this.anuncia('missao', m.nome, m); this.som('missao'); if (b) this.pontua(5000, b, 'portal'); return true;
  }
  semMissao = 0;
  private portal(b: Bola, cap: Captor) {
    if (this.andarAceso && !this.mago) { this.sobe(b, cap); return; }
    if (this.iniciaMissao(b)) return;
    this.pontua(3000, b, 'portal'); this.som('portal');
  }
  private missao(tipo: string) {
    const m = this.missoes[this.missaoAtiva]; if (!m || m.tipo !== tipo) return;
    m.n++; this.anuncia('missaoAvanca', m.nome, m);
    if (m.n < m.meta) return;
    m.feita = true; this.missaoAtiva = -1; this.cont.missoes++; this.stats.missoes++; this.missoesNaBola++;
    this.pontua(60000 * this.ciclo, null, 'missao'); this.anuncia('missaoOk', m.nome); this.som('missaoOk'); this.evolui(); this.pisca(this.cores.c1, 0.5);
    if (this.missoesNaBola >= 2) this.acendeAndar();
    if (this.missoes.every(x => x.feita)) { this.bolaExtra(); this.ciclo++; for (const x of this.missoes) x.feita = false; }
  }
  bolaExtra() { this.extras++; this.anuncia('bolaExtra', 'BOLA EXTRA'); this.som('bolaExtra'); if (this.modo === 'eterno') this.vidasEternas = Math.min(5, this.vidasEternas + 1); }
  private trava(b: Bola) {
    if (this.multibola || this.mago) { this.pontua(4000, b, 'trava'); return; }
    this.travas++; this.som('trava'); this.pontua(10000, b, 'trava', 'TRAVA ' + this.travas); this.anuncia('trava', 'TRAVA ' + this.travas, { n: this.travas });
    if (this.travas >= 2) { this.travas = 0; this.multibola = true; this.jackpots = 0; this.adicionaBola(2); this.anuncia('multibola', 'MULTIBOLA'); this.som('jackpot'); this.pisca('#ffd24a', 0.8); this.salva = Math.max(this.salva, 12); }
  }
  vidaChefe() { return this.def.chefe.vidas[this.faseChefe % 3] + this.ciclosChefe + this.degrau; }
  private golpeChefe(b: Bola) {
    const M = this.m.chefe; M.vida--; this.cont.chefe++;
    this.pontua(15000 * (this.faseChefe % 3 + 1), b, 'chefe'); this.som('chefe'); this.missao('chefe'); this.contaMago('chefe'); this.tremor = Math.max(this.tremor, 0.5);
    this.fx('faisca', M.x, M.y, this.cores.c1, 12); this.anuncia('chefeDano', this.def.chefe.nome, { vida: M.vida });
    if (this.def.chefe.modo === 'salta') M.salta();
    if (this.multibola && this.superAceso) { this.superAceso = false; this.pontua(250000, b, 'jackpot', 'SUPER JACKPOT'); this.anuncia('super', 'SUPER JACKPOT'); this.som('super'); this.pisca('#ffffff', 1); }
    if (M.vida <= 0) this.derrubaFase(b, 1);
  }
  /** fase do chefe derrubada: evolução, pontos em dobro e o prêmio do rodízio */
  derrubaFase(b: Bola | null, fator: number) {
    const M = this.m.chefe; this.stats.nucleos++;
    this.pontua(50000 * fator, b, 'chefe', 'NÚCLEO!'); this.som('explosao'); this.fx('explosao', M.x, M.y, this.cores.c1, 60); this.pisca('#ffffff', 1); this.tremor = 1; this.lenta = 0.5;
    this.anuncia('chefeCai', this.def.chefe.nome, { fase: this.faseChefe % 3 + 1 }); this.fala(this.def.chefe.nome + ' caiu');
    this.faseChefe++; if (this.faseChefe % 3 === 0) this.ciclosChefe++;
    M.some(2.6); this.evolui(); this.dobro = 30; this.acendeAndar();
    if (this.mago || this.sub) return;
    const r = this.rodizio++ % 3;
    if (r === 0) { this.adicionaBola(1); this.anuncia('chuva', 'CHUVA DE ESTRELAS'); this.salva = Math.max(this.salva, 10); }
    else if (r === 1 && b && !this.multibola) { this.iniciaTrans(criaArena(this, ARENAS[this.arenaN++ % 3]), b, this.m.portal); }
    else if (r === 1) { this.adicionaBola(1); this.rodizio--; }
    else this.iniciaMago();
  }

  // ---------- modo mago ----------
  iniciaMago() {
    if (this.mago) return;
    this.mago = true; this.magoT = this.def.mago.duracao; this.magoN = 0; this.andarAceso = false; this.missaoAtiva = -1;
    const falta = 3 - (this.mesa.bolas.length + this.fila); if (falta > 0) this.adicionaBola(falta);
    this.anuncia('mago', this.def.mago.nome, this.def.mago.regra); this.fala(this.def.vozes.mago); this.som('super'); this.pisca('#ffffff', 1); this.stats.magos++;
  }
  private contaMago(tipo: string) {
    if (!this.mago) return;
    const r = this.def.mago.regra;
    if (r.tipo !== tipo && !(r.tipo === 'golpes')) return;
    this.magoN++; this.pontos += 25000 * this.nivel;
    if (this.magoN >= r.meta && !this.magoVenceuAgora) { this.magoVenceuAgora = true; this.magoT = Math.min(this.magoT, 1.2); }
  }
  magoVenceuAgora = false;
  fimMago() {
    this.mago = false; const venceu = this.magoVenceuAgora; this.magoVenceuAgora = false;
    if (venceu) { this.magoVenceu = true; this.nivel++; this.pontos += 500000; this.anuncia('magoVence', this.def.mago.nome); this.som('super'); this.bolaExtra(); this.aoVencerMago?.(this); }
    else this.anuncia('magoFim', this.def.mago.nome);
    this.salva = Math.max(this.salva, 8);
  }

  // ---------- evoluções ----------
  evolui(silencio = false) {
    const e = proximaEvolucao(this.evol);
    if (!e) { if (!silencio) this.pontos += 50000; return; }
    this.evol[e.id]++; this.aplicaEvolucoes();
    if (!silencio) { this.stats.evolucoes++; this.anuncia('evolucao', e.nome, e); this.som('evolucao'); }
  }
  aplicaEvolucoes() {
    const M = this.m, n = this.evol;
    M.pE.extra = M.pD.extra = extraPalheta(n.palhetas);
    const r = Math.max(2.5, [5.7, 6.8, 7.9][n.muros] - 0.5 * this.degrau); for (const p of M.muros) p.c.r = r;
    M.poste.tempoBaixo = [4, 3, 2][n.poste];
  }
  tempoSalva() { return Math.max(4, 18 + 7 * this.evol.escudo - 2 * this.degrau); }

  // ---------- bolas ----------
  novaNaCanaleta() { const b = novaBola(377, 738); this.mesa.bolas.push(b); return b; }
  adicionaBola(n = 1) { this.fila += n; this.laneAuto += n; }
  private canaletaLivre() { return !this.mesa.bolas.some(b => b.x > 361 && b.y > 430); }

  // ---------- andar de cima e campos separados ----------
  sobe(b: Bola, retorno: Captor, forcar?: TipoAndar) {
    if (this.sub || this.trans) return;
    const a = this.def.andar, v = this.andarVisitas++;
    const tipo = forcar || (v >= 2 && v % 2 === 0 ? a.variacao : a.tipo);
    this.andarAceso = false; this.assinN = 0; this.stats.andar++;
    this.iniciaTrans(criaAndar(this, tipo), b, retorno && (retorno as any).recebe ? retorno : this.m.portal);
  }
  iniciaTrans(sub: SubFase, b: Bola, retorno: Captor) {
    if (this.sub || this.trans) return;
    const i = this.mesa.bolas.indexOf(b); if (i >= 0) this.mesa.bolas.splice(i, 1);
    for (const p of this.mesa.pecas as any[]) { if (p.bola === b) p.bola = null; if (p.cab) p.cab = p.cab.map((x: any) => (x === b ? null : x)); }
    b.preso = true; b.trilho = undefined; b.z = 0;
    sub.retorno = retorno; this.sub = sub; this.trans = { dir: 1, t: 0, dur: sub.origem === 'andar' ? 1.6 : 0.9, sub, bola: b, retorno, cuspiu: false };
    this.som('tunelEntra'); this.anuncia('sobe', sub.nome, { origem: sub.origem, tipo: sub.tipo, dur: sub.dur });
  }
  private passoTrans(dt: number) {
    const T = this.trans!; T.t += dt;
    if (T.dir > 0) {
      if (!T.cuspiu && T.t >= T.dur * 0.75) {
        T.cuspiu = true; const b = T.bola!, e = T.sub.entrada; b.preso = false; b.x = e[0]; b.y = e[1]; b.vx = e[2]; b.vy = e[3]; b.parado = 0; b.lateral = false; b.rastro.length = 0;
        T.sub.campo.bolas.push(b); this.fx('faisca', b.x, b.y, this.cores.c1, 16); this.som('saida');
      }
      if (T.t >= T.dur) { this.campo = T.sub.campo; this.trans = null; this.anuncia('fase', T.sub.nome, { tipo: T.sub.tipo, dur: T.sub.dur, origem: T.sub.origem }); }
    } else if (T.t >= T.dur) {
      const b = T.bola || novaBola(0, 0); this.campo = this.mesa; this.sub = null; this.trans = null;
      this.mesa.bolas.push(b); T.retorno.recebe(b, 0.5); b.lateral = false; b.parado = 0;
      this.premiaSub(T.sub, b);
    }
  }
  private desce() {
    const s = this.sub!; const b = s.campo.bolas[0] || null; s.campo.bolas.length = 0; if (b) { b.preso = true; b.trilho = undefined; }
    this.trans = { dir: -1, t: 0, dur: s.origem === 'andar' ? 1.1 : 0.7, sub: s, bola: b, retorno: s.retorno!, cuspiu: true };
    this.som('tunelSai'); this.anuncia('desce', s.nome, { venceu: s.venceu });
  }
  private premiaSub(s: SubFase, b: Bola) {
    this.stats.subfases++;
    if (!s.venceu) return;
    if (s.origem === 'arena') { this.pontua(100000, b, 'sub', 'SUBFASE!'); this.evolui(); }
    else if (s.origem === 'camara') { this.pontua(80000, b, 'sub', 'CÂMARA LIMPA'); if (++this.camaraLimpas % 2 === 0) this.evolui(); }
    else if (s.tipo === 'premium') { this.pontua(120000, b, 'sub', 'PREMIUM!'); this.evolui(); this.bolaExtra(); }
    else if (s.tipo === 'chefao') { this.m.chefe.vida = 0; this.derrubaFase(null, 10); }
    else if (s.tipo === 'tunel') { this.pontua(100000, b, 'sub', 'ATALHO ABERTO'); this.atalho = true; this.anuncia('atalho', 'ATALHO ABERTO'); this.aoAtalho?.(this); }
    this.pisca(this.cores.c1, 0.7);
  }

  // ---------- laço ----------
  get ritmo() { let r = this.lenta > 0 ? 0.35 : 1; for (const s of this.sigs) if (s.ritmo) r *= s.ritmo(); if (this.escolha) r *= 0.12; return r; }
  update(dt = DT) {
    this.tempo += dt;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.4);
    if (this.tremor > 0) this.tremor = Math.max(0, this.tremor - dt * 3);
    if (this.lenta > 0) this.lenta -= dt;
    if (this.sacudeT > 0) this.sacudeT -= dt;
    this.intensidade = Math.max(0, this.intensidade - dt * 0.05);
    if (this.fxs.length > 150) this.fxs.splice(0, 100);
    this.entrada();
    if (this.estado === 'fim') return;
    if (this.escolha) { this.escolha.t -= dt; if (this.escolha.t <= 0) this.escolher(this.escolha.i); }
    if (this.estado === 'jogo') this.tempoJogo += dt;
    if (this.trans) { this.passoTrans(dt); return; }
    if (this.estado === 'bonus') { this.bonusT -= dt; if (this.bonusT <= 0) this.proximaBola(); return; }
    const d = dt * this.ritmo;
    if (this.sub) {
      const s = this.sub; s.campo.passo(d); s.update(d); this.cuida(s.campo, d);
      if (s.campo.temNaN()) { this.stats.nan++; s.fim = true; }
      if (s.fim) this.desce();
      return;
    }
    this.mesa.passo(d);
    if (this.trans || this.sub) return; // a bola acabou de subir para outro campo neste mesmo passo
    if (this.salva > 0 && this.estado === 'jogo') this.salva -= dt;
    if (this.dobro > 0) this.dobro -= dt;
    if (this.certeiraT > 0) { this.certeiraT -= dt; if (this.certeiraT <= 0) this.m.faixas.certeira = -1; }
    if (this.missaoAtiva < 0 && this.estado === 'jogo' && !this.mago) { this.semMissao += dt; if (this.semMissao > 20) this.iniciaMissao(null); }
    if (this.missaoAtiva >= 0) { this.missaoT -= dt; if (this.missaoT <= 0) { this.anuncia('missaoFalha', this.missoes[this.missaoAtiva].nome); this.missaoAtiva = -1; } }
    if (this.tiltT > 0) { this.tiltT -= dt; if (this.tiltT <= 0 && this.tiltN > 0 && !this.tilted) { this.tiltN--; this.tiltT = 2.6; } }
    if (this.mago) { this.magoT -= dt; if (this.magoT <= 0) this.fimMago(); }
    if (this.modo === 'eterno' && this.tempoJogo > (this.degrau + 1) * 180) { this.degrau++; this.mesa.g *= 1.02; this.aplicaEvolucoes(); this.vidasEternas = Math.min(5, this.vidasEternas + 1); this.anuncia('degrau', 'DEGRAU ' + (this.degrau + 1)); this.som('evolucao'); }
    for (const s of this.sigs) s.update?.(d);
    this.m.poste.forcado = this.multibola || this.mago;
    if (this.carregando) this.carga = Math.min(1, this.carga + dt * 1.1);
    this.serve(dt); this.drenos(); this.cuida(this.mesa, d); this.luzes();
  }
  private entrada() {
    const e = this.botE || this.toqueE, d = this.botD || this.toqueD;
    if (this.escolha) {
      const E = this.escolha;
      if (e && !this.antE) { E.i = (E.i + E.opcoes.length - 1) % E.opcoes.length; this.som('faixa'); }
      if (d && !this.antD) { E.i = (E.i + 1) % E.opcoes.length; this.som('faixa'); }
    }
    const ok = !this.tilted && this.estado !== 'fim' && !this.escolha;
    for (const p of this.campo.pas) p.aciona(ok && (p.lado > 0 ? e : d));
    if (ok) { if (e && !this.antE) this.som('palheta'); if (d && !this.antD) this.som('palheta'); if ((!e && this.antE) || (!d && this.antD)) this.som('palhetaDesce'); }
    this.antE = e; this.antD = d;
  }
  private serve(dt: number) {
    if (this.fila > 0) { this.servT -= dt; if (this.servT <= 0 && this.canaletaLivre()) { this.fila--; this.novaNaCanaleta(); this.servT = 0.7; } }
    if (this.estado !== 'jogo') return;
    if (this.bolaNaCanaleta()) { this.laneT += dt; if (this.laneAuto > 0 ? this.laneT > 0.35 : this.laneT > 3) { if (this.laneAuto > 0) this.laneAuto--; this.lancar(entre(0.45, 1)); } }
    else this.laneT = 0;
  }
  private drenos() {
    const bs = this.mesa.bolas;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i], ruim = !Number.isFinite(b.x + b.y + b.vx + b.vy);
      if (!(ruim || b.y > 776 || b.y < -60 || b.x < -10 || b.x > 410)) continue;
      bs.splice(i, 1);
      if (ruim) { this.stats.nan++; this.adicionaBola(1); continue; }
      if (b.y <= 776) { this.stats.fugas++; this.adicionaBola(1); continue; }
      this.stats.drenos++; if (b.lateral) this.stats.laterais++;
      this.som('dreno'); this.fx('dreno', b.x, 756, '#ff5577', 10);
      if (this.mago || this.salva > 0) { this.adicionaBola(1); this.anuncia('salva', 'BOLA SALVA'); this.som('salva'); }
    }
    const vivas = bs.length + this.fila;
    if (this.multibola && vivas <= 1) { this.multibola = false; this.superAceso = false; this.anuncia('multibolaFim', 'FIM DA MULTIBOLA'); }
    if (vivas === 0 && this.estado === 'jogo') this.fimDeBola();
  }
  /** antitravamento e medição de bola parada */
  private cuida(c: Campo, dt: number) {
    for (const b of c.bolas) {
      if (b.preso || b.trilho || (c === this.mesa && b.x > 362 && b.y > 690)) { b.parado = 0; continue; }
      if (b.vx * b.vx + b.vy * b.vy > 36) { b.parado = 0; continue; }
      const antes = b.parado; b.parado += dt;
      if (antes < 5 && b.parado >= 5 && b.y < 640) this.stats.paradas++;
      if (b.parado > (b.y > 640 && c === this.mesa ? 7 : 2.5)) { b.vx = entre(90, 220) * (rng() < 0.5 ? -1 : 1); b.vy = -entre(160, 360); b.parado = 0; this.stats.empurroes++; }
    }
  }
  private luzes() {
    const M = this.m, m = this.missoes[this.missaoAtiva], t = m?.tipo;
    for (const r of M.rampas) r.vale = this.multibola ? 2 : t === 'rampas' || (r.lado > 0 && this.camaraAcesa) || (r.lado < 0 && this.andarAceso) ? 1 : 0;
    for (const o of M.orbitas) o.vale = this.multibola || t === 'orbitas' ? 1 : 0;
    for (const a of M.alvos) a.vale = t === 'alvos' ? 1 : 0;
    M.banco.vale = t === 'alvos' ? 1 : 0;
    M.portal.vale = this.andarAceso || (this.missaoAtiva < 0 && !this.mago) ? 1 : 0;
    M.portal.rotulo = this.andarAceso ? 'TÚNEL' : 'MISSÃO';
    M.trava.vale = !this.multibola && !this.mago ? 1 : 0;
  }
  private fimDeBola() {
    this.stats.tempos.push(this.tempoJogo - this.inicioBola);
    const c = this.cont;
    this.bonusItens = this.tilted ? [['TILT', 0]] : [['BUMPERS', c.bumpers * 200], ['RAMPAS', c.rampas * 2500], ['ÓRBITAS', c.orbitas * 2000], ['CHEFE', c.chefe * 3000], ['MISSÕES', c.missoes * 10000]];
    this.bonusTotal = this.bonusItens.reduce((s, i) => s + i[1], 0) * this.bonusX; this.pontos += this.bonusTotal;
    this.estado = 'bonus'; this.bonusT = this.bonusTotal > 0 ? 3.4 : 1.6; this.mago = false; this.multibola = false; this.missaoAtiva = -1;
    this.anuncia('bonus', 'BÔNUS', { itens: this.bonusItens, x: this.bonusX, total: this.bonusTotal }); this.som('dreno');
  }
  private proximaBola() {
    if (this.modo === 'eterno') { if (this.extras > 0) this.extras--; else this.vidasEternas--; if (this.vidasEternas <= 0) return this.fim(); }
    else if (this.extras > 0) { this.extras--; this.anuncia('repete', 'JOGUE DE NOVO'); }
    else { this.bola++; if (this.bola > this.bolasTotal) return this.fim(); }
    this.estado = 'lancar'; this.bonusX = 1; this.missoesNaBola = 0; this.assinN = 0; this.combo = 0; this.tilted = false; this.tiltN = 0;
    this.cont = { bumpers: 0, rampas: 0, orbitas: 0, chefe: 0, missoes: 0 }; this.fila = 0; this.laneAuto = 0; this.carga = 0;
    this.m.resgE.armado = true; if (this.evol.resgate) this.m.resgD.armado = true;
    this.novaNaCanaleta(); this.anuncia('bola', this.modo === 'eterno' ? 'RESERVA ' + this.vidasEternas : 'BOLA ' + this.bola);
    for (const s of this.sigs) s.bola?.();
  }
  private fim() { this.estado = 'fim'; this.anuncia('fim', 'FIM DE JOGO', { pontos: this.pontos }); this.fala(this.def.vozes.fim); this.aoFim?.(this); }
  get subiuMestria() { return this.pontos >= 1500000 || this.magoVenceu; }
  get nomesEvolucoes() { return EVOLUCOES.filter(e => this.evol[e.id] > 0).map(e => e.nome + ' ' + this.evol[e.id]); }
  /** fase do compasso da trilha (0 no tempo forte) */
  batida() { const p = this.tempo * this.def.bpm / 60; return p - Math.floor(p); }
}

export function abrevia(p: number): string { return p >= 1e6 ? (p / 1e6).toFixed(p % 1e6 ? 1 : 0) + 'M' : p >= 1000 ? Math.round(p / 1000) + 'K' : String(p); }
