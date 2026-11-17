// R06.1 · Confere a galeria de revisão local: 30 seções, nenhuma imagem quebrada, e tira duas fotos dela.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('evidencias/visual-r06-1/galeria/index.html')).href;
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(url);
const quebradas = await p.evaluate(async () => { const imgs = [...document.images]; for (const i of imgs) i.loading = 'eager'; await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); return imgs.filter(i => i.naturalWidth === 0).map(i => i.getAttribute('src')); });
const secoes = await p.evaluate(() => document.querySelectorAll('section').length), imgs = await p.evaluate(() => document.images.length);
await p.screenshot({ path: 'evidencias/visual-r06-1/galeria-topo.png' }); await p.locator('#m24').scrollIntoViewIfNeeded(); await p.screenshot({ path: 'evidencias/visual-r06-1/galeria-maquina.png' });
console.log(`${secoes} seções, ${imgs} imagens, ${quebradas.length} quebradas`, quebradas.slice(0, 3));
await b.close(); process.exit(secoes === 30 && !quebradas.length ? 0 : 1);
