// Sintetizador em Web Audio: efeitos, trilha adaptativa em 4 camadas e narrador. Nenhum arquivo de áudio.
type Onda = OscillatorType;
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export class Audio {
  ctx: AudioContext | null = null; private sfx!: GainNode; private mus!: GainNode; private rev!: GainNode; private ruido!: AudioBuffer;
  som = true; musica = true; narrador = true;
  private bpm = 110; private escala = [0, 3, 5, 7, 10]; private raiz = 45; private passo = 0; private prox = 0; private timer = 0;
  nivel = 1; progressao = 0; private tocando = false; private ultFala = 0; private ult: Record<string, number> = {};

  inicia() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    const c: AudioContext = this.ctx = new AC();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; comp.connect(c.destination);
    this.sfx = c.createGain(); this.sfx.gain.value = 0.5; this.sfx.connect(comp);
    this.mus = c.createGain(); this.mus.gain.value = 0.3; this.mus.connect(comp);
    // reverberação: dois delays (71 ms e 113 ms) realimentados em 0,42 com passa-baixa em 2,6 kHz
    this.rev = c.createGain(); this.rev.gain.value = 0.3;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; const saida = c.createGain(); saida.gain.value = 0.5; saida.connect(comp);
    for (const t of [0.071, 0.113]) { const d = c.createDelay(0.5); d.delayTime.value = t; const fb = c.createGain(); fb.gain.value = 0.42; this.rev.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); d.connect(saida); }
    this.ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const dd = this.ruido.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
  }
  private tom(f: number, dur: number, tipo: Onda = 'square', vol = 0.3, o: { para?: number; em?: number; ataque?: number; dest?: GainNode; rev?: number } = {}) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + (o.em || 0), os = c.createOscillator(), g = c.createGain();
    os.type = tipo; os.frequency.setValueAtTime(Math.max(20, f), t); if (o.para) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.para), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.ataque ?? 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(g); g.connect(o.dest || this.sfx); if (o.rev !== 0) { const s = c.createGain(); s.gain.value = o.rev ?? 0.35; g.connect(s); s.connect(this.rev); }
    os.start(t); os.stop(t + dur + 0.03);
  }
  private chiado(dur: number, vol = 0.3, f = 2000, tipo: BiquadFilterType = 'bandpass', o: { para?: number; em?: number; dest?: GainNode; q?: number } = {}) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + (o.em || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.ruido; s.loop = true; fl.type = tipo; fl.Q.value = o.q ?? 1; fl.frequency.setValueAtTime(f, t); if (o.para) fl.frequency.exponentialRampToValueAtTime(o.para, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(o.dest || this.sfx); g.connect(this.rev);
    s.start(t, Math.random()); s.stop(t + dur + 0.03);
  }
  private nota(grau: number, oitava = 0) { const e = this.escala, n = e.length; return midi(this.raiz + 12 * (oitava + Math.floor(grau / n)) + e[((grau % n) + n) % n]); }

  /** efeitos: cada um com timbre próprio */
  toca(nome: string, p = 0) {
    if (!this.ctx || !this.som) return;
    const agora = this.ctx.currentTime; if (agora - (this.ult[nome] || 0) < 0.03) return; this.ult[nome] = agora;
    const N = (g: number, o = 0) => this.nota(g, o);
    switch (nome) {
      case 'palheta': this.chiado(0.05, 0.3, 900, 'lowpass'); this.tom(150, 0.06, 'square', 0.22, { para: 70, rev: 0 }); break;
      case 'palhetaDesce': this.tom(90, 0.05, 'triangle', 0.14, { para: 50, rev: 0 }); break;
      case 'bumper': this.tom([N(0, 2), N(2, 2), N(4, 2)][Math.round(p) % 3], 0.16, 'square', 0.3, { para: N(0, 1) }); this.chiado(0.05, 0.2, 3000); break;
      case 'estilingue': this.tom(520, 0.07, 'sawtooth', 0.22, { para: 180 }); this.chiado(0.04, 0.15, 4500); break;
      case 'alvo': this.tom(N(4, 2), 0.1, 'triangle', 0.35); this.tom(N(4, 3), 0.14, 'sine', 0.18, { em: 0.02 }); break;
      case 'queda': this.tom(N(2, 2), 0.09, 'square', 0.25, { para: N(2, 1) }); this.chiado(0.08, 0.2, 700, 'lowpass'); break;
      case 'tijolo': this.tom(N(3, 3), 0.07, 'square', 0.22); this.chiado(0.06, 0.2, 5200, 'highpass'); break;
      case 'faixa': this.tom(N(5, 3), 0.12, 'sine', 0.3); break;
      case 'giro': this.tom(1500, 0.03, 'square', 0.1, { para: 2100, rev: 0 }); break;
      case 'rampa': for (let i = 0; i < 4; i++) this.tom(N(i * 2, 2), 0.13, 'sawtooth', 0.2, { em: i * 0.07 }); break;
      case 'orbita': this.chiado(0.6, 0.25, 300, 'bandpass', { para: 5000, q: 6 }); this.tom(N(0, 2), 0.5, 'sine', 0.16, { para: N(0, 3) }); break;
      case 'chefe': this.tom(100, 0.3, 'sawtooth', 0.4, { para: 38 }); this.chiado(0.2, 0.35, 500, 'lowpass'); this.tom(N(0, 3), 0.12, 'square', 0.14); break;
      case 'escudo': this.tom(1900, 0.2, 'sine', 0.22, { para: 2500 }); this.tom(2850, 0.25, 'sine', 0.1); break;
      case 'explosao': this.chiado(1.1, 0.6, 2400, 'lowpass', { para: 60 }); this.tom(130, 0.9, 'sawtooth', 0.42, { para: 22 }); for (let i = 0; i < 5; i++) this.tom(N(i * 2, 3), 0.2, 'square', 0.1, { em: 0.1 + i * 0.07 }); break;
      case 'jackpot': for (let i = 0; i < 6; i++) this.tom(N(i, 2 + (i > 3 ? 1 : 0)), 0.16, 'square', 0.22, { em: i * 0.06 }); break;
      case 'super': for (let i = 0; i < 12; i++) this.tom(N(i, 2), 0.2, i % 2 ? 'square' : 'sawtooth', 0.2, { em: i * 0.05 }); this.chiado(0.9, 0.22, 800, 'highpass', { para: 9000 }); break;
      case 'bolaExtra': for (const [i, g] of [0, 2, 4, 7].entries()) this.tom(N(g, 2), 0.3, 'triangle', 0.3, { em: i * 0.11 }); break;
      case 'missao': this.tom(N(0, 2), 0.14, 'square', 0.22); this.tom(N(4, 2), 0.24, 'square', 0.22, { em: 0.11 }); break;
      case 'missaoOk': for (const [i, g] of [0, 2, 4, 5, 7].entries()) this.tom(N(g, 2), 0.2, 'sawtooth', 0.2, { em: i * 0.08 }); break;
      case 'evolucao': this.tom(N(0, 1), 0.6, 'sawtooth', 0.22, { para: N(0, 3) }); this.tom(N(4, 3), 0.4, 'sine', 0.22, { em: 0.42 }); break;
      case 'assinatura': this.tom(N(2, 3), 0.1, 'triangle', 0.26); this.tom(N(5, 3), 0.2, 'triangle', 0.26, { em: 0.08 }); break;
      case 'tunelEntra': this.tom(50, 1.1, 'sawtooth', 0.4, { para: 240, ataque: 0.5 }); this.chiado(1.2, 0.25, 200, 'bandpass', { para: 2600, q: 5 }); for (let i = 0; i < 7; i++) this.tom(300, 0.03, 'square', 0.1, { em: 0.3 + i * 0.09, rev: 0 }); break;
      case 'tunelSai': this.tom(380, 0.8, 'sawtooth', 0.3, { para: 50 }); this.chiado(0.8, 0.2, 2600, 'bandpass', { para: 200, q: 5 }); break;
      case 'lancador': this.tom(120 + p * 240, 0.3, 'sawtooth', 0.3, { para: 500 + p * 800 }); this.chiado(0.22, 0.24, 1200, 'highpass'); break;
      case 'dreno': this.tom(N(4, 2), 0.2, 'triangle', 0.3, { para: N(4, 1) }); this.tom(N(2, 1), 0.3, 'triangle', 0.3, { em: 0.2, para: N(0, 0) }); this.tom(N(0, 0), 0.6, 'sawtooth', 0.22, { em: 0.45, para: 30 }); break;
      case 'salva': this.tom(N(0, 3), 0.1, 'sine', 0.3); this.tom(N(2, 3), 0.1, 'sine', 0.3, { em: 0.09 }); this.tom(N(4, 3), 0.3, 'sine', 0.3, { em: 0.18 }); break;
      case 'poste': this.tom(800, 0.06, 'square', 0.3, { para: 1700 }); this.tom(240, 0.12, 'triangle', 0.3); break;
      case 'resgate': this.tom(140, 0.35, 'sawtooth', 0.4, { para: 1900 }); this.chiado(0.3, 0.3, 3000, 'highpass'); break;
      case 'trava': this.tom(260, 0.05, 'square', 0.3, { rev: 0 }); this.tom(180, 0.14, 'square', 0.3, { em: 0.07 }); this.tom(N(4, 2), 0.3, 'sine', 0.2, { em: 0.16 }); break;
      case 'tilt': this.tom(75, 1.3, 'sawtooth', 0.5, { para: 28 }); this.tom(80, 1.3, 'square', 0.3, { para: 31 }); break;
      case 'aviso': this.tom(880, 0.09, 'square', 0.3); this.tom(880, 0.09, 'square', 0.3, { em: 0.15 }); break;
      case 'relogio': this.tom(1250, 0.03, 'square', 0.2, { rev: 0 }); break;
      case 'saida': this.tom(200, 0.14, 'square', 0.25, { para: 640 }); this.chiado(0.08, 0.18, 2200); break;
      case 'portal': this.tom(N(0, 3), 0.25, 'sine', 0.25, { para: N(0, 2) }); break;
    }
  }

  // ---------- trilha adaptativa ----------
  tema(bpm: number, escala: number[], raiz: number) { this.bpm = bpm; this.escala = escala; this.raiz = raiz; this.passo = 0; }
  liga() { if (this.tocando || !this.ctx) return; this.tocando = true; this.prox = this.ctx.currentTime + 0.1; this.timer = window.setInterval(() => this.agenda(), 40); }
  desliga() { this.tocando = false; clearInterval(this.timer); }
  private agenda() {
    const c = this.ctx; if (!c || !this.tocando) return; const sem = 60 / this.bpm / 4;
    if (this.prox < c.currentTime - 0.5) this.prox = c.currentTime + 0.05;
    while (this.prox < c.currentTime + 0.12) { if (this.musica) this.semicolcheia(this.passo, this.prox - c.currentTime); this.passo++; this.prox += sem; }
  }
  private semicolcheia(p: number, em: number) {
    const s = p % 16, comp = Math.floor(p / 16), N = (g: number, o = 0) => this.nota(g, o), m = this.mus, n = this.nivel;
    const prog = this.progressao ? [0, 5, 3, 4] : [0, 0, 3, 4], fund = prog[comp % 4];
    // camada 1: bumbo e baixo
    if (s % 4 === 0 || (n > 2 && s === 10)) { this.tom(120, 0.16, 'sine', 0.75, { para: 40, em, dest: m, rev: 0 }); }
    if (s % 2 === 0) this.tom(N(fund + (s % 8 === 6 ? 2 : 0), -1), 0.16, 'sawtooth', 0.22, { em, dest: m, rev: 0.1 });
    // camada 2: caixa e chimbal
    if (n >= 2) { if (s === 4 || s === 12) this.chiado(0.13, 0.3, 1800, 'bandpass', { em, dest: m }); if (s % 2 === 1 || n > 3) this.chiado(0.03, 0.1, 8000, 'highpass', { em, dest: m }); }
    // camada 3: arpejo
    if (n >= 3) { const arp = [0, 2, 4, 2, 5, 4, 2, 4]; this.tom(N(fund + arp[s % 8], 1), 0.1, 'square', 0.09, { em, dest: m }); }
    // camada 4: contracanto
    if (n >= 4 && s % 4 === 2) { const mel = [4, 5, 7, 5, 9, 7, 5, 4]; this.tom(N(fund + mel[(comp * 4 + s / 4 | 0) % 8], 2), 0.3, 'triangle', 0.13, { em, dest: m }); }
  }

  /** narrador em pt-BR, com trava de 800 ms entre falas */
  fala(texto: string) {
    if (!this.narrador || typeof speechSynthesis === 'undefined') return;
    const agora = performance.now(); if (agora - this.ultFala < 800) return; this.ultFala = agora;
    try { const u = new SpeechSynthesisUtterance(texto); u.lang = 'pt-BR'; u.rate = 1.12; u.pitch = 0.68; u.volume = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* sem voz disponível */ }
  }
}
