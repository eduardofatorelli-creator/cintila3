import { Game } from '../src/game/rules';
import { MAQUINAS } from '../src/machines';
const todos = new Map<string, string[]>();
for (const d of MAQUINAS) { const J = new Game(d, 'normal', 0, 1); const t = [...new Set(J.mesa.pecas.map((p: any) => p.tipo))]; for (const x of t) todos.set(x, [...(todos.get(x) || []), d.n + '']); console.log(d.n, d.id, 'chefe=' + d.chefe.forma.tipo + '/' + d.chefe.forma.pontas + '/' + d.chefe.modo, d.chefe.forma.cor, '|', t.filter(x => !['estilingue','rampa','orbita','travaDeBola','portal','faixas','canaletaDeRetorno','canaletaExterna','resgate','posteCentral','poste','giro','bumper','alvoFixo','bancoDeQueda','chefe','guardiao'].includes(x)).join(',')); }
