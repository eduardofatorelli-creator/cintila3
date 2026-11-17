// Confere as telas de fim de partida, passagem de máquina, pausa e modo de atração.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1000, height: 800 } });
const erros = []; p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto('http://localhost:4040/'); await p.waitForFunction(() => !!window.__cintila); await p.evaluate(() => localStorage.clear());
const acaba = () => p.evaluate(() => { const C = window.__cintila, J = C.jogo; J.estado = 'jogo'; J.salva = 0; J.bola = 3; J.extras = 0; J.mago = false; for (const x of J.mesa.bolas) { x.preso = false; x.trilho = undefined; x.x = 190; x.y = 790; } J.fila = 0; });
// 1) vence o mago, perde a partida: deve aparecer a tela de passagem
await p.evaluate(() => { const C = window.__cintila; C.loadMachine('aurora'); const J = C.jogo; J.lancar(1); for (let i = 0; i < 300; i++) C.step(); J.iniciaMago(); J.magoN = 21; J.ev('bumper', J.mesa.bolas[0], { tom: 0 }); for (let i = 0; i < 300; i++) C.step(); });
// o jogo avança por quadros (passo limitado a 50 ms): sob carga o tempo de jogo anda mais devagar que o relógio,
// por isso esperamos o estado observável (tela de passagem montada), não um tempo fixo
const ui = t => p.waitForFunction(s => (document.querySelector('#ui')?.textContent || '').includes(s), t, { timeout: 45000 });
await acaba(); await ui('NOVA MÁQUINA LIBERADA');
const passagem = await p.evaluate(() => document.querySelector('#ui')?.textContent || ''); await p.screenshot({ path: 'test-results/passagem.png' });
await p.getByText('VER RESULTADO').click(); await ui('FIM DE JOGO');
const fim = await p.evaluate(() => document.querySelector('#ui')?.textContent || ''); await p.screenshot({ path: 'test-results/fim.png' });
await p.getByText('TROCAR DE MÁQUINA').click(); await p.waitForSelector('.cartao');
const cartoes = await p.evaluate(() => [document.querySelectorAll('.cartao').length, document.querySelectorAll('.cartao.tranca').length]);
// 2) pausa
await p.getByText('▶ JOGAR').click(); await p.waitForFunction(() => window.__cintila.estado === 'jogo'); await p.keyboard.press('KeyP'); await ui('PAUSA');
const pausa = await p.evaluate(() => document.querySelector('#ui')?.textContent || '');
await p.getByText('SAIR PARA O MAPA').click();
// 3) atração depois de 20 s parado
await p.waitForFunction(() => window.__cintila.estado === 'atracao', null, { timeout: 60000 }).catch(() => 0); const estado = await p.evaluate(() => window.__cintila.estado); await p.screenshot({ path: 'test-results/atracao.png' });
console.log(JSON.stringify({ passagem: passagem.includes('NOVA MÁQUINA LIBERADA') && passagem.includes('PASSO LUNAR'), fim: fim.includes('FIM DE JOGO') && fim.includes('MESTRIA'), cartoes, pausa: pausa.includes('PAUSA'), atracao: estado, erros }));
await b.close();
