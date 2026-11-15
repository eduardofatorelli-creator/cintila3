// Construtores de geometria: arco do topo, a parte de baixo validada (seção 4.3) e utilidades.
import { Campo, E_ARCO, E_BORRACHA, E_PAREDE, Seg, seg } from './physics';

export const espelha = (x: number) => 380 - x;
export const PIVO_E = [124, 694], PIVO_D = [256, 694];

export function arco(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): number[][] {
  const p: number[][] = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
}

export interface Baixo { guiaE: Seg; guiaD: Seg; estE: Seg; estD: Seg }

/** A parte de baixo que resolveu o dreno lateral. Espelhada com x → 380 − x. */
export function parteDeBaixo(c: Campo, cor: string): Baixo {
  const r: any = {};
  for (const lado of [0, 1]) {
    const m = (x: number) => (lado ? espelha(x) : x), sufixo = lado ? 'D' : 'E';
    c.parede([[m(20), 430], [m(20), 572], [m(20), 700], [m(48), 756], [m(48), 800]], E_PAREDE, { cor });
    // guia de retorno: joga a bola descendo para dentro; de baixo para cima a bola passa (resgate)
    const dx = m(62) - m(20), dy = 28, L = Math.hypot(dx, dy);
    let nx = dy / L, ny = -dx / L; if (ny > 0) { nx = -nx; ny = -ny; }
    r['guia' + sufixo] = c.parede([[m(20), 572], [m(62), 600]], 0.2, { cor, nx, ny })[0];
    c.parede([[m(54), 630], [m(54), 700]], E_PAREDE, { cor });
    // piso da entrada interna: entrega em cima da palheta, um pouco além do pivô
    c.parede([[m(54), 640], [m(128), 673], [m(124), 690]], E_ARCO, { cor });
    // estilingue: triângulo A B C, a face ativa A→C é registrada pela peça
    // costas do estilingue amortecidas: a bola que vem do guia cai na entrada interna em vez de quicar para fora
    c.parede([[m(86), 568], [m(86), 624]], 0.1, { cor }); c.parede([[m(86), 624], [m(128), 632]], E_BORRACHA, { cor });
    r['est' + sufixo] = seg(m(86), 568, m(128), 632, E_BORRACHA, { cor, tipo: 'estilingue' });
    c.segs.push(r['est' + sufixo]);
  }
  return r as Baixo;
}

/** Contorno de cima: paredes altas, arco e canaleta do lançador com porta de sentido único. */
export function contorno(c: Campo, cor: string) {
  c.parede([[20, 430], [20, 178]], E_PAREDE, { cor });
  c.parede(arco(206, 178, 186, 164, Math.PI, Math.PI * 2, 26), E_ARCO, { cor });
  c.parede([[392, 178], [392, 750]], E_PAREDE, { cor });
  c.parede([[362, 750], [392, 750]], 0.1, { cor });
  c.parede([[361, 186], [361, 800]], E_PAREDE, { cor });
  c.parede([[360, 430], [360, 186]], E_PAREDE, { cor });
  c.parede([[362, 186], [392, 178]], E_ARCO, { cor, nx: -0.258, ny: -0.968, tipo: 'porta' });
}

/** Caixa selada para os campos separados (arenas e andar de cima). */
export function caixa(c: Campo, x0: number, y0: number, x1: number, y1: number, cor: string, chanfro = 46) {
  c.parede([[x0, y1], [x0, y0 + chanfro], [x0 + chanfro, y0], [x1 - chanfro, y0], [x1, y0 + chanfro], [x1, y1]], E_PAREDE, { cor });
}
