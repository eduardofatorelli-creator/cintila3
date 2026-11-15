// Diagnóstico: contagem de acontecimentos e por onde a bola anda.
import { DT } from '../src/core/physics';
import { semear } from '../src/core/vec';
import { Robo } from '../src/game/bot';
import { Game } from '../src/game/rules';
import { MAQUINAS } from '../src/machines';
import { azarSemeado } from './bot';
const id = process.argv[2] || 'aurora', seg = +(process.argv[3] || 120), hab = +(process.argv[4] || 0.8);
const def = MAQUINAS.find(m => m.id === id)!; semear(99);
const J = new Game(def), R = new Robo(J, azarSemeado(5), hab);
const cont: Record<string, number> = {}; const ev0 = J.ev.bind(J); J.ev = (t, b, d) => { cont[t] = (cont[t] || 0) + 1; ev0(t, b, d); };
const an: Record<string, number> = {}; const a0 = J.anuncia.bind(J); J.anuncia = (t, x, d) => { an[t] = (an[t] || 0) + 1; a0(t, x, d); };
const hist = new Array(8).fill(0); let amostras = 0, sub = 0;
for (let i = 0; i < seg / DT && J.estado !== 'fim'; i++) { R.passo(DT); J.update(DT); if (J.sub) sub++; for (const b of J.mesa.bolas) { hist[Math.min(7, Math.max(0, Math.floor(b.y / 100)))]++; amostras++; } }
console.log('eventos', cont); console.log('anúncios', an);
console.log('y/100 %', hist.map(h => Math.round(h / amostras * 100)).join(' '), '| em subfase', Math.round(sub * DT) + 's', '| pontos', J.pontos, 'bola', J.bola, 'estado', J.estado, 'tempo', Math.round(J.tempoJogo), 'stats', JSON.stringify(J.stats));
