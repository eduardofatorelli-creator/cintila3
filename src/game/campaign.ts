// Progressão entre as máquinas e fechamento de partida (recorde, mestria, desbloqueio).
import { salvo } from '../core/storage';
import { MAQUINAS } from '../machines';
import type { Game } from './rules';

export interface Fecho { recorde: boolean; mestria: number; subiu: boolean; liberou: number; anterior: number }

/** vencer o modo mago (ou abrir o atalho do túnel) libera a próxima máquina */
export function libera(J: Game): number {
  const prox = J.def.n + 1; if (prox > MAQUINAS.length || salvo.desbloqueadas() >= prox) return 0;
  salvo.desbloqueia(prox); return prox;
}
export function fecha(J: Game, liberou: number): Fecho {
  const id = J.def.id; salvo.contaPartida();
  if (J.modo === 'eterno') { const ant = salvo.eterno(id).tempo; const rec = salvo.registraEterno(id, J.tempoJogo, J.pontos); return { recorde: rec, mestria: salvo.mestria(id), subiu: false, liberou, anterior: ant }; }
  const anterior = salvo.recorde(id), recorde = salvo.registra(id, J.pontos), subiu = J.subiuMestria && salvo.mestria(id) < 10;
  return { recorde, mestria: subiu ? salvo.sobeMestria(id) : salvo.mestria(id), subiu, liberou, anterior };
}
