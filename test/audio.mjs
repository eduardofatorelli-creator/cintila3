// Grampeia a saída de áudio: pendura um analisador no primeiro compressor criado e mede o RMS
// a cada 2 s durante 30 s de partida, sem tocar em nenhum controle. Reprova se houver apito crescendo.
import { chromium } from 'playwright';
const url = process.env.BASE_URL || 'http://localhost:4040/';
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1000, height: 800 } });
await p.addInitScript(() => {
  const AC = window.AudioContext, orig = AC.prototype.createDynamicsCompressor; let feito = false;
  AC.prototype.createDynamicsCompressor = function () {
    const n = orig.call(this);
    if (!feito) { feito = true; const an = this.createAnalyser(); an.fftSize = 2048; n.connect(an); const buf = new Float32Array(2048); window.__pico = 0; window.__rms = () => { an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; return Math.sqrt(s / buf.length); };
      setInterval(() => { an.getFloatTimeDomainData(buf); for (const v of buf) if (Math.abs(v) > window.__pico) window.__pico = Math.abs(v); }, 20); }
    return n;
  };
});
await p.goto(url); await p.waitForSelector('.cartao'); await p.getByText('▶ JOGAR').click();
const rms = [];
for (let t = 2; t <= 30; t += 2) { await p.waitForTimeout(2000); let m = 0; for (let i = 0; i < 10; i++) { m = Math.max(m, await p.evaluate(() => window.__rms())); await p.waitForTimeout(15); } rms.push(+m.toFixed(4)); }
const pico = await p.evaluate(() => window.__pico);
const crescente = rms.slice(4).every((v, i, a) => i === 0 || v > a[i - 1] * 1.05);
const ok = rms[13] < 0.05 && pico < 0.3 && !crescente;
console.log('RMS a cada 2 s:', rms.join(' ')); console.log(`RMS aos 28 s: ${rms[13]} | pico: ${pico.toFixed(3)} | crescimento monotônico: ${crescente} | ${ok ? 'APROVADO' : 'REPROVADO'}`);
await b.close(); process.exit(ok ? 0 : 1);
