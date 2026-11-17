// Item 4: tempo de quadro em aparelho de toque com a CPU estrangulada (Emulation.setCPUThrottlingRate).
// Aprovado com mediana abaixo de 20 ms a 4x e abaixo de 33 ms a 6x.
import { chromium } from 'playwright';
const url = process.env.BASE_URL || 'http://localhost:4040/';
const semGpu = process.env.SEM_GPU === '1';
const b = await chromium.launch({ channel: 'chrome', headless: process.argv[2] !== 'tela', args: semGpu ? ['--disable-gpu', '--disable-gpu-rasterization', '--disable-accelerated-2d-canvas'] : [] });
let ok = true;
for (const taxa of [1, 4, 6]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await p.goto(url); await p.waitForSelector('.cartao'); await p.getByText('▶ JOGAR').tap(); await p.waitForTimeout(800);
  if (process.env.SEM_ETAPAS) await p.evaluate(l => { for (const k of l.split(',')) { window.__cintila.sem[k] = true; window.__cintila.semEtapa[k] = true; } }, process.env.SEM_ETAPAS);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: taxa });
  // lança a bola e joga: toques alternados nas duas metades enquanto mede o intervalo entre quadros
  await p.touchscreen.tap(330, 600); await p.keyboard.down('Space'); await p.waitForTimeout(700); await p.keyboard.up('Space');
  const medida = p.evaluate(() => new Promise(fim => { const ts = []; let u = performance.now(); const f = t => { ts.push(t - u); u = t; if (ts.length < 420) requestAnimationFrame(f); else { ts.splice(0, 60); ts.sort((a, b) => a - b); fim({ mediana: +ts[ts.length >> 1].toFixed(1), p95: +ts[Math.floor(ts.length * 0.95)].toFixed(1), tela: [document.getElementById('tela').width, document.getElementById('tela').height] }); } }; requestAnimationFrame(f); }));
  for (let i = 0; i < 10; i++) { await p.keyboard.press(i % 2 ? 'KeyZ' : 'KeyM', { delay: 120 }); await p.waitForTimeout(250); }
  const m = await medida; const lim = taxa === 4 ? 20 : taxa === 6 ? 33 : 17.5, passou = m.mediana < lim; if (taxa > 1 && !passou) ok = false;
  console.log(`CPU ${taxa}x: mediana ${m.mediana} ms (${(1000 / m.mediana).toFixed(0)} fps), p95 ${m.p95} ms, canvas ${m.tela.join('x')} ${taxa > 1 ? (passou ? 'APROVADO' : 'REPROVADO') : ''}`);
  await ctx.close();
}
await b.close(); process.exit(ok ? 0 : 1);
