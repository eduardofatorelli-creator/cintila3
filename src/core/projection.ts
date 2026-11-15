// A perspectiva 2.5D. Uma função única, usada por todo desenho.
import { H, W } from './physics';

export interface Camera { P: number; CURVA: number }
export const CAM_MESA: Camera = { P: 0.26, CURVA: 0.18 };
export const CAM_ANDAR: Camera = { P: 0.14, CURVA: 0.08 };
export const CXP = W / 2;

/** x, y em unidades de mesa; z é a altura. Devolve a posição na tela (ainda em unidades) e a escala k. */
export function proj(x: number, y: number, z = 0, cam: Camera = CAM_MESA) {
  const t = y / H;                                  // 0 no fundo, 1 na frente
  const k = (1 - cam.P) + cam.P * t;                // escala horizontal nesta linha
  const yy = (t * t * cam.CURVA + t * (1 - cam.CURVA)) * H;
  return { sx: CXP + (x - CXP) * k, sy: yy - z * k * 1.35, k };
}
export const misturaCam = (a: Camera, b: Camera, u: number): Camera => ({ P: a.P + (b.P - a.P) * u, CURVA: a.CURVA + (b.CURVA - a.CURVA) * u });
