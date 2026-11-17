// R06 · Fonte única de verdade para os indicadores de missão (backbox e painel lateral leem daqui)
// e a fila do painel de pontos (sem DOM, testável no vitest).

export interface MissaoVisivel {
  ativa: boolean; indice: number; nome: string; n: number; meta: number; tempo: number;
  feitas: number; total: number; proxima: string | null; todas: boolean;
}
interface JogoMissoes { missoes: { nome: string; feita: boolean; n: number; meta: number }[]; missaoAtiva: number; missaoT: number }

/** o estado das missões como deve aparecer em qualquer indicador */
export function estadoMissao(J: JogoMissoes): MissaoVisivel {
  const i = J.missaoAtiva, m = i >= 0 ? J.missoes[i] : null, feitas = J.missoes.filter(x => x.feita).length, prox = J.missoes.find(x => !x.feita);
  return {
    ativa: !!m, indice: i, nome: m?.nome || '', n: m ? m.n : 0, meta: m ? m.meta : 0, tempo: m ? Math.max(0, Math.ceil(J.missaoT)) : 0,
    feitas, total: J.missoes.length, proxima: m ? null : prox?.nome || null, todas: feitas === J.missoes.length,
  };
}

export interface ItemDmd { a: { tipo: string; texto?: string; d?: any }; t: number; dur: number }
/** fotografa o anúncio: a animação mostra o valor do momento do evento (o objeto da missão é mutável) */
export function fotografa<T extends { tipo: string; texto?: string; d?: any }>(a: T): T { return a.d && typeof a.d === 'object' && !Array.isArray(a.d) ? { ...a, d: { ...a.d } } : a; }

const MISSAO = ['missao', 'missaoAvanca', 'missaoOk', 'missaoFalha'];
/** regras da fila do painel de pontos: progresso de missão é substituído pelo mais novo; conclusão/falha descarta
 *  progressos pendentes da mesma missão; eventos de fim zeram a fila; eventos miúdos não se acumulam; no máximo 5 */
export function enfileiraDmd(fila: ItemDmd[], novo: ItemDmd): ItemDmd[] {
  const tp = novo.a.tipo; let f = fila;
  if (tp === 'fim' || tp === 'tilt' || tp === 'bonus') f = [];
  if (tp === 'missaoAvanca') f = f.filter(x => x.a.tipo !== 'missaoAvanca');
  if (tp === 'missaoOk' || tp === 'missaoFalha') f = f.filter(x => !(MISSAO.includes(x.a.tipo) && x.a.tipo !== 'missaoOk' && x.a.texto === novo.a.texto));
  if ((tp === 'chefeDano' || tp === 'combo' || tp === 'assinatura' || tp === 'poste') && f.length > 1) return f;
  f = [...f, novo]; if (f.length > 5) f = f.slice(f.length - 5);
  return f;
}

/** prioridade dos letreiros: 0 comum (sem letreiro), 1 importante, 2 especial */
export const PRIORIDADE: Record<string, number> = {
  chefeCai: 2, mago: 2, magoVence: 2, multibola: 2, jackpot: 2, super: 2, atalho: 2,
  missao: 1, missaoOk: 1, missaoFalha: 1, chefeVolta: 1, sobe: 1, desce: 1, andarAceso: 1, assinaturaTotal: 1, evolucao: 1, ataque: 1, magoFim: 1,
};
