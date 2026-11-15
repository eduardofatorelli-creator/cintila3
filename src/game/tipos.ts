// Contratos compartilhados entre as peças, as regras e o desenho.
import type { Bola, Campo } from '../core/physics';

export interface Jogo {
  /** todo acontecimento de mesa passa por aqui: pontuação, missões, som e painel */
  ev(tipo: string, b?: Bola | null, d?: any): void;
  som(nome: string, p?: number): void;
  fx(tipo: string, x: number, y: number, cor?: string, n?: number): void;
  mesa: Campo; campo: Campo; tempo: number;
  botE: boolean; botD: boolean; toqueE: boolean; toqueD: boolean;
  cores: { c1: string; c2: string; c3: string };
  andarAceso: boolean;
}

/** Ferramentas de desenho em perspectiva entregues a cada peça. */
export interface Gfx {
  c: CanvasRenderingContext2D; t: number;
  p(x: number, y: number, z?: number): [number, number, number];
  cil(x: number, y: number, r: number, z: number, cor: string, topo?: string): void;
  disco(x: number, y: number, r: number, cor: string, z?: number, a?: number): void;
  anel(x: number, y: number, r: number, cor: string, l?: number, z?: number, a?: number): void;
  luz(x: number, y: number, r: number, cor: string, on: number, rot?: string): void;
  glow(x: number, y: number, r: number, cor: string, z?: number, a?: number): void;
  muro(ax: number, ay: number, bx: number, by: number, z: number, cor: string, l?: number): void;
  linha(pts: number[][], cor: string, l: number, a?: number): void;
  poli(pts: number[][], cor: string, a?: number): void;
  txt(x: number, y: number, s: string, cor: string, tam: number, z?: number): void;
  pisca(hz: number): boolean;
}
