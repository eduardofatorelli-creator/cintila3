// R06.1 · Integridade do progresso salvo: um perfil no formato da produção v3.0.2 (sem a preferência 'curtas')
// abre com as mesmas máquinas liberadas, recordes, mestria e preferências; jogar e recarregar não perde nada.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 1280, height: 800 } }), erros = [];
p.on('pageerror', e => erros.push(String(e)));
await p.addInitScript(() => { if (sessionStorage.getItem('pronto')) return; sessionStorage.setItem('pronto', '1'); localStorage.clear();
  const s = (k, v) => localStorage.setItem('cintila3.' + k, JSON.stringify(v));
  s('desbloqueadas', 5); s('recorde.aurora', 123456); s('ranking.aurora', [123456, 9000]); s('mestria.aurora', 3); s('eterno.cidadela', { tempo: 200, pontos: 50000 }); s('partidas', 17); s('prefs', { som: false, musica: false, narrador: true, canhoto: true }); });
await p.goto(process.env.BASE_URL || 'http://localhost:4040/'); await p.waitForSelector('.cartao');
const r1 = await p.evaluate(() => ({ cartoes: document.querySelectorAll('.cartao').length, trancas: document.querySelectorAll('.cartao.tranca').length, texto: document.body.textContent }));
const ok1 = r1.cartoes === 30 && r1.trancas === 25 && r1.texto.includes('123.456');
await p.getByText('RECORDES').click(); await p.waitForTimeout(200);
const rec = await p.evaluate(() => document.querySelector('#ui').textContent);
const ok2 = rec.includes('17 partidas') && rec.includes('5 de 30') && rec.includes('3:20');
await p.getByText('OPÇÕES').click(); await p.waitForTimeout(200);
const op = await p.evaluate(() => [...document.querySelectorAll('.opc')].map(e => e.textContent));
const ok3 = op.some(t => t.includes('Canhoto') && t.includes('LIGADO')) && op.some(t => t.includes('Transições curtas') && t.includes('DESLIGADO'));
await p.reload(); await p.waitForSelector('.cartao');
const chaves = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('cintila3.')).sort());
const ok4 = JSON.parse(await p.evaluate(() => localStorage.getItem('cintila3.desbloqueadas'))) === 5 && JSON.parse(await p.evaluate(() => localStorage.getItem('cintila3.recorde.aurora'))) === 123456;
const ok = ok1 && ok2 && ok3 && ok4 && !erros.length;
console.log(ok ? 'PROGRESSO OK: perfil da v3.0.2 lido sem perdas (' + chaves.length + ' chaves)' : 'FALHA ' + JSON.stringify({ ok1, ok2, ok3, ok4, erros }));
await b.close(); process.exit(ok ? 0 : 1);
