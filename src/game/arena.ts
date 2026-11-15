// Subfases em campo separado, de chão selado: Coração do Núcleo, Enxame, Muralha e a Câmara Alta.
import { Bola, Campo, E_ARENA, G, Palheta } from '../core/physics';
import { caixa } from '../core/geometry';
import { entre } from '../core/vec';
import * as P from './elements';
import type { Game } from './rules';
import type { Captor } from './elements';

export class SubFase {
  campo = new Campo(); t = 0; fim = false; venceu = false; meta = 0; n = 0; dica = ''; multiplicador = 1;
  entrada = [190, 560, 0, -700]; retorno?: Captor; rolagem = false; ataque = ''; aberto = false; alvos: P.Tijolo[] = []; nucleo?: P.Tijolo; chefao?: P.Chefe;
  tick: ((dt: number) => void) | null = null; aoEv: ((tipo: string, b: Bola | null | undefined, d: any) => void) | null = null;
  constructor(public J: Game, public tipo: string, public nome: string, public dur: number, public origem: 'andar' | 'arena' | 'camara') { this.campo.nome = tipo; }
  get resta() { return Math.max(0, this.dur - this.t); }
  get progresso() { return this.meta ? this.n / this.meta : this.t / this.dur; }
  vence() { if (this.fim) return; this.venceu = true; this.fim = true; this.J.som('missaoOk'); }
  ev(tipo: string, b?: Bola | null, d?: any) {
    const J = this.J;
    if (tipo === 'bumper') { J.pontua(1500, b, tipo); J.som('bumper', d?.tom || 0); }
    else if (tipo === 'sling') J.som('estilingue');
    else if (tipo === 'piso') J.som('poste');
    this.aoEv?.(tipo, b, d);
  }
  update(dt: number) {
    this.t += dt; this.tick?.(dt);
    if (this.t >= this.dur) this.fim = true;
    const bs = this.campo.bolas;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i];
      if (b.y > this.campo.alt + 20 || b.x < -20 || b.x > 420 || b.y < -80) { if (this.aberto && b.y > this.campo.alt) { this.fim = true; return; } b.x = this.entrada[0]; b.y = this.entrada[1]; b.vx = 0; b.vy = -500; }
    }
    if (!bs.length && this.t > 0.2) this.fim = true;
  }
}

/** Monta um campo separado: caixa, palhetas e piso que devolve a bola (ou vão aberto). */
export function campoSelado(s: SubFase, o: { pivos?: number[]; comp?: number; aberto?: boolean; g?: number; umaPalheta?: boolean }) {
  const C = s.campo, J = s.J, cor = J.cores.c2, pv = o.pivos || [124, 256], comp = o.comp || 60, py = 690;
  C.g = (o.g ?? 0.92) * G; s.aberto = !!o.aberto;
  caixa(C, 20, 70, 360, 800, cor);
  C.parede([[20, 590], [pv[0] - 2, py - 16], [pv[0] - 4, py - 4]], 0.3, { cor });
  if (o.umaPalheta) C.parede([[360, 560], [pv[0] + comp + 18, py + 44]], 0.3, { cor });
  else C.parede([[360, 590], [pv[1] + 2, py - 16], [pv[1] + 4, py - 4]], 0.3, { cor });
  C.pas.push(new Palheta(pv[0], py, 1, comp)); if (!o.umaPalheta) C.pas.push(new Palheta(pv[1], py, -1, comp));
  if (!o.aberto) {
    const piso = { bateu(b: Bola) { b.vy = -entre(760, 900); b.vx += entre(-90, 90); J.ev('piso', b); } };
    C.parede([[20, 752], [360, 752]], E_ARENA, { cor: J.cores.c1, dono: piso, tipo: 'piso' });
  }
  s.entrada = [190, 520, entre(-60, 60), -640];
}

export function criaArena(J: Game, tipo: string): SubFase {
  const nomes: Record<string, string> = { nucleo: 'CORAÇÃO DO NÚCLEO', enxame: 'ENXAME', muralha: 'MURALHA', camara: 'CÂMARA ALTA' };
  const s = new SubFase(J, tipo, nomes[tipo] || tipo, tipo === 'camara' ? 12 : 32, tipo === 'camara' ? 'camara' : 'arena');
  const C = s.campo;
  campoSelado(s, { umaPalheta: tipo === 'camara' });
  const alvo = (x: number, y: number, r: number, vidas = 1) => { const t = C.add(new P.Tijolo(J, C, x, y, r)); t.vidas = vidas; s.alvos.push(t); return t; };
  if (tipo === 'nucleo') {
    s.nucleo = alvo(190, 270, 26, 8); s.nucleo.vx = 46; s.nucleo.lim = [110, 270, 200, 340]; s.meta = 8; s.dica = 'ACERTE O NÚCLEO 8 VEZES';
    C.add(new P.Bumper(J, C, 96, 200, 15, 0)); C.add(new P.Bumper(J, C, 284, 200, 15, 1));
  } else if (tipo === 'enxame') {
    for (let i = 0; i < 8; i++) { const t = alvo(70 + i * 36, 150 + (i % 3) * 70, 10); t.vx = entre(40, 90) * (i % 2 ? 1 : -1); t.vy = entre(20, 60); t.lim = [44, 336, 120, 420]; }
    s.meta = 8; s.dica = 'DERRUBE O ENXAME';
  } else if (tipo === 'muralha') {
    for (let l = 0; l < 2; l++) for (let i = 0; i < 6; i++) alvo(70 + i * 48, 150 + l * 34, 13);
    s.meta = 12; s.dica = 'QUEBRE A MURALHA';
    C.add(new P.Bumper(J, C, 190, 290, 15, 2));
  } else {
    alvo(90, 170, 12); alvo(190, 130, 12); alvo(290, 170, 12); C.add(new P.Bumper(J, C, 210, 260, 16, 1)); s.meta = 3; s.dica = 'LIMPE OS 3 ALVOS';
    s.entrada = [120, 420, 40, -300];
  }
  s.aoEv = (t, b) => {
    if (t !== 'tijolo') return;
    J.pontua(6000, b, 'sub'); J.som('tijolo'); if (b) J.fx('faisca', b.x, b.y, J.cores.c1, 8);
    s.n = s.nucleo ? 8 - Math.max(0, s.nucleo.vidas) : s.alvos.filter(a => !a.vivo).length;
    if (s.n >= s.meta) { if (s.nucleo) J.fx('explosao', s.nucleo.x, s.nucleo.y, J.cores.c1, 50); s.vence(); }
  };
  return s;
}
