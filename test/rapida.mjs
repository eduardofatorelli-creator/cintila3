// Visual R04: foto rápida de algumas máquinas num viewport. Uso: node test/rapida.mjs 1440x900 aurora,abissal [pasta]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [w, h] = (process.argv[2] || '1440x900').split('x').map(Number), ids = (process.argv[3] || 'aurora,abissal,cidade-neon').split(','), pasta = 'evidencias/visual-r04/' + (process.argv[4] || 'rapida');
mkdirSync(pasta, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' }), toque = w < 800;
const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque })).newPage();
const erros = []; p.on('pageerror', e => erros.push(String(e.stack || e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.addInitScript(() => { try { localStorage.setItem('cintila3.desbloqueadas', '30'); localStorage.setItem('cintila3.prefs', JSON.stringify({ som: false, musica: false, narrador: false })); } catch {} });
await p.goto(process.env.BASE_URL || 'http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila); await p.waitForTimeout(600);
if (ids[0] === 'mapa') { await p.screenshot({ path: `${pasta}/${w}x${h}-mapa.png` }); ids.shift(); }
for (const id of ids) {
  const [nome, extra] = id.split(':');
  await p.evaluate(([id, extra]) => { const C = window.__cintila; C.loadMachine(id); if (extra !== 'intro') C.pulaIntro(); const J = C.jogo; for (let i = 0; i < 400 && J.escolha; i++) C.step(); if (extra !== 'intro') { J.lancar(0.9); for (let i = 0; i < 300; i++) C.step(); } if (extra === 'mago') C.mago(); if (extra === 'chefao') C.enterUpper('chefao'); if (extra === 'bonus') C.enterUpper('bonus'); if (extra === 'tunel') C.enterUpper('tunel'); }, [nome, extra]);
  await p.waitForTimeout(extra === 'intro' ? 1200 : extra === 'trans' ? 0 : extra ? 2600 : 700);
  if (extra === 'trans') { await p.evaluate(() => window.__cintila.enterUpper('chefao')); await p.waitForTimeout(700); }
  await p.screenshot({ path: `${pasta}/${w}x${h}-${nome}${extra ? '-' + extra : ''}.png` });
}
console.log(erros.length ? 'ERROS:\n' + erros.slice(0, 8).join('\n') : '0 erros');
await b.close();
