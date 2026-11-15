// Captura telas do jogo rodando (usa o Chrome instalado).
import { chromium } from 'playwright';
const [, , id = 'aurora', saida = 'foto', acao = '', w = '1280', h = '800', seg = '6'] = process.argv;
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const erros = []; p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto('http://localhost:4040/'); await p.waitForTimeout(1200);
if (id !== 'menu') {
  await p.evaluate(([id, acao, seg]) => {
    const C = window.__cintila; C.loadMachine(id); const J = C.jogo;
    J.lancar(0.8); for (let i = 0; i < 120 * +seg; i++) { if (i % 37 === 0) { J.setFlip(0, i % 74 === 0); J.setFlip(1, i % 74 !== 0); } C.step(); }
    if (acao === 'andar') C.enterUpper(); else if (acao === 'mago') C.mago(); else if (acao && acao !== 'x') C.enterArena(acao);
  }, [id, acao, seg]);
  await p.waitForTimeout(acao ? 2600 : 900);
}
await p.screenshot({ path: `test-results/${saida}.png` });
console.log(erros.length ? 'ERROS: ' + erros.slice(0, 5).join(' | ') : 'sem erros');
await b.close();
