// R05 · comparação R04 × R05 nas mesmas condições: mesma máquina (Aurora), mesmo viewport, partida real
// (lança com Espaço e joga com as palhetas por alguns segundos) e tempo de quadro.
// Uso: node test/comparar.mjs <urlR04> <urlR05> [pasta]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [U4, U5] = [process.argv[2] || 'http://localhost:4045/', process.argv[3] || 'http://localhost:4040/'];
const pasta = 'evidencias/visual-r05/' + (process.argv[4] || 'comparacao'); mkdirSync(pasta, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' }); const res = {};
for (const [vp, w, h] of [['desktop', 1440, 900], ['desktop-1920', 1920, 1080], ['celular', 390, 844]].filter(v => !process.env.SO || process.env.SO === v[0])) for (const [nome, url] of [['r04', U4], ['r05', U5]].filter(v => !process.env.VER || process.env.VER === v[0])) {
  const toque = w < 800, ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.addInitScript(() => { try { localStorage.setItem('cintila3.prefs', JSON.stringify({ som: false, musica: false, narrador: false, curtas: true })); } catch {} });
  await p.goto(url); await p.waitForSelector('.cartao'); await p.getByText('▶ JOGAR').first().click(); await p.waitForTimeout(900);
  await p.evaluate(() => window.__cintila.pulaIntro?.());
  // partida real: puxa a mola e joga
  await p.keyboard.down('Space'); await p.waitForTimeout(700); await p.keyboard.up('Space');
  for (let i = 0; i < 9; i++) { await p.keyboard.down(i % 2 ? 'KeyZ' : 'KeyM'); await p.waitForTimeout(140); await p.keyboard.up(i % 2 ? 'KeyZ' : 'KeyM'); await p.waitForTimeout(260); }
  await p.screenshot({ path: `${pasta}/${vp}-${nome}-partida.png` });
  // mesmo estado controlado: bola parada no centro, chefe e luzes iguais
  await p.evaluate(() => { const C = window.__cintila, J = C.jogo, B = J.mesa.bolas[0]; if (B) { B.x = 196; B.y = 520; B.vx = 60; B.vy = -40; } J.estado = 'jogo'; });
  await p.waitForTimeout(120); await p.screenshot({ path: `${pasta}/${vp}-${nome}-estado.png` });
  const cad = await p.evaluate(async () => { const ts = []; let u = performance.now(); await new Promise(f => { const g = t => { ts.push(t - u); u = t; if (ts.length < 240) requestAnimationFrame(g); else f(); }; requestAnimationFrame(g); }); ts.splice(0, 20); ts.sort((a, b) => a - b); return { mediana: +ts[ts.length >> 1].toFixed(1), p95: +ts[Math.floor(ts.length * 0.95)].toFixed(1) }; });
  const scr = toque ? 'não medido (o gancho medeQuadros derruba a aba em emulação móvel, também na R04)' : await p.evaluate(() => { const r = window.__cintila.medeQuadros(600); return { mediana: +r.mediana.toFixed(2), p95: +r.p95.toFixed(2) }; });
  res[vp + '-' + nome] = { cadencia: cad, scriptAurora4bolas300part: scr, erros: erros.length };
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1)); await b.close();
