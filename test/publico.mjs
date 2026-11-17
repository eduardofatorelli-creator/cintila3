// Playtest R06.2 · fumaça na URL PÚBLICA, em contexto anônimo (sem cookies da Vercel), só pela interface:
// abre sem login, 30 máquinas livres, seleção, partida normal com controles, laboratório, áudio, noindex, celular.
import { chromium } from 'playwright';
const URL = process.argv[2] || 'https://cintila3-playtest.vercel.app/';
const b = await chromium.launch({ channel: 'chrome' }); let falhas = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) falhas++; };
const res = await fetch(URL); ok(res.status === 200 && !res.url.includes('vercel.com/login'), `abre sem login: HTTP ${res.status} ${res.url}`);
ok((res.headers.get('x-robots-tag') || '').includes('noindex'), 'cabeçalho X-Robots-Tag: ' + res.headers.get('x-robots-tag'));
const html = await res.text(); ok(html.includes('noindex'), 'meta robots noindex na página');
ok((await (await fetch(new globalThis.URL('robots.txt', URL))).text()).includes('Disallow: /'), 'robots.txt bloqueia indexação');
for (const [nome, w, h] of [['desktop', 1366, 768], ['celular', 390, 844], ['celular-pequeno', 360, 640]]) {
  const toque = w < 800, ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.addInitScript(() => { const O = window.AudioContext; window.__ctxs = []; window.AudioContext = class extends O { constructor(...a) { super(...a); window.__ctxs.push(this); } }; });
  await p.goto(URL); await p.waitForSelector('.cartao', { timeout: 30000 });
  const c = await p.evaluate(() => [document.querySelectorAll('.cartao').length, document.querySelectorAll('.cartao.tranca').length, document.querySelector('.teste')?.textContent.includes('30 MÁQUINAS'), document.querySelector('.versao')?.textContent || '', '__cintila' in window]);
  ok(c[0] === 30 && c[1] === 0 && c[2], `${nome}: 30 máquinas, nenhuma bloqueada, aviso de testes (${c[3]})`);
  ok(!c[4], `${nome}: build de produção sem ganchos de desenvolvedor`);
  // seleciona a máquina 17 direto e joga
  await p.locator('.cartao').nth(16).click(); await p.waitForTimeout(150);
  const sel = await p.evaluate(() => document.querySelector('.vitrine h2')?.textContent); ok(sel === 'TEMPESTADE', `${nome}: máquina 17 selecionável (${sel})`);
  await p.getByRole('button', { name: '▶ JOGAR' }).click(); await p.waitForTimeout(1500);
  const audio = await p.evaluate(() => window.__ctxs.map(x => x.state)); ok(audio.includes('running'), `${nome}: áudio ativado após o toque/clique (${audio})`);
  // lançar e palhetas com entrada real
  if (toque) { const cdp = await ctx.newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: w * 0.85, y: h * 0.6, id: 1 }] }); await p.waitForTimeout(800); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); for (let i = 0; i < 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: i % 2 ? w * 0.2 : w * 0.8, y: h * 0.75, id: 2 }] }); await p.waitForTimeout(140); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(200); } }
  else { await p.keyboard.press('Space'); await p.waitForTimeout(200); await p.keyboard.down('Space'); await p.waitForTimeout(800); await p.keyboard.up('Space'); for (let i = 0; i < 6; i++) { await p.keyboard.press(i % 2 ? 'KeyZ' : 'KeyM', { delay: 140 }); await p.waitForTimeout(200); } }
  await p.screenshot({ path: `test-results/publico-${nome}.png` });
  const pausa = p.locator('button[aria-label="Pausar"]'); ok(await pausa.isVisible(), `${nome}: botão de pausa na tela`);
  await pausa.click(); await p.waitForFunction(() => (document.querySelector('#ui')?.textContent || '').includes('PAUSA'));
  ok(await p.getByRole('button', { name: /MÚSICA/ }).isVisible(), `${nome}: controles de som na pausa`);
  await p.getByText('SAIR PARA O MAPA').click(); await p.waitForSelector('.cartao');
  // laboratório: chefão e modo mago
  await p.getByRole('button', { name: /TESTAR RECURSOS/ }).click(); await p.waitForSelector('.labs');
  await p.locator('.labs .bt').filter({ hasText: 'Modo mago' }).first().click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `test-results/publico-${nome}-mago.png` });
  await pausa.click(); await p.waitForFunction(() => (document.querySelector('#ui')?.textContent || '').includes('PAUSA'));
  ok((await p.evaluate(() => document.querySelector('#ui').textContent)).includes('Demonstração'), `${nome}: laboratório abriu partida de demonstração (modo mago)`);
  await p.locator('.labs .bt').filter({ hasText: 'Confronto com o chefe' }).first().click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: `test-results/publico-${nome}-chefao.png` });
  const chaves = await p.evaluate(() => Object.keys(localStorage)); ok(chaves.every(k => !k.startsWith('cintila3.') || k.startsWith('cintila3.playtest.')), `${nome}: armazenamento isolado (${chaves.length} chaves)`);
  ok(erros.length === 0, `${nome}: 0 erros de console ${erros.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
console.log(falhas ? falhas + ' FALHA(S)' : 'URL PÚBLICA OK: ' + URL); await b.close(); process.exit(falhas ? 1 : 0);
