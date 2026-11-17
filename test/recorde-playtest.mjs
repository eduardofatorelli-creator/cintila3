// Playtest R06.2 · uma partida NORMAL no playtest grava recorde e partidas no prefixo isolado (cintila3.playtest.*),
// nunca nas chaves oficiais (cintila3.*); e a mestria/recorde aparecem na galeria.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(process.env.BASE_URL || 'http://localhost:4048/'); await p.waitForFunction(() => !!window.__cintila); await p.evaluate(() => localStorage.clear());
await p.evaluate(() => { const C = window.__cintila; C.loadMachine('abissal'); C.pulaIntro(); const J = C.jogo; J.lancar(1); for (let i = 0; i < 200; i++) C.step(); J.pontos = 777777; J.estado = 'jogo'; J.salva = 0; J.bola = 3; J.extras = 0; for (const x of J.mesa.bolas) { x.preso = false; x.trilho = undefined; x.x = 190; x.y = 790; } J.fila = 0; });
await p.waitForFunction(() => (document.querySelector('#ui')?.textContent || '').includes('FIM DE JOGO'), null, { timeout: 45000 });
const k = await p.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(x => [x, localStorage.getItem(x)])));
const ok = k['cintila3.playtest.recorde.abissal'] === '777777' && k['cintila3.playtest.partidas'] === '1' && !Object.keys(k).some(x => x.startsWith('cintila3.') && !x.startsWith('cintila3.playtest.'));
console.log(ok ? 'RECORDE PLAYTEST OK: gravado só em cintila3.playtest.*' : 'FALHA ' + JSON.stringify(k));
await b.close(); process.exit(ok ? 0 : 1);
