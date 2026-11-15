// Fumaça na URL pública: abre o menu, entra na máquina 1, lança a bola e joga 12 s com as palhetas.
import { chromium } from 'playwright';
const url = process.argv[2] || 'https://cintila3.vercel.app';
const b = await chromium.launch({ channel: 'chrome' });
for (const [nome, vp] of [['desktop', { width: 1280, height: 800 }], ['celular', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp, hasTouch: nome === 'celular' });
  const erros = []; p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('.cartao', { timeout: 15000 });
  const cartoes = await p.locator('.cartao').count();
  await p.getByText('▶ JOGAR').click(); await p.waitForTimeout(1200);
  await p.keyboard.down('Space'); await p.waitForTimeout(800); await p.keyboard.up('Space');
  for (let i = 0; i < 24; i++) { await p.keyboard.down(i % 2 ? 'KeyZ' : 'KeyM'); await p.waitForTimeout(160); await p.keyboard.up(i % 2 ? 'KeyZ' : 'KeyM'); await p.waitForTimeout(340); }
  await p.screenshot({ path: `test-results/prod-${nome}.png` });
  console.log(nome, JSON.stringify({ cartoes, ganchosDeTeste: await p.evaluate(() => '__cintila' in window), erros }));
  await p.close();
}
await b.close();
