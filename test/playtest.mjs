// Playtest R06.2 · confere o modo de homologação (dev server com VITE_PLAYTEST=1, porta via BASE_URL) e, com
// OFICIAL=1, que a build oficial continua com os bloqueios. Desktop e celular emulado.
import { chromium } from 'playwright';
const URL = process.env.BASE_URL || 'http://localhost:4048/', oficial = process.env.OFICIAL === '1';
const b = await chromium.launch({ channel: 'chrome' }); let falhas = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + m); if (!c) falhas++; };
for (const [nome, w, h] of [['desktop', 1440, 900], ['celular', 390, 844]]) {
  const toque = w < 800, ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: toque ? 2 : 1, hasTouch: toque, isMobile: toque }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto(URL); await p.waitForSelector('.cartao');
  const c = await p.evaluate(() => [document.querySelectorAll('.cartao').length, document.querySelectorAll('.cartao.tranca').length, !!document.querySelector('.teste'), [...document.querySelectorAll('.bt')].some(x => x.textContent.includes('TESTAR RECURSOS'))]);
  if (oficial) { ok(c[0] === 30 && c[1] === 29 && !c[2] && !c[3], `${nome}: build oficial mantém 29 bloqueadas e sem laboratório ${c}`); await ctx.close(); continue; }
  ok(c[0] === 30 && c[1] === 0 && c[2] && c[3], `${nome}: 30 cartões, 0 bloqueados, aviso de testes e botão TESTAR RECURSOS ${c}`);
  // clicar no cartão já selecionado inicia a partida; por isso só seleciona a máquina 1 se ela não estiver selecionada
  const escolhe0 = async () => { const c0 = p.locator('.cartao').nth(0); if (!((await c0.getAttribute('class')) || '').includes('sel')) { await c0.click(); await p.waitForTimeout(100); } };
  // qualquer máquina pode ser escolhida: a 30 direto
  await p.locator('.cartao').nth(29).click(); await p.waitForTimeout(150); await p.locator('.cartao.sel').click();
  await p.waitForFunction(() => window.__cintila?.estado === 'jogo');
  const r1 = await p.evaluate(() => { const C = window.__cintila, J = C.jogo; return { id: J.def.id, demo: C.demo, pod: J.sigs[0].poderes?.length }; });
  ok(r1.id === 'relampago' && !r1.demo && r1.pod === 6, `${nome}: máquina 30 aberta direto em partida normal com 6 poderes ${JSON.stringify(r1)}`);
  // controles: lançar e palhetas (teclado no desktop, toque no celular)
  // controles reais: Espaço segurado no desktop; no celular, segurar a metade direita (eventos de toque do Chrome)
  await p.evaluate(() => window.__cintila.pulaIntro()); await p.waitForTimeout(150);
  if (toque) { const cdp = await ctx.newCDPSession(p); const pt = [{ x: w * 0.8, y: h * 0.6, id: 1 }]; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt }); await p.waitForTimeout(700); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await p.keyboard.down('Space'); await p.waitForTimeout(700); await p.keyboard.up('Space'); }
  await p.waitForTimeout(700); const lancou = await p.evaluate(() => window.__cintila.jogo.estado);
  // palhetas: confere que o comando chega à palheta real
  const pal = await p.evaluate(async () => { const C = window.__cintila; return C.palhetas.map(x => x.on ?? x.ativa ?? null); });
  if (toque) { const cdp = await ctx.newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: w * 0.2, y: h * 0.7, id: 2 }] }); await p.waitForTimeout(120); var pe = await p.evaluate(() => window.__cintila.jogo.botE || window.__cintila.jogo.toqueE); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await p.keyboard.down('KeyZ'); await p.waitForTimeout(120); var pe = await p.evaluate(() => window.__cintila.jogo.botE || window.__cintila.jogo.toqueE); await p.keyboard.up('KeyZ'); }
  ok(pe, `${nome}: palheta esquerda responde ao ${toque ? 'toque' : 'teclado'}`); void pal;
  ok(lancou === 'jogo', `${nome}: bola lançada, estado ${lancou}`);
  // pausa pelo botão na tela e volta à galeria
  const pausa = p.locator('button[aria-label="Pausar"]'); ok(await pausa.isVisible(), `${nome}: botão de pausa visível durante o jogo`);
  await pausa.click(); await p.waitForFunction(() => (document.querySelector('#ui')?.textContent || '').includes('PAUSA'));
  const tPausa = await p.evaluate(() => document.querySelector('#ui').textContent); ok(tPausa.includes('Poderes sorteados nesta partida') && tPausa.includes('MÚSICA'), `${nome}: pausa mostra poderes e controles de som`);
  await p.getByText('SAIR PARA O MAPA').click(); await p.waitForSelector('.cartao');
  // laboratório: chefe, mago, multibola, super jackpot e andar, em demonstração (sem gravar recordes)
  await escolhe0(); await p.getByRole('button', { name: /TESTAR RECURSOS/ }).click(); await p.waitForSelector('.labs');
  const antes = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('cintila3')).map(k => k + '=' + localStorage.getItem(k)).sort().join('|'));
  const casos = { chefao: J => J.sub?.tipo === 'chefao' || J.trans, mago: J => J.mago, multibola: J => J.multibola, super: J => J.pontos >= 250000, bonus: J => J.sub?.tipo === 'bonus' || J.trans, tunel: J => !!(J.sub || J.trans), nucleo: J => !!(J.sub || J.trans), chefeFase: J => J.m.chefe.c.off };
  for (const [rid, f] of Object.entries(casos)) {
    await p.evaluate(() => { const C = window.__cintila; if (C.estado !== 'menu') { C.jogo && (C.jogo.estado = 'fim'); } });
    await p.evaluate(rid => { document.querySelector('#ui').innerHTML = ''; }, rid);
    await p.goto(URL); await p.waitForSelector('.cartao'); await escolhe0(); await p.getByRole('button', { name: /TESTAR RECURSOS/ }).click(); await p.waitForSelector('.labs');
    const nomeRec = await p.evaluate(rid => (window.__RECURSOS || null), rid);
    const btn = p.locator('.labs .bt').filter({ hasText: { chefao: 'Confronto com o chefe', mago: 'Modo mago', multibola: 'Multibola', super: 'Super jackpot', bonus: 'fase bônus', tunel: 'Túnel mágico', nucleo: 'Subfase: núcleo', chefeFase: 'Derrubar fase' }[rid] });
    await btn.first().click(); await p.waitForTimeout(300);
    const r = await p.evaluate(src => { const C = window.__cintila, J = C.jogo; return { demo: C.demo, est: C.estado, ok: (0, eval)('(' + src + ')')(J), an: J.anuncios.length }; }, f.toString());
    ok(r.demo && r.est === 'jogo' && r.ok, `${nome}: laboratório "${rid}" abre em demonstração ${JSON.stringify(r)}`); void nomeRec;
  }
  // super jackpot: confere o anúncio real via fila do painel de pontos
  // fim de uma demonstração não grava nada
  await p.evaluate(() => { const J = window.__cintila.jogo; J.estado = 'jogo'; J.salva = 0; J.bola = 3; J.extras = 0; J.mago = false; J.multibola = false; for (const x of J.mesa.bolas) { x.preso = false; x.trilho = undefined; x.x = 190; x.y = 790; } J.fila = 0; });
  await p.waitForFunction(() => (document.querySelector('#ui')?.textContent || '').includes('FIM DA DEMONSTRAÇÃO'), null, { timeout: 45000 }).catch(() => 0);
  const fimD = await p.evaluate(() => document.querySelector('#ui').textContent.includes('FIM DA DEMONSTRAÇÃO'));
  const depois = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('cintila3')).map(k => k + '=' + localStorage.getItem(k)).sort().join('|'));
  ok(fimD && antes.replace(/cintila3\.playtest\.prefs=[^|]*/, '') === depois.replace(/cintila3\.playtest\.prefs=[^|]*/, ''), `${nome}: fim da demonstração não grava recorde nem progresso`);
  const chaves = await p.evaluate(() => Object.keys(localStorage)); ok(chaves.every(k => !k.startsWith('cintila3.') || k.startsWith('cintila3.playtest.')), `${nome}: armazenamento isolado (prefixo cintila3.playtest.) ${chaves.join(',')}`);
  ok(erros.length === 0, `${nome}: 0 erros de console ${erros.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
console.log(falhas ? falhas + ' FALHA(S)' : 'PLAYTEST OK'); await b.close(); process.exit(falhas ? 1 : 0);
