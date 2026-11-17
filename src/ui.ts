// Telas em HTML por cima do canvas: galeria das máquinas, recordes, opções, pausa, fim de partida e passagem.
// Visual R04: galeria arcade (cartões de gabinete, vitrine da máquina, bloqueadas reconhecíveis), passagem com
// destaque para a arte nova e resultado com festa de recorde. O comportamento de desbloqueio é o mesmo de antes.
import { Prefs, salvo } from './core/storage';
import type { Fecho } from './game/campaign';
import type { Game, ModoJogo } from './game/rules';
import { MAQUINAS } from './machines';
import type { MachineDef } from './machines/_schema';
import { visualDe } from './visual/manifesto';
import { PLAYTEST, RECURSOS, VERSAO } from './playtest';

const CSS = `
#ui *{box-sizing:border-box}
.painel{position:absolute;inset:0;pointer-events:auto;overflow-y:auto;background:radial-gradient(ellipse at 50% -10%,#241a62 0%,#0b0b26 45%,#030308 100%);padding:max(14px,env(safe-area-inset-top)) 14px 40px;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.painel::before{content:'';position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(125,249,255,.035) 0 1px,transparent 1px 90px),radial-gradient(ellipse at 50% 120%,rgba(255,111,181,.12),transparent 60%)}
.vidro{background:rgba(3,4,14,.88);backdrop-filter:blur(4px);display:grid;place-items:center}
.titulo{position:relative;font-size:clamp(30px,8vw,64px);font-weight:800;letter-spacing:.14em;text-align:center;margin:6px 0 0;background:linear-gradient(90deg,#7df9ff,#b48cff,#ff6fb5,#ffd24a,#7df9ff);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:corre 8s linear infinite;filter:drop-shadow(0 0 18px rgba(180,140,255,.35))}
@keyframes corre{to{background-position:300% 0}}
.sub{position:relative;text-align:center;letter-spacing:.4em;font-size:11px;color:#9aa3d6;margin:2px 0 12px}
.abas{position:relative;display:flex;gap:8px;justify-content:center;margin:0 0 14px;flex-wrap:wrap}
.bt{font:800 13px Orbitron,sans-serif;letter-spacing:.12em;color:#e8ecff;background:linear-gradient(180deg,#1b2048,#10132e);border:1.5px solid #3b4290;border-radius:10px;padding:11px 16px;cursor:pointer;min-height:44px;touch-action:manipulation;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.bt:hover{border-color:#7df9ff}.bt:focus-visible{outline:3px solid #ffd24a;outline-offset:2px}.bt.on{background:#7df9ff;color:#04050f;border-color:#fff}
.bt.forte{background:linear-gradient(180deg,#ff8cc6,#d23f8c 55%,#9c2766);border-color:#ffd0e8;font-size:17px;padding:14px 30px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset,0 6px 22px rgba(255,80,160,.45);animation:pisca 1.6s ease-in-out infinite}
@keyframes pisca{50%{box-shadow:0 0 30px rgba(255,111,181,.8),0 0 0 1px rgba(255,255,255,.3) inset;filter:brightness(1.15)}}
.vitrine{position:relative;max-width:1100px;margin:0 auto 18px;border-radius:16px;padding:2px;background:linear-gradient(135deg,var(--c1),var(--c2) 45%,var(--c3));box-shadow:0 0 40px color-mix(in srgb,var(--c1) 30%,transparent)}
.vitrine>div{border-radius:14px;background:linear-gradient(160deg,rgba(14,16,42,.97),rgba(6,7,20,.97));padding:16px;display:grid;grid-template-columns:minmax(0,440px) 1fr;gap:18px;align-items:center}
@media(max-width:760px){.vitrine>div{grid-template-columns:1fr;padding:12px;gap:12px}}
.arte{position:relative;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,.25);box-shadow:0 10px 30px rgba(0,0,0,.6)}
.arte canvas{display:block;width:100%;aspect-ratio:400/228}
.arte::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.12) 45%,transparent 55%);pointer-events:none}
.placa{position:absolute;top:8px;left:8px;font:800 12px Orbitron;color:#05060f;background:linear-gradient(180deg,#fff,#b9c0d8);border-radius:6px;padding:3px 7px;box-shadow:0 2px 6px rgba(0,0,0,.6)}
.vitrine h2{margin:0 0 2px;font-size:clamp(20px,3.4vw,30px);letter-spacing:.08em;color:var(--c1);text-shadow:0 0 16px color-mix(in srgb,var(--c1) 50%,transparent)}
.lema{margin:0 0 6px;font-size:13px;color:#e8ecff;line-height:1.5}
.conceito{margin:0 0 10px;font-size:11px;color:#9aa3d6;font-style:italic;line-height:1.5}
.fichas{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:0 0 10px}
.ficha{border:1px solid rgba(255,255,255,.1);border-left:3px solid var(--c2);border-radius:8px;padding:6px 9px;background:rgba(255,255,255,.03)}
.ficha b{display:block;font-size:9px;letter-spacing:.18em;color:var(--c2);margin-bottom:2px}.ficha span{font-size:12px;color:#fff;line-height:1.35}
.recs{font-size:12px;color:#cdd3f5;margin:2px 0 4px}
.linha{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
.grade{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;max-width:1100px;margin:0 auto}
@media(max-width:900px){.grade{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:560px){.grade{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}}
.cartao{position:relative;border:0;border-radius:12px;padding:2px;background:linear-gradient(160deg,color-mix(in srgb,var(--c1) 55%,#222),#15183a 40%,color-mix(in srgb,var(--c2) 45%,#111));cursor:pointer;color:inherit;font:inherit;text-align:left;touch-action:manipulation;transition:transform .15s}
.cartao>div{border-radius:10px;overflow:hidden;background:#090b1c;height:100%}
.cartao .mini{position:relative}.cartao canvas{display:block;width:100%;aspect-ratio:400/228;background:#0a0c1e}
.cartao .mini::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(5,6,16,.85)),linear-gradient(115deg,transparent 35%,rgba(255,255,255,.1) 48%,transparent 58%)}
.cartao:hover{transform:translateY(-2px)}
.cartao:focus-visible{outline:3px solid #ffd24a;outline-offset:2px}
.cartao.sel{box-shadow:0 0 0 2px #fff,0 0 26px color-mix(in srgb,var(--c1) 70%,transparent)}
.cartao .n{position:absolute;top:6px;left:6px;z-index:3;font:800 11px Orbitron;color:#05060f;background:linear-gradient(180deg,#fff,#b9c0d8);border-radius:5px;padding:2px 6px}
.cartao .rod{padding:6px 8px 8px;font-size:10px;line-height:1.35}
.cartao .nome{font-weight:800;font-size:12px;color:var(--c1);line-height:1.25;min-height:2.5em}
.mestria{display:flex;gap:2px;margin:4px 0 3px}.mestria i{flex:1;height:4px;border-radius:2px;background:#24284a}.mestria i.on{background:linear-gradient(90deg,#ffd24a,#ffb02e)}
.fraco{color:#8a92b8}
.cartao.tranca{cursor:default;background:linear-gradient(160deg,#2a2e48,#111325)}
.cartao.tranca canvas{filter:grayscale(.75) brightness(.55)}
.cartao.tranca .mini::before{content:'';position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(135deg,rgba(0,0,0,.32) 0 6px,transparent 6px 14px)}
.cartao.tranca .cad{position:absolute;inset:0;z-index:2;display:grid;place-items:center;font-size:22px;filter:drop-shadow(0 2px 4px #000)}
.cartao.tranca .nome{color:#b8bedc}
.dica{position:relative;text-align:center;font-size:11px;letter-spacing:.2em;color:#9aa3d6;margin:16px 0 0}
.caixa{max-width:560px;width:100%;border:1.5px solid #3b4290;border-radius:14px;background:linear-gradient(170deg,#11143a,#080a1c);padding:20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);position:relative;overflow:hidden}
.caixa h2{margin:0 0 6px;letter-spacing:.14em}.placar{font:800 clamp(30px,9vw,56px) Orbitron;color:#7df9ff;margin:6px 0;text-shadow:0 0 22px rgba(125,249,255,.6)}
.placar.recorde{color:#ffd24a;text-shadow:0 0 26px rgba(255,210,74,.8);animation:bate .9s ease-in-out 3}
@keyframes bate{50%{transform:scale(1.08)}}
.festa{position:absolute;inset:0;overflow:hidden;pointer-events:none}.festa i{position:absolute;top:-14px;width:7px;height:12px;border-radius:2px;animation:cai linear forwards}
@keyframes cai{to{transform:translateY(900px) rotate(720deg)}}
.tab{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}.tab td,.tab th{padding:6px 8px;border-bottom:1px solid #1e2350;text-align:left}.tab td:last-child,.tab th:last-child{text-align:right}
.opc{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #1e2350;font-size:13px;text-align:left}
.aviso{color:#ffd24a;font-size:13px;margin:8px 0}
.passa{position:relative;height:min(48vh,320px);overflow:hidden;margin:10px 0}
.passa .raios{position:absolute;left:50%;top:55%;width:900px;height:900px;margin:-450px 0 0 -450px;background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--c1) 30%,transparent) 0 8deg,transparent 8deg 22deg);animation:gira 14s linear 1.6s infinite both;-webkit-mask:radial-gradient(circle,#000 10%,transparent 60%);mask:radial-gradient(circle,#000 10%,transparent 60%)}
@keyframes gira{from{opacity:.9;transform:rotate(0)}to{opacity:.9;transform:rotate(360deg)}}
.passa canvas{position:absolute;left:50%;width:min(88%,440px);border-radius:10px;border:2px solid #fff}
.passa .velha{top:20px;transform:translateX(-50%);animation:recua 1.6s ease-in forwards}
.passa .nova{top:20px;transform:translate(-50%,-140%);animation:desce 1.4s cubic-bezier(.2,1.3,.4,1) 1.2s forwards;box-shadow:0 0 40px var(--c1)}
.passa .trilho{position:absolute;top:0;bottom:0;width:4px;background:repeating-linear-gradient(#889 0 8px,#334 8px 16px)}
@keyframes recua{to{transform:translateX(-50%) scale(.3);opacity:0;filter:blur(3px)}}@keyframes desce{to{transform:translate(-50%,0)}}
.brilho{background:linear-gradient(90deg,#ffd24a,#fff,#ffd24a);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:corre 2.5s linear infinite}
@media (prefers-reduced-motion: reduce){#ui *{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition:none!important}.festa{display:none}}
.toque{position:absolute;inset:0;pointer-events:none}
.teste{position:relative;max-width:1100px;margin:0 auto 14px;border:1px solid rgba(255,210,74,.5);background:rgba(255,210,74,.08);border-radius:12px;padding:10px 14px;font-size:12px;line-height:1.6;color:#ffe2a0}.teste b{color:#ffd24a}.teste ol{margin:4px 0 0;padding-left:18px;color:#e8ecff}
.bt.lab{border-color:#ffd24a;color:#ffd24a}.labs{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin:10px 0}.labs .bt{text-align:left;font-size:12px;letter-spacing:.06em;line-height:1.35}.labs .bt small{display:block;font:500 11px system-ui,sans-serif;color:#aab2d8;letter-spacing:0;margin-top:2px}
.versao{position:relative;text-align:center;font-size:10px;color:#6a729a;margin-top:18px}
.cartao .nome .num{display:inline-block;font:800 10px Orbitron;color:#05060f;background:linear-gradient(180deg,#fff,#b9c0d8);border-radius:4px;padding:1px 5px;margin-right:5px;vertical-align:1px}
@media(max-width:560px){.sub{letter-spacing:.22em}.conceito{display:none}.fichas{grid-template-columns:1fr 1fr;gap:6px}.ficha span{font-size:11px}.vitrine .linha .bt{flex:1;padding:12px 10px}.bt.forte{font-size:15px}.vitrine h2{font-size:20px}.lema{font-size:12px}}
`;

