// Mede quanto cada etapa do desenho custa, em renderização por software com CPU 6x.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu', '--disable-gpu-rasterization', '--disable-accelerated-2d-canvas'] });
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await p.goto('http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila);
await p.evaluate(() => { const C = window.__cintila; C.loadMachine('aurora'); C.jogo.lancar(1); });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
const mede = () => p.evaluate(() => new Promise(fim => { const ts = []; let u = performance.now(); const f = t => { ts.push(t - u); u = t; if (ts.length < 90) requestAnimationFrame(f); else { ts.splice(0, 20); fim(+(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(1)); } }; requestAnimationFrame(f); }));
console.log('tudo ligado:', await mede(), 'ms');
for (const [onde, chave] of [['sem', 'gabinete'], ['sem', 'caixa'], ['sem', 'mesa'], ['semEtapa', 'base'], ['semEtapa', 'luzes'], ['semEtapa', 'pecas']]) {
  await p.evaluate(([o, k]) => { window.__cintila[o][k] = true; }, [onde, chave]); const m = await mede();
  await p.evaluate(([o, k]) => { window.__cintila[o][k] = false; }, [onde, chave]); console.log(`sem ${chave}:`, m, 'ms');
}
await p.evaluate(() => { const C = window.__cintila; C.sem.gabinete = C.sem.caixa = C.sem.mesa = true; }); console.log('sem os três (só laço e botões):', await mede(), 'ms');
await b.close();
