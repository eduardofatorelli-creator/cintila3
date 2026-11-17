// Visual R04 · varredura das 30 máquinas no navegador (dev server ligado em 4040).
// 1) cada máquina carrega com a camada nova sem erro; 2) a bola continua legível sobre a arte em três pontos da mesa,
// no estado normal e nos momentos mais intensos (modo mago + multibola + chefe na última vida + letreiro);
// 3) o mapa não abre máquina bloqueada. Uso: node test/visual.mjs [largura altura]
import { chromium } from 'playwright';
const URL = process.env.BASE_URL || 'http://localhost:4040/';
const [w, h] = [+(process.argv[2] || 1440), +(process.argv[3] || 900)], toque = w < 800;
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque });
const p = await ctx.newPage(); const erros = [];
p.on('pageerror', e => erros.push('pageerror: ' + (e.stack || e))); p.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
await p.addInitScript(() => { try { if (!sessionStorage.getItem('ja')) { localStorage.clear(); localStorage.setItem('cintila3.prefs', JSON.stringify({ som: false, musica: false, narrador: false })); sessionStorage.setItem('ja', '1'); } } catch {} });
await p.goto(URL); await p.waitForFunction(() => !!window.__cintila);
const ids = await p.evaluate(async () => (await import('/src/machines/index.ts')).MAQUINAS.map(m => m.id));
let falhas = 0; const ok = (c, m) => { if (!c) { falhas++; console.log('FALHA:', m); } };
const PONTOS = [[190, 470], [190, 395], [160, 530], [200, 690]]; // pontos livres de peças em todas as disposições
const piores = [];
for (const id of ids) {
  const r = await p.evaluate(async ([id, PONTOS]) => {
    const C = window.__cintila; C.loadMachine(id); C.pulaIntro(); const J = C.jogo;
    for (let i = 0; i < 400 && J.escolha; i++) C.step(); if (J.escolha) J.escolher(0); J.lancar(0.9); for (let i = 0; i < 200; i++) C.step();
    C.stopLoop(); const tela = document.getElementById('tela'), g = tela.getContext('2d', { willReadFrequently: true });
    const lum = (x, y) => { const d = g.getImageData(Math.round(x) - 1, Math.round(y) - 1, 3, 3).data; let s = 0; for (let i = 0; i < 36; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; return s / 9; };
    const mede = () => {
      const out = []; const b = J.mesa.bolas[0];
      for (const [x, y] of PONTOS) {
        b.x = x; b.y = y; b.z = 0; b.vx = b.vy = 0; b.preso = true; b.trilho = undefined; b.rastro.length = 0;
        C.desenhaJa(); const q = C.bolaNaTela(); const centro = lum(q.x - q.r * 0.2, q.y - q.r * 0.2);
        let anel = 0; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; anel += lum(q.x + Math.cos(a) * q.r * 2.4, q.y + Math.sin(a) * q.r * 2.4); } anel /= 8;
        out.push({ centro: Math.round(centro), fundo: Math.round(anel), razao: +((centro + 12) / (anel + 12)).toFixed(2) });
      }
      return out;
    };
    const normal = mede();
    // momento mais intenso: modo mago + multibola + chefe por um golpe + letreiro e clarão ativos
    J.iniciaMago(); J.multibola = true; J.m.chefe.vida = 1; J.ev('chefe', J.mesa.bolas[0], J.m.chefe); C.apres.observa([{ tipo: 'mago', texto: J.def.mago.nome, d: {} }], J.cores);
    for (let i = 0; i < 30; i++) C.efeitos.passo(1 / 60);
    const intenso = mede();
    return { normal, intenso, tex: !!J.mesa, nan: J.stats.nan };
  }, [id, PONTOS]);
  const todos = [...r.normal, ...r.intenso], pior = todos.reduce((a, x) => (x.razao < a.razao ? x : a));
  piores.push([id, pior.razao, pior.centro, pior.fundo]);
  // a bola é cromada (centro claro): legível se o centro for claro OU se destacar do fundo em volta
  ok(todos.every(x => x.centro >= 150 || x.razao >= 1.8), id + ' bola pouco legível ' + JSON.stringify(r));
  ok(r.nan === 0, id + ' NaN');
  await p.reload(); await p.waitForFunction(() => !!window.__cintila);
}
piores.sort((a, b) => a[1] - b[1]);
console.log('bola: as 5 piores razões centro/fundo [máquina, razão, centro, fundo]:', JSON.stringify(piores.slice(0, 5)));
// o mapa não abre máquina bloqueada
await p.evaluate(() => { localStorage.setItem('cintila3.desbloqueadas', '3'); }); await p.reload(); await p.waitForSelector('.cartao');
const bloq = await p.evaluate(() => [document.querySelectorAll('.cartao').length, document.querySelectorAll('.cartao.tranca').length]);
ok(bloq[0] === 30 && bloq[1] === 27, 'cartões e trancas ' + bloq);
await p.locator('.cartao.tranca').nth(0).click({ force: true }); await p.waitForTimeout(400);
const est = await p.evaluate(() => [window.__cintila.estado, !!document.querySelector('.vitrine')]);
ok(est[0] === 'menu' && est[1], 'clicar numa bloqueada não inicia partida ' + est);
await p.locator('.cartao:not(.tranca)').nth(0).click(); await p.waitForTimeout(200); await p.locator('.cartao.sel').click(); await p.waitForTimeout(500);
const jogo = await p.evaluate(() => [window.__cintila.estado, window.__cintila.jogo?.def.id]);
ok(jogo[0] === 'jogo' && jogo[1] === 'aurora', 'cartão liberado inicia a máquina ' + jogo);
ok(erros.length === 0, 'erros de console: ' + erros.slice(0, 3).join(' | '));
console.log(falhas ? `${falhas} FALHA(S)` : `VISUAL OK em ${w}x${h}: 30 máquinas, bola legível em 8 situações cada, mapa respeita bloqueio, 0 erros`);
await b.close(); process.exit(falhas ? 1 : 0);
