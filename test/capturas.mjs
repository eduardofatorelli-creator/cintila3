// Visual R04: capturas de referência por viewport e por estado (mapa, mesas-piloto, chefe, andar, transição, resultado).
// Uso: node test/capturas.mjs <pasta> [todas]   (dev server ligado em 4040). Com "todas", fotografa também as 30 mesas em 1440x900 e 390x844.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const URL = process.env.BASE_URL || 'http://localhost:4040/';
const pasta = 'evidencias/visual-r04/' + (process.argv[2] || 'antes'); mkdirSync(pasta, { recursive: true });
const todas = process.argv[3] === 'todas';
const VPS = [[1920, 1080], [1440, 900], [768, 1024], [390, 844], [360, 800]];
const b = await chromium.launch({ channel: 'chrome' });
const erros = [];
async function pagina(w, h) {
  const toque = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque });
  const p = await ctx.newPage();
  p.on("pageerror", e => erros.push(`${w}x${h} pageerror: ${e.stack || e}`)); p.on('console', m => { if (m.type() === 'error') erros.push(`${w}x${h} console: ${m.text()}`); });
  await p.addInitScript(() => { try { localStorage.setItem('cintila3.desbloqueadas', '30'); localStorage.setItem('cintila3.prefs', JSON.stringify({ som: false, musica: false, narrador: false, canhoto: false, intro: true })); } catch {} });
  await p.goto(URL); await p.waitForFunction(() => !!window.__cintila); await p.waitForTimeout(900);
  return [p, ctx];
}
const joga = (p, id) => p.evaluate(id => { const C = window.__cintila; C.loadMachine(id); C.pulaIntro?.(); const J = C.jogo; for (let i = 0; i < 400 && J.escolha; i++) C.step(); J.lancar(0.9); for (let i = 0; i < 260; i++) C.step(); }, id);
for (const [w, h] of VPS.filter(v => !process.env.SO || process.env.SO === v.join('x'))) {
  const [p, ctx] = await pagina(w, h), n = `${w}x${h}`;
  await p.screenshot({ path: `${pasta}/${n}-mapa.png` });
  for (const id of ['aurora', 'abissal', 'cidade-neon']) { await joga(p, id); await p.waitForTimeout(500); await p.screenshot({ path: `${pasta}/${n}-mesa-${id}.png` }); }
  // transição para o andar de cima (meio da descida) e o andar já aberto
  await joga(p, 'aurora'); await p.evaluate(() => window.__cintila.enterUpper('chefao')); await p.waitForTimeout(650);
  await p.screenshot({ path: `${pasta}/${n}-transicao.png` });
  await p.waitForTimeout(2600); await p.screenshot({ path: `${pasta}/${n}-chefao.png` });
  await p.reload(); await p.waitForFunction(() => !!window.__cintila); await p.waitForTimeout(500);
  await joga(p, 'abissal'); await p.evaluate(() => { const C = window.__cintila; C.enterUpper('bonus'); for (let i = 0; i < 400; i++) C.step(); });
  await p.waitForTimeout(400); await p.screenshot({ path: `${pasta}/${n}-andar.png` });
  // chefe na mesa principal com 1 de vida (luz vermelha) e modo mago
  await joga(p, 'cidade-neon'); await p.evaluate(() => { const C = window.__cintila, J = C.jogo; J.m.chefe.vida = 1; J.ev('chefe', J.mesa.bolas[0], J.m.chefe); });
  await p.waitForTimeout(300); await p.screenshot({ path: `${pasta}/${n}-chefe-mesa.png` });
  await p.evaluate(() => window.__cintila.mago()); await p.waitForTimeout(900); await p.screenshot({ path: `${pasta}/${n}-mago.png` });
  // resultado
  await p.evaluate(() => { const C = window.__cintila, J = C.jogo; J.mago = false; J.estado = 'jogo'; J.salva = 0; J.bola = 3; J.extras = 0; for (const x of J.mesa.bolas) { x.preso = false; x.trilho = undefined; x.x = 190; x.y = 790; } J.fila = 0; });
  await p.waitForTimeout(8000); await p.screenshot({ path: `${pasta}/${n}-resultado.png` });
  await ctx.close(); console.log('ok', n);
}
if (todas) for (const [w, h] of [[1440, 900], [390, 844]]) {
  const [p, ctx] = await pagina(w, h);
  const ids = await p.evaluate(async () => (await import('/src/machines/index.ts')).MAQUINAS.map(m => m.n + '-' + m.id));
  for (const nid of ids) { const id = nid.replace(/^\d+-/, ''); await joga(p, id); await p.waitForTimeout(250); await p.screenshot({ path: `${pasta}/maquinas-${w}x${h}-${nid.padStart(5, '0')}.png` }); }
  await ctx.close(); console.log('ok 30 máquinas', w, h);
}
console.log(erros.length ? 'ERROS:\n' + erros.slice(0, 20).join('\n') : '0 erros de console');
await b.close();
