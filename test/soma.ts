// Soma as métricas de dreno de todas as máquinas em várias sementes (amostra maior que a do teste).
import { MAQUINAS } from '../src/machines';
import { simula } from './bot';
const sementes = (process.argv[2] || '7,11').split(',').map(Number), seg = +(process.argv[3] || 300);
let D = 0, L = 0, P = 0, N = 0, E = 0; const ruins: string[] = [];
for (const def of MAQUINAS) { let d = 0, l = 0, t = 0; for (const s of sementes) { const m = simula(def, seg, s); d += m.drenos; l += m.laterais; P += m.paradas; N += m.nan + m.fugas; E += m.erros; t += m.tempoMedio; } D += d; L += l; const pct = d ? l / d * 100 : 0; if (pct >= 8 || t / sementes.length < 20) ruins.push(`${def.id} ${l}/${d} ${pct.toFixed(0)}% bola ${(t / sementes.length).toFixed(0)}s`); }
console.log(`total: ${L}/${D} laterais = ${(L / D * 100).toFixed(1)}% | paradas ${P} | nan+fugas ${N} | erros ${E}`); console.log('fora da meta:', ruins.join(' ; ') || 'nenhuma');
