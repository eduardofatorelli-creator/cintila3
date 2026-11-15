// Jogador automático: usado pelos testes e pelo modo de atração do menu.
import type { Game } from './rules';

export class Robo {
  private solta = [0, 0]; private viu = [false, false]; private dorme = [0, 0]; private limiar = [0, 0]; private espera = 0; private sacode = 0;
  /** habilidade 0..1: quanto menor, mais erra a janela */
  constructor(public J: Game, private azar: () => number = Math.random, public habilidade = 0.8) { this.novoLimiar(0); this.novoLimiar(1); }
  private novoLimiar(i: number) { this.limiar[i] = 6 + this.azar() * 26 * (1.3 - this.habilidade); }
  passo(dt: number) {
    const J = this.J;
    if (J.escolha) { J.setFlip(0, false); J.setFlip(1, false); if (J.escolha.t < J.escolha.opcoes.length + 1) J.escolher(Math.floor(this.azar() * J.escolha.opcoes.length)); return; }
    if (J.estado === 'lancar' || (J.estado === 'jogo' && J.bolaNaCanaleta() && J.laneAuto === 0)) { this.espera += dt; if (this.espera > 0.6) { this.espera = 0; J.lancar(0.35 + this.azar() * 0.65); } }
    const C = J.campo;
    if (J.sub?.rolagem) { const b = C.bolas[0]; if (b) { const alvo = 190 + Math.sin(J.tempo * 0.9) * 90; J.setFlip(0, b.x > alvo + 14); J.setFlip(1, b.x < alvo - 14); } return; }
    for (let i = 0; i < 2; i++) {
      const p = C.pas.find(q => (i === 0 ? q.lado > 0 : q.lado < 0));
      if (this.solta[i] > 0) { this.solta[i] -= dt; if (this.solta[i] <= 0) J.setFlip(i as 0 | 1, false); continue; }
      if (!p) { J.setFlip(i as 0 | 1, false); continue; }
      let aciona = false;
      for (const b of C.bolas) {
        if (b.preso || b.trilho) { if (b.preso && this.azar() < 0.01) aciona = true; continue; }
        const dx = (b.x - p.px) * p.lado, dy = b.y - p.py;
        if (dx > -6 && dx < p.comp + 10 && dy > -this.limiar[i] - 8 && dy < 34 && b.vy > -120) aciona = true;
      }
      if (!aciona) this.viu[i] = false;
      else if (!this.viu[i]) { this.viu[i] = true; if (this.azar() > this.habilidade) this.dorme[i] = 0.2 + this.azar() * 0.35; }
      if (this.dorme[i] > 0) { this.dorme[i] -= dt; continue; }
      if (aciona) { J.setFlip(i as 0 | 1, true); this.solta[i] = 0.12 + this.azar() * 0.2; this.novoLimiar(i); }
    }
    this.sacode -= dt;
    if (this.sacode <= 0) { this.sacode = 4 + this.azar() * 8; for (const b of C.bolas) if (!b.preso && b.parado > 1.5 && b.y < 640) J.sacudir(); }
  }
}
