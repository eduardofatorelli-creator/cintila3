// R06 · Capturas de jogo intenso nas 30 máquinas: modo mago + multibola (3 bolas) + chefe na última vida +
// letreiro de jackpot + acertos simultâneos. Serve para conferir legibilidade e sobreposição de efeitos.
// Uso: node test/intenso.mjs [largura altura] [pasta]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [w, h] = [+(process.argv[2] || 1440), +(process.argv[3] || 900)], pasta = 'evidencias/visual-r06/' + (process.argv[4] || 'intenso'), toque = w < 800;
mkdirSync(pasta, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' }), ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque }), p = await ctx.newPage(), erros = [];
p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.addInitScript(() => { try { localStorage.setItem('cintila3.desbloqueadas', '30'); localStorage.setItem('cintila3.prefs', JSON.stringify({ som: false, musica: false, narrador: false })); } catch {} });
await p.goto(process.env.BASE_URL || 'http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila);
const ids = await p.evaluate(async () => (await import('/src/machines/index.ts')).MAQUINAS.map(m => m.n + '-' + m.id));
for (const nid of ids.filter(x => !process.env.SO || process.env.SO.split(',').includes(x.replace(/^\d+-/, '')))) {
  const id = nid.replace(/^\d+-/, '');
  await p.evaluate(id => {
    const C = window.__cintila; C.loadMachine(id); C.pulaIntro(); const J = C.jogo; if (J.escolha) J.escolher(0); J.lancar(0.9); for (let i = 0; i < 200; i++) C.step();
    J.iniciaMago(); J.multibola = true; J.adicionaBola(2); for (let i = 0; i < 90; i++) C.step();
    J.m.chefe.vida = 1; J.m.chefe.imune = 0; const b0 = J.mesa.bolas[0]; J.ev('bumper', b0, J.m.bumpers[0]); J.ev('bumper', b0, J.m.bumpers[1]); J.ev('chefe', b0, J.m.chefe); J.anuncia('jackpot', 'JACKPOT');
  }, id);
  await p.waitForTimeout(260); await p.screenshot({ path: `${pasta}/${w}x${h}-${nid.padStart(5, '0')}.png` });
}
console.log(erros.length ? 'ERROS: ' + erros.slice(0, 4).join(' | ') : '0 erros'); await b.close();
