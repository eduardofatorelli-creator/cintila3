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

/**
 * Comprimento extra da palheta: 4 u por nível, SEM teto.
 * O vão central não encolhe porque o pivô anda para fora junto (ver recuoPivo).
 * O teto antigo garantia 14 u entre os CENTROS das pontas, mas a ponta tem raio 4,1 e a bola 7:
 * a passagem real precisa de 2*4,1 + 2*7 = 22,2 u. Com 14 u a bola ficava presa nas duas pontas.
 */
export function extraPalheta(nivel: number): number { return nivel * 4; }

/** Quanto cada pivô recua para fora, para o vão entre as pontas ficar constante. */
export function recuoPivo(nivel: number, repouso = 0.5): number {
  return extraPalheta(nivel) * Math.cos(repouso);
}
