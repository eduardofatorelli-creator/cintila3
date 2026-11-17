import { Game } from '../src/game/rules';
import { porId } from '../src/machines';
const J = new Game(porId(process.argv[2] || 'aurora'), 'normal', 0, 1);
const r = (n: number) => Math.round(n);
console.log('PECAS', JSON.stringify(J.mesa.pecas.map((p: any) => [p.tipo, r(p.x ?? -1), r(p.y), p.r ?? p.raio ?? '', p.rotulo ?? ''])));
console.log('SEGS', JSON.stringify(J.mesa.segs.filter(s => !s.invisivel).map(s => [r(s.ax), r(s.ay), r(s.bx), r(s.by), s.tipo || '', s.cor || '', s.z ?? ''])));
console.log('CIRCS', JSON.stringify(J.mesa.circs.filter((c: any) => !c.dono).map((c: any) => [r(c.x), r(c.y), c.r])));
console.log('PAS', JSON.stringify(J.mesa.pas.map(p => [r(p.px), r(p.py), r(p.tx), r(p.ty)])));
