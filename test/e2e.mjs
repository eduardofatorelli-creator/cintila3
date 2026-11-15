// Teste de jogo no navegador: as 30 máquinas abrem e desenham sem erro, a campanha desbloqueia,
// o modo eterno funciona e o tempo de quadro fica dentro da meta (seção 12.4).
import { chromium } from 'playwright';
const URL = process.env.BASE_URL || 'http://localhost:4040/';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const erros = []; p.on('pageerror', e => erros.push('pageerror: ' + e)); p.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
await p.goto(URL); await p.waitForFunction(() => !!window.__cintila); await p.evaluate(() => localStorage.clear());
const ids = await p.evaluate(async () => (await import('/src/machines/index.ts')).MAQUINAS.map(m => m.id));
let falhas = 0; const ok = (c, m) => { if (!c) { falhas++; console.log('FALHA:', m); } };
ok(ids.length === 30, '30 máquinas');
for (const id of ids) {
  const r = await p.evaluate(async id => {
    const C = window.__cintila; C.loadMachine(id); const J = C.jogo;
    for (let i = 0; i < 400 && J.escolha; i++) C.step(); J.lancar(0.9);
    await new Promise(r => setTimeout(r, 350));               // deixa o laço real desenhar a mesa
    const subiu = C.enterUpper(); await new Promise(r => setTimeout(r, 400));   // e a transição do andar
    for (let i = 0; i < 240; i++) C.step();
    const noAndar = J.campo !== J.mesa; await new Promise(r => setTimeout(r, 150));
    return { subiu, noAndar, pontos: J.pontos, nan: J.stats.nan };
  }, id);
  ok(r.subiu && r.noAndar && r.nan === 0, id + ' ' + JSON.stringify(r));
}
// campanha: vencer o modo mago da máquina 1 libera a 2
const camp = await p.evaluate(() => {
  const C = window.__cintila; C.loadMachine('aurora'); const J = C.jogo; J.lancar(1); for (let i = 0; i < 300; i++) C.step();
  J.iniciaMago(); J.magoN = J.def.mago.regra.meta - 1; J.ev('bumper', J.mesa.bolas[0], { tom: 0 }); for (let i = 0; i < 400; i++) C.step();
  return { venceu: J.magoVenceu, livres: JSON.parse(localStorage.getItem('cintila3.desbloqueadas') || '1') };
});
ok(camp.venceu && camp.livres === 2, 'campanha desbloqueia ' + JSON.stringify(camp));
// modo eterno: sobe de degrau a cada 3 minutos
const et = await p.evaluate(() => {
  const C = window.__cintila; C.loadMachine('aurora', 'eterno'); const J = C.jogo; J.lancar(1); const g0 = J.mesa.g;
  J.tempoJogo = 179.9; for (let i = 0; i < 60; i++) C.step();
  return { degrau: J.degrau, maisPesado: J.mesa.g > g0, modo: J.modo };
});
ok(et.degrau === 1 && et.maisPesado, 'modo eterno ' + JSON.stringify(et));
// desempenho
await p.evaluate(() => window.__cintila.loadMachine('feira'));
const perf = await p.evaluate(() => window.__cintila.medeQuadros(2000));
console.log('tempo de quadro (4 bolas, 300 partículas, 2000 quadros):', JSON.stringify(perf));
ok(perf.mediana < 9, 'mediana abaixo de 9 ms');
ok(erros.length === 0, 'erros de console: ' + erros.slice(0, 4).join(' | '));
console.log(falhas ? `${falhas} FALHA(S)` : 'TUDO PASSOU: 30 máquinas, campanha, modo eterno, desempenho, 0 erros de console');
await b.close(); process.exit(falhas ? 1 : 0);
