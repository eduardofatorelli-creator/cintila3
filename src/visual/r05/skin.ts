// R05 · "Skin" de máquina: substitui o DESENHO de peças específicas (nunca a peça, a colisão ou a regra).
// Cada função recebe o Pintor e a peça real e lê só o estado dela (posição, flash, aceso, off…).
import type { Seg } from '../../core/physics';
import type { Game } from '../../game/rules';
import type { MachineDef } from '../../machines/_schema';
import type { Pintor } from '../../render/playfield';
import type { InfoMesa } from '../cenas';
import type { Pincel } from '../pincel';

export type Desenho = (g: Pintor, p: any) => void;
export interface Skin {
  /** tablado completo (substitui cena + acabamento) */
  tablado(p: Pincel, m: InfoMesa): void;
  /** backglass em 3 camadas (paralaxe) */
  vidro(c: CanvasRenderingContext2D[], w: number, h: number, d: MachineDef): void;
  /** desenho por tipo de peça */
  pecas: Record<string, Desenho>;
  /** luzes por tipo de peça; null suprime as luzes da peça (quando o sprite já as contém) */
  luzes: Record<string, Desenho | null>;
  /** paredes fixas (vão para o cache do tablado) */
  paredes(g: Pintor, segs: Seg[]): void;
  palheta: { corpo: string; base: string; borracha: string };
  /** antes das peças: poças de luz e insertos de estado da partida */
  antesPecas(g: Pintor, J: Game): void;
  /** fundo do túnel mágico (campo em rolagem) */
  tunel?(g: Pintor, campo: import('../../core/physics').Campo): void;
  /** moldura do backbox */
  moldura?: boolean;
}

export const SKINS: Record<string, Skin> = {};
export const skinDe = (id: string): Skin | null => SKINS[id] || null;
