// R06 · Regressão do erro intermitente "Cannot read properties of null (reading 'def')":
// no modo de atração o painel de pontos é desenhado sem jogo; animações de chefe na fila não podem ler J.def.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1280, height: 800 } }), erros = [];
p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto(process.env.BASE_URL || 'http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila);
const est = await p.evaluate(() => { const C = window.__cintila; const e = C.atracao(); const J = C.jogo; J.anuncios.length = 0; C.caixa.fila = []; C.caixa.atual = null; J.m.chefe.imune = 0; J.ev('chefe', J.mesa.bolas[0] || J.novaNaCanaleta(), J.m.chefe); C.caixa.recebe(J.anuncios.filter(a => a.tipo === 'chefeDano')); J.anuncios.length = 0; return e; });
await p.waitForTimeout(2500);
const ok = est === 'atracao' && erros.length === 0;
console.log(ok ? 'ATRAÇÃO OK: animações de chefe com o painel sem jogo, 0 erros' : 'FALHA ' + est + ' ' + erros.join(' | '));
await b.close(); process.exit(ok ? 0 : 1);
