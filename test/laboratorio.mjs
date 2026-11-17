// Playtest R06.2 · varredura do laboratório: os 15 recursos em cada uma das 30 máquinas (dev server com VITE_PLAYTEST=1).
// Depois de aplicar o recurso, o jogo roda 4 s de simulação real; confere estado esperado, ausência de NaN e de erros.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1280, height: 800 } }), erros = [];
p.on('pageerror', e => erros.push(String(e))); p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto(process.env.BASE_URL || 'http://localhost:4048/'); await p.waitForFunction(() => !!window.__cintila);
const r = await p.evaluate(async () => {
  const C = window.__cintila, { MAQUINAS } = await import('/src/machines/index.ts'), { RECURSOS } = await import('/src/playtest.ts'), out = { total: 0, efeito: 0, semEfeito: [], nan: [] };
  const esperado = { chefao: J => !!(J.sub || J.trans), bonus: J => !!(J.sub || J.trans), premium: J => !!(J.sub || J.trans), tunel: J => !!(J.sub || J.trans), nucleo: J => !!(J.sub || J.trans), enxame: J => !!(J.sub || J.trans), muralha: J => !!(J.sub || J.trans), camara: J => !!(J.sub || J.trans), mago: J => J.mago || J.magoVenceu, multibola: J => J.multibola || J.stats, jackpot: J => J.jackpots > 0, super: J => J.pontos >= 250000, andarAceso: J => J.andarAceso || J.sub, chefeFase: J => J.stats.nucleos > 0, chefeUltima: J => J.m.chefe.vida === 1 || J.m.chefe.c.off };
  for (const m of MAQUINAS) for (const rec of RECURSOS) {
    C.demoJa(m.id, rec.id); const J = C.jogo; out.total++;
    if (esperado[rec.id](J)) out.efeito++; else out.semEfeito.push(m.id + ':' + rec.id);
    for (let i = 0; i < 480; i++) C.step();
    if (J.stats.nan) out.nan.push(m.id + ':' + rec.id);
  }
  return out;
});
console.log(JSON.stringify({ ...r, semEfeito: r.semEfeito.slice(0, 20) }), 'erros:', erros.slice(0, 3));
const ok = r.total === 450 && r.nan.length === 0 && erros.length === 0;
console.log(ok ? `LABORATÓRIO OK: ${r.efeito}/${r.total} recursos chegaram ao estado pedido, 0 NaN, 0 erros` : 'FALHA');
await b.close(); process.exit(ok ? 0 : 1);