interface Acoes { jogar(id: string, modo: ModoJogo): void; menu(): void; continuar(): void; prefs(p: Prefs): void; som(): void; vidro(d: MachineDef): HTMLCanvasElement[]; demo(id: string, recurso: string): void; recurso(r: string): void; emDemo(): boolean }
const el = (tag: string, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const num = (n: number) => Math.round(n).toLocaleString('pt-BR');
const tempo = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const estrelas = (m: number) => '★'.repeat(m) + '<span class="fraco">' + '☆'.repeat(10 - m) + '</span>';
const cores = (e: HTMLElement, d: MachineDef) => { e.style.setProperty('--c1', d.paleta.c1); e.style.setProperty('--c2', d.paleta.c2); e.style.setProperty('--c3', d.paleta.c3); };
const espera = (f: () => void) => { const ric = (window as any).requestIdleCallback; if (ric) ric(f, { timeout: 120 }); else setTimeout(f, 16); };

export class Interface {
  private raiz = document.getElementById('ui')!; private aba: 'mapa' | 'recordes' | 'opcoes' = 'mapa'; private sel = ''; private miniaturas = new Map<string, HTMLCanvasElement>();
  private fila: [MachineDef, HTMLCanvasElement][] = []; private andando = false;
  ocupada = false;
  constructor(private A: Acoes) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  fecha() { this.raiz.innerHTML = ''; this.ocupada = false; }
  atracao() { this.fecha(); }

  private base(d: MachineDef): HTMLCanvasElement {
    let base = this.miniaturas.get(d.id);
    if (!base) { const cam = this.A.vidro(d); base = document.createElement('canvas'); base.width = cam[0].width; base.height = cam[0].height; const c = base.getContext('2d')!; for (const k of cam) c.drawImage(k, 0, 0); this.miniaturas.set(d.id, base); }
    return base;
  }
  /** miniatura: na hora (vitrine e passagem) ou sob demanda, uma por vez no tempo ocioso (galeria) */
  private miniatura(d: MachineDef, agora = true): HTMLCanvasElement {
    const cp = document.createElement('canvas'); cp.width = 240; cp.height = 137;
    const pinta = () => { const b = this.base(d); cp.width = b.width; cp.height = b.height; cp.getContext('2d')!.drawImage(b, 0, 0); };
    if (agora || this.miniaturas.has(d.id)) pinta(); else { this.fila.push([d, cp]); this.anda(); }
    return cp;
  }
  private anda() {
    if (this.andando) return; this.andando = true;
    const passo = () => { const x = this.fila.shift(); if (!x) { this.andando = false; return; } if (x[1].isConnected) { const b = this.base(x[0]); x[1].width = b.width; x[1].height = b.height; x[1].getContext('2d')!.drawImage(b, 0, 0); } espera(passo); };
    espera(passo);
  }
  private botao(txt: string, f: () => void, cls = '') { const b = el('button', 'bt ' + cls, txt) as HTMLButtonElement; b.onclick = () => { this.A.som(); f(); }; return b; }

  menu() {
    this.fecha(); this.A.menu(); this.fila = [];
    const p = el('div', 'painel'); p.append(el('h1', 'titulo', 'CINTILA 3'), el('div', 'sub', 'PINBALL DE ATAQUE · 30 MÁQUINAS'));
    if (PLAYTEST) p.append(el('div', 'teste', `<b>VERSÃO DE TESTES · AS 30 MÁQUINAS ESTÃO LIBERADAS.</b> Seus recordes ficam só neste aparelho.
      <ol><li>Escolha uma máquina na galeria e toque em <b>▶ JOGAR</b> (partida normal, sem atalhos).</li><li>Lançar: segure <b>Espaço</b> e solte; no celular, segure a metade direita da tela e solte.</li>
      <li>Palhetas: <b>Z</b> e <b>M</b> (ou ← →); no celular, toque nas metades esquerda e direita.</li><li>Pausar: <b>P</b> ou o botão ❚❚ no canto; da pausa você volta à galeria.</li>
      <li><b>🧪 TESTAR RECURSOS</b> abre chefes, modo mago, multibola e fases especiais na hora. Essas partidas são de demonstração e não contam para recordes.</li></ol>`));
    const abas = el('div', 'abas');
    for (const [id, nome] of [['mapa', 'MÁQUINAS'], ['recordes', 'RECORDES'], ['opcoes', 'OPÇÕES']] as const) abas.append(this.botao(nome, () => { this.aba = id; this.menu(); }, this.aba === id ? 'on' : ''));
    p.append(abas);
    if (this.aba === 'mapa') this.mapa(p); else if (this.aba === 'recordes') this.recordes(p); else this.opcoes(p);
    this.raiz.append(p);
  }
  private mapa(p: HTMLElement) {
    const livres = salvo.desbloqueadas();
    if (!this.sel || !MAQUINAS.some(m => m.id === this.sel && m.n <= livres)) this.sel = PLAYTEST ? MAQUINAS[0].id : MAQUINAS[Math.min(livres, MAQUINAS.length) - 1].id;
    const d = MAQUINAS.find(m => m.id === this.sel)!, et = salvo.eterno(d.id), vit = el('section', 'vitrine'), dentro = el('div'), arte = el('div', 'arte'), info = el('div');
    vit.setAttribute('aria-label', 'Máquina selecionada: ' + d.nome); cores(vit, d);
    arte.append(this.miniatura(d), el('span', 'placa', String(d.n).padStart(2, '0')));
    const ficha = (r: string, v: string) => `<div class="ficha"><b>${r}</b><span>${v}</span></div>`;
    info.innerHTML = `<h2>${d.nome.toUpperCase()}</h2><p class="lema">${d.lema}</p><p class="conceito">${visualDe(d.id).conceito}</p>
      <div class="fichas">${ficha('ASSINATURA · ' + d.assinatura.nome.toUpperCase(), d.assinatura.dica)}${ficha('CHEFE', d.chefe.nome)}${ficha('ANDAR DE CIMA', d.andar.nome)}${ficha('MODO MAGO', d.mago.nome)}</div>
      <p class="recs"><span style="color:#ffd24a;letter-spacing:1px">${estrelas(salvo.mestria(d.id))}</span> · recorde ${num(salvo.recorde(d.id))}${et.tempo ? ' · eterno ' + tempo(et.tempo) : ''}</p>`;
    const l = el('div', 'linha'); l.append(this.botao('▶ JOGAR', () => { this.fecha(); this.A.jogar(d.id, 'normal'); }, 'forte'), this.botao('∞ MODO ETERNO', () => { this.fecha(); this.A.jogar(d.id, 'eterno'); }));
    if (PLAYTEST) l.append(this.botao('🧪 TESTAR RECURSOS', () => this.laboratorio(d), 'lab'));
    info.append(l); dentro.append(arte, info); vit.append(dentro); p.append(vit);
    const g = el('div', 'grade');
    for (const m of MAQUINAS) {
      const tr = m.n > livres, c = el('button', 'cartao' + (tr ? ' tranca' : '') + (m.id === this.sel ? ' sel' : '')) as HTMLButtonElement, dd = el('div'), mini = el('div', 'mini');
      cores(c, m); c.setAttribute('aria-label', m.n + '. ' + m.nome + (tr ? ' (bloqueada: vença a máquina ' + (m.n - 1) + ')' : ''));
      if (tr) c.setAttribute('aria-disabled', 'true');
      mini.append(this.miniatura(m, false)); if (tr) mini.append(el('span', 'cad', '🔒'));
      const ms = salvo.mestria(m.id), barra = '<div class="mestria" aria-label="mestria ' + ms + ' de 10">' + Array.from({ length: 10 }, (_, i) => `<i class="${i < ms ? 'on' : ''}"></i>`).join('') + '</div>';
      dd.append(mini, el('div', 'rod', `<div class="nome"><span class="num">${String(m.n).padStart(2, '0')}</span>${m.nome}</div>` + (tr ? `<span class="fraco">Vença ${String(m.n - 1).padStart(2, '0')} · ${MAQUINAS[m.n - 2].nome}</span>` : barra + `<span class="fraco">recorde ${num(salvo.recorde(m.id))}</span>`)));
      c.append(dd);
      if (!tr) c.onclick = () => { this.A.som(); if (this.sel === m.id) { this.fecha(); this.A.jogar(m.id, 'normal'); } else { this.sel = m.id; this.menu(); } };
      g.append(c);
    }
    p.append(g, el('p', 'dica', PLAYTEST ? 'VERSÃO DE TESTES: TODAS AS MÁQUINAS LIBERADAS' : 'VENÇA O MODO MAGO DE UMA MÁQUINA PARA LIBERAR A PRÓXIMA'));
    if (PLAYTEST) p.append(el('p', 'versao', 'Cintila 3 · playtest R06.2 · build ' + VERSAO));
  }
  private recordes(p: HTMLElement) {
    const cx = el('div', 'caixa'); cx.style.margin = '0 auto'; cx.style.maxWidth = '760px';
    let h = '<table class="tab"><tr><th>Máquina</th><th>Mestria</th><th>Eterno</th><th>Recorde</th></tr>';
    for (const m of MAQUINAS.slice(0, salvo.desbloqueadas())) { const e = salvo.eterno(m.id); h += `<tr><td style="color:${m.paleta.c1}">${m.n}. ${m.nome}</td><td style="color:#ffd24a">${'★'.repeat(salvo.mestria(m.id)) || '–'}</td><td>${e.tempo ? tempo(e.tempo) : '–'}</td><td>${num(salvo.recorde(m.id))}</td></tr>`; }
    cx.innerHTML = h + `</table><p class="fraco" style="font-size:12px">${salvo.partidas()} partidas jogadas · ${salvo.desbloqueadas()} de ${MAQUINAS.length} máquinas liberadas</p>`; p.append(cx);
  }
  private opcoes(p: HTMLElement) {
    const cx = el('div', 'caixa'); cx.style.margin = '0 auto'; const pr = salvo.prefs();
    const chave = (rot: string, k: keyof Prefs) => { const l = el('div', 'opc', `<span>${rot}</span>`); l.append(this.botao(pr[k] ? 'LIGADO' : 'DESLIGADO', () => { pr[k] = !pr[k]; this.A.prefs(pr); this.menu(); }, pr[k] ? 'on' : '')); cx.append(l); };
    chave('Efeitos sonoros', 'som'); chave('Música', 'musica'); chave('Narrador', 'narrador'); chave('Canhoto (inverte os lados do toque)', 'canhoto');
    chave('Transições curtas (entrada da máquina em 0,6 s)', 'curtas');
    const l = el('div', 'opc', '<span>Apagar todo o progresso</span>'); let arma = false;
    const b = this.botao('APAGAR', () => { if (!arma) { arma = true; b.textContent = 'TEM CERTEZA? TOQUE DE NOVO'; this.ocupada = true; return; } salvo.apaga(); this.sel = ''; this.menu(); }); l.append(b); cx.append(l);
    cx.append(el('p', 'fraco', 'Teclado: Z ou ← palheta esquerda · M ou → palheta direita · Espaço lança · ↑ sacode · P pausa<br>Celular: toque nas metades da tela · segure à direita para lançar<br>Com "reduzir movimento" ligado no sistema, as animações ficam curtas e sem piscar.'));
    (cx.lastChild as HTMLElement).style.fontSize = '11px'; (cx.lastChild as HTMLElement).style.lineHeight = '1.7'; p.append(cx);
  }

  /** laboratório (só no playtest): cada botão abre uma partida de demonstração já no estado pedido */
  laboratorio(d: MachineDef) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa'); cx.style.maxWidth = '760px';
    cx.innerHTML = `<h2 style="color:${d.paleta.c1}">🧪 TESTAR RECURSOS · ${d.n}. ${d.nome.toUpperCase()}</h2><p class="fraco">Partida de demonstração: começa já no estado escolhido, usando as regras reais. Não conta para recordes nem para o progresso.</p>`
      + (d.id === 'relampago' ? '<p class="aviso">O Relâmpago sorteia seis poderes por partida. Os nomes aparecem nos selos em volta do chefe, no painel ao lado da mesa e na pausa.</p>' : '')
      + `<p class="fraco"><b>Mecânica-assinatura (${d.assinatura.nome}):</b> ${d.assinatura.dica}. Ela acontece jogando; use "Só jogar" para experimentar.</p>`;
    const g = el('div', 'labs');
    for (const r of [{ id: 'jogar', nome: 'Só jogar (demonstração)', desc: 'Partida de demonstração sem atalho' }, ...RECURSOS]) { const b = this.botao(r.nome, () => { this.fecha(); this.A.demo(d.id, r.id); }); b.innerHTML = r.nome + '<small>' + r.desc + '</small>'; g.append(b); }
    const l = el('div', 'linha'); l.style.justifyContent = 'center'; l.append(this.botao('VOLTAR À GALERIA', () => this.menu()));
    cx.append(g, l); v.append(cx); this.raiz.append(v);
  }
  /** fim de uma partida de demonstração: não grava nada */
  fimDemo(J: Game) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa');
    cx.innerHTML = `<h2>FIM DA DEMONSTRAÇÃO</h2><div class="fraco">${J.def.nome}</div><div class="placar">${num(J.pontos)}</div><p class="fraco">Partidas de demonstração não contam para recordes nem para o progresso.</p>`;
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('🧪 OUTRO RECURSO', () => this.laboratorio(J.def), 'forte'), this.botao('VOLTAR À GALERIA', () => this.menu())); cx.append(l); v.append(cx); this.raiz.append(v);
  }

  pausa(J: Game) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa');
    cx.innerHTML = `<h2>PAUSA</h2><p class="fraco">${J.def.nome} · ${num(J.pontos)} pontos</p><p><b>Evoluções conquistadas</b></p><p>${J.nomesEvolucoes.join('<br>') || '<span class="fraco">nenhuma ainda</span>'}</p>`;
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('CONTINUAR', () => { this.fecha(); this.A.continuar(); }, 'forte'), this.botao('SAIR PARA O MAPA', () => this.menu())); cx.append(l);
    const pod = (J.sigs?.[0] as any)?.poderes as string[] | undefined; if (pod?.length) cx.append(el('p', 'aviso', 'Poderes sorteados nesta partida: ' + pod.join(' · ').toUpperCase()));
    if (PLAYTEST) {
      // som (música, efeitos, narrador) direto da pausa
      const pr = salvo.prefs(), sl = el('div', 'linha'); sl.style.justifyContent = 'center';
      for (const [rot, k] of [['MÚSICA', 'musica'], ['EFEITOS', 'som'], ['NARRADOR', 'narrador']] as [string, keyof Prefs][]) sl.append(this.botao(rot + ': ' + (pr[k] ? 'SIM' : 'NÃO'), () => { pr[k] = !pr[k]; this.A.prefs(pr); this.pausa(J); }, pr[k] ? 'on' : ''));
      cx.append(sl);
      if (this.A.emDemo()) { cx.append(el('p', 'fraco', '🧪 Demonstração: aplicar outro recurso nesta mesma partida')); const g = el('div', 'labs'); for (const r of RECURSOS) { const b = this.botao(r.nome, () => { this.fecha(); this.A.continuar(); this.A.recurso(r.id); }); b.innerHTML = r.nome + '<small>' + r.desc + '</small>'; g.append(b); } cx.append(g); cx.style.maxWidth = '760px'; }
    }
    v.append(cx); this.raiz.append(v);
  }

  fim(J: Game, f: Fecho) {
    if (f.liberou) { this.passagem(J, f); return; }
    this.resultado(J, f);
  }
  /** tela de passagem: a máquina atual recua e a nova desce dos trilhos, com raios na cor dela */
  private passagem(J: Game, f: Fecho) {
    this.fecha(); const nova = MAQUINAS[f.liberou - 1], v = el('div', 'painel vidro'), cx = el('div', 'caixa'); cores(cx, nova);
    cx.style.borderColor = nova.paleta.c1;
    cx.innerHTML = `<div class="sub" style="margin:0">MÁQUINA ${String(nova.n).padStart(2, '0')} DE ${MAQUINAS.length}</div><h2 class="brilho">NOVA MÁQUINA LIBERADA</h2>`;
    const pa = el('div', 'passa'), a = this.miniatura(J.def), b = this.miniatura(nova); a.className = 'velha'; b.className = 'nova';
    pa.append(el('div', 'raios'));
    for (const x of ['22%', '78%']) { const t = el('div', 'trilho'); t.style.left = x; pa.append(t); }
    pa.append(a, b); cx.append(pa, el('h2', '', `<span style="color:${nova.paleta.c1}">${nova.n}. ${nova.nome.toUpperCase()}</span>`), el('p', '', nova.lema), el('p', 'fraco', 'Assinatura: ' + nova.assinatura.dica));
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('▶ JOGAR ' + nova.nome.toUpperCase(), () => { this.fecha(); this.A.jogar(nova.id, 'normal'); }, 'forte'), this.botao('VER RESULTADO', () => this.resultado(J, { ...f, liberou: 0 }))); cx.append(l); v.append(cx); this.raiz.append(v);
  }
  private resultado(J: Game, f: Fecho) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa'), s = J.stats, et = J.modo === 'eterno';
    const comp = et ? (f.recorde ? 'NOVO RECORDE DE TEMPO!' : 'recorde de tempo: ' + tempo(f.anterior)) : f.recorde ? 'NOVO RECORDE!' : 'recorde: ' + num(f.anterior) + ' (faltaram ' + num(Math.max(0, f.anterior - J.pontos)) + ')';
    cx.innerHTML = `<h2>${et ? 'FIM DO MODO ETERNO' : 'FIM DE JOGO'}</h2><div class="fraco">${J.def.nome}</div><div class="placar${f.recorde ? ' recorde' : ''}">${num(J.pontos)}</div>
      <div class="aviso">${comp}</div>${f.subiu ? `<div class="aviso">MESTRIA ${f.mestria} · a próxima partida começa com ${f.mestria} evolução(ões)</div>` : ''}
      <table class="tab"><tr><td>Núcleos derrubados</td><td>${s.nucleos}</td></tr><tr><td>Missões cumpridas</td><td>${s.missoes}</td></tr><tr><td>Subfases e andares</td><td>${s.subfases}</td></tr><tr><td>Evoluções</td><td>${s.evolucoes}</td></tr><tr><td>Nível da máquina</td><td>${J.nivel}</td></tr>${et ? `<tr><td>Tempo · degrau</td><td>${tempo(J.tempoJogo)} · ${J.degrau + 1}</td></tr>` : ''}</table>`;
    if (f.recorde) { const fe = el('div', 'festa'), k = J.def.paleta; for (let i = 0; i < 36; i++) { const c = el('i'); c.style.left = (i * 97 % 100) + '%'; c.style.background = [k.c1, k.c2, k.c3, '#ffd24a'][i % 4]; c.style.animationDuration = (1.6 + (i % 7) * 0.25) + 's'; c.style.animationDelay = (i % 9) * 0.08 + 's'; fe.append(c); } cx.prepend(fe); }
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('JOGAR DE NOVO', () => { this.fecha(); this.A.jogar(J.def.id, J.modo); }, 'forte'), this.botao('TROCAR DE MÁQUINA', () => this.menu())); cx.append(l); v.append(cx); this.raiz.append(v);
  }
}
