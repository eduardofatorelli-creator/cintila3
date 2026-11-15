// Evoluções conquistadas durante a partida.
import { embaralha } from '../core/vec';

export interface Evolucao { id: string; nome: string; max: number; texto: string }
export const EVOLUCOES: Evolucao[] = [
  { id: 'palhetas', nome: 'Palhetas Longas', max: 2, texto: 'palhetas mais compridas' },
  { id: 'muros', nome: 'Muros Laterais', max: 2, texto: 'postes fecham as canaletas' },
  { id: 'ima', nome: 'Ímã Guardião', max: 2, texto: 'puxa a bola para o centro' },
  { id: 'escudo', nome: 'Escudo de Luz', max: 3, texto: '+7 s de bola protegida' },
  { id: 'resgate', nome: 'Resgate Duplo', max: 1, texto: 'chute de volta na direita' },
  { id: 'poste', nome: 'Poste Reforçado', max: 2, texto: 'poste central volta mais rápido' },
];

export type Niveis = Record<string, number>;
export const semEvolucoes = (): Niveis => Object.fromEntries(EVOLUCOES.map(e => [e.id, 0]));

/** Escolhe a próxima evolução ainda não esgotada. Devolve null se todas estiverem no teto. */
export function proximaEvolucao(n: Niveis): Evolucao | null {
  const livres = embaralha(EVOLUCOES.filter(e => n[e.id] < e.max));
  return livres[0] || null;
}

/** Comprimento extra da palheta: 3,5 u por nível, com teto que mantém o vão entre as pontas ≥ 14 u. */
export function extraPalheta(nivel: number, base = 60, distPivos = 132, repouso = 0.5, raioPonta = 0): number {
  const maxComp = (distPivos - 14 - raioPonta * 2) / 2 / Math.cos(repouso);
  return Math.min(nivel * 3.5, Math.max(0, maxComp - base));
}
