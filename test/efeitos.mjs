// Visual R04: foto do instante de cada efeito-assinatura dos pilotos (constelação, cano da Boca, perseguição).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const pasta = 'evidencias/visual-r04/efeitos'; mkdirSync(pasta, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), erros = [];
p.on('pageerror', e => erros.push(String(e.stack || e)));
await p.goto('http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila);
const casos = {
  aurora: J => { const a = J.mesa.pecas.find(q => q.tipo === 'alvoFixo' && q.vale === 1); J.ev('alvo', J.mesa.bolas[0], a); },
  abissal: J => { const bc = J.mesa.pecas.find(q => q.tipo === 'bocaQueEngole'); J.ev('cano', J.mesa.bolas[0], { peca: bc, i: 0 }); J.ev('bumper', J.mesa.bolas[0], J.m.bumpers[0]); },
  'cidade-neon': J => { const g = J.mesa.pecas.find(q => q.tipo === 'alvoGiratorio'); J.ev('giratorio', J.mesa.bolas[0], { peca: g, c: g.cs[0], quebrou: false, x: g.cs[0].x, y: g.cs[0].y }); J.ev('bumper', J.mesa.bolas[0], J.m.bumpers[1]); },
};
for (const [id, f] of Object.entries(casos)) {
  await p.evaluate(([id, f]) => { const C = window.__cintila; C.loadMachine(id); C.pulaIntro(); const J = C.jogo; J.lancar(0.9); for (let i = 0; i < 200; i++) C.step(); (0, eval)('(' + f + ')')(J); }, [id, f.toString()]);
  await p.waitForTimeout(180); await p.screenshot({ path: `${pasta}/${id}.png`, clip: { x: 420, y: 230, width: 600, height: 670 } });
}
console.log(erros.length ? erros.join('\n') : '0 erros'); await b.close();
