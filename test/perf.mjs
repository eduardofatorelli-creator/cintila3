// Seção 12.4: tempo de quadro. Mede o tempo de script por quadro (física + desenho) e a cadência real do laço.
import { chromium } from 'playwright';
const tela = process.argv[2] === 'tela';
const b = await chromium.launch({ channel: 'chrome', headless: !tela, args: ['--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +(process.argv[3] || 1280), height: +(process.argv[4] || 800) } });
await p.goto(process.env.BASE_URL || 'http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila);
const cad = await p.evaluate(async () => {
  const C = window.__cintila; C.loadMachine('feira'); const J = C.jogo; J.lancar(1);
  const ts = []; let u = performance.now();
  await new Promise(fim => { const f = t => { ts.push(t - u); u = t; if (ts.length < 400) requestAnimationFrame(f); else fim(); }; requestAnimationFrame(f); });
  ts.splice(0, 40); ts.sort((a, b) => a - b); return { mediana: ts[ts.length >> 1], p95: ts[Math.floor(ts.length * 0.95)] };
});
const scr = await p.evaluate(() => window.__cintila.medeQuadros(2000));
console.log('cadência real do laço (ms entre quadros):', JSON.stringify(cad));
console.log('tempo de script por quadro, 4 bolas e 300 partículas (ms):', JSON.stringify(scr));
await b.close();
