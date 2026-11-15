// Telas em HTML por cima do canvas: mapa das máquinas, recordes, opções, pausa, fim de partida e passagem.
import { Prefs, salvo } from './core/storage';
import type { Fecho } from './game/campaign';
import type { Game, ModoJogo } from './game/rules';
import { MAQUINAS } from './machines';
import type { MachineDef } from './machines/_schema';

const CSS = `
#ui *{box-sizing:border-box}
.painel{position:absolute;inset:0;pointer-events:auto;overflow-y:auto;background:radial-gradient(ellipse at 50% 0%,#1a1550 0%,#070818 55%,#030308 100%);padding:max(14px,env(safe-area-inset-top)) 14px 40px;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.vidro{background:rgba(3,4,14,.86);backdrop-filter:blur(3px);display:grid;place-items:center}
.titulo{font-size:clamp(30px,8vw,64px);font-weight:800;letter-spacing:.14em;text-align:center;margin:6px 0 0;background:linear-gradient(90deg,#7df9ff,#b48cff,#ff6fb5,#7df9ff);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:corre 6s linear infinite}
@keyframes corre{to{background-position:300% 0}}
.sub{text-align:center;letter-spacing:.4em;font-size:11px;color:#9aa3d6;margin:2px 0 12px}
.abas{display:flex;gap:8px;justify-content:center;margin:0 0 14px;flex-wrap:wrap}
.bt{font:800 13px Orbitron,sans-serif;letter-spacing:.12em;color:#e8ecff;background:#141836;border:1.5px solid #3b4290;border-radius:10px;padding:11px 16px;cursor:pointer;min-height:44px;touch-action:manipulation}
.bt:hover,.bt:focus-visible{border-color:#7df9ff;outline:none}.bt.on{background:#7df9ff;color:#04050f;border-color:#fff}
.bt.forte{background:linear-gradient(180deg,#ff6fb5,#b4307a);border-color:#ffd0e8;font-size:16px;padding:14px 26px;animation:pisca 1.1s ease-in-out infinite}
@keyframes pisca{50%{box-shadow:0 0 26px #ff6fb5;filter:brightness(1.25)}}
.grade{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;max-width:1100px;margin:0 auto}
@media(max-width:700px){.grade{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}}
.cartao{position:relative;border:1.5px solid #2c3270;border-radius:10px;overflow:hidden;background:#0a0c1e;cursor:pointer;padding:0;color:inherit;font:inherit;text-align:left;touch-action:manipulation}
.cartao canvas{display:block;width:100%;aspect-ratio:400/228}
.cartao:hover,.cartao:focus-visible,.cartao.sel{border-color:#7df9ff;box-shadow:0 0 18px rgba(125,249,255,.45);outline:none}
.cartao .n{position:absolute;top:4px;left:6px;font:800 11px Orbitron;color:#fff;text-shadow:0 1px 3px #000}
.cartao .rod{padding:5px 7px 6px;font-size:10px;line-height:1.35}.cartao .nome{font-weight:800;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.est{color:#ffd24a;letter-spacing:1px}.fraco{color:#8088aa}
.cartao.tranca{cursor:default}.cartao.tranca canvas{filter:grayscale(1) brightness(.28)}
.cartao.tranca::after{content:'🔒';position:absolute;inset:0 0 34px 0;display:grid;place-items:center;font-size:24px}
.detalhe{max-width:1100px;margin:0 auto 14px;border:1.5px solid #7df9ff;border-radius:12px;background:rgba(10,14,40,.9);padding:14px;display:grid;grid-template-columns:minmax(0,300px) 1fr;gap:14px;align-items:center}
@media(max-width:700px){.detalhe{grid-template-columns:1fr}}
.detalhe canvas{width:100%;border-radius:8px;display:block}.detalhe h2{margin:0 0 4px;font-size:22px;letter-spacing:.08em}.detalhe p{margin:3px 0;font-size:12px;color:#cdd3f5;line-height:1.5}
.linha{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
.caixa{max-width:560px;width:100%;border:1.5px solid #3b4290;border-radius:14px;background:#0b0d22;padding:20px;text-align:center}
.caixa h2{margin:0 0 6px;letter-spacing:.14em}.placar{font:800 clamp(30px,9vw,56px) Orbitron;color:#7df9ff;margin:6px 0;text-shadow:0 0 22px rgba(125,249,255,.6)}
.tab{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}.tab td,.tab th{padding:6px 8px;border-bottom:1px solid #1e2350;text-align:left}.tab td:last-child,.tab th:last-child{text-align:right}
.opc{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #1e2350;font-size:13px;text-align:left}
.aviso{color:#ffd24a;font-size:13px;margin:8px 0}
.passa{position:relative;height:min(46vh,300px);overflow:hidden;margin:10px 0}
.passa canvas{position:absolute;left:50%;width:min(86%,420px);border-radius:10px;border:2px solid #7df9ff}
.passa .velha{top:20px;transform:translateX(-50%);animation:recua 1.6s ease-in forwards}
.passa .nova{top:20px;transform:translate(-50%,-140%);animation:desce 1.4s cubic-bezier(.2,1.3,.4,1) 1.2s forwards}
.passa .trilho{position:absolute;top:0;bottom:0;width:4px;background:repeating-linear-gradient(#556 0 8px,#223 8px 16px)}
@keyframes recua{to{transform:translateX(-50%) scale(.3);opacity:0;filter:blur(3px)}}@keyframes desce{to{transform:translate(-50%,0)}}
.toque{position:absolute;inset:0;pointer-events:none}
`;

interface Acoes { jogar(id: string, modo: ModoJogo): void; menu(): void; continuar(): void; prefs(p: Prefs): void; som(): void; vidro(d: MachineDef): HTMLCanvasElement[] }
const el = (tag: string, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const num = (n: number) => Math.round(n).toLocaleString('pt-BR');
const tempo = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const estrelas = (m: number) => '★'.repeat(m) + '<span class="fraco">' + '☆'.repeat(10 - m) + '</span>';

export class Interface {
  private raiz = document.getElementById('ui')!; private aba: 'mapa' | 'recordes' | 'opcoes' = 'mapa'; private sel = ''; private miniaturas = new Map<string, HTMLCanvasElement>();
  ocupada = false;
  constructor(private A: Acoes) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  fecha() { this.raiz.innerHTML = ''; this.ocupada = false; }
  atracao() { this.fecha(); }

  private miniatura(d: MachineDef): HTMLCanvasElement {
    let base = this.miniaturas.get(d.id);
    if (!base) { const cam = this.A.vidro(d); base = document.createElement('canvas'); base.width = cam[0].width; base.height = cam[0].height; const c = base.getContext('2d')!; for (const k of cam) c.drawImage(k, 0, 0); this.miniaturas.set(d.id, base); }
    const cp = document.createElement('canvas'); cp.width = base.width; cp.height = base.height; cp.getContext('2d')!.drawImage(base, 0, 0); return cp;
  }
  private botao(txt: string, f: () => void, cls = '') { const b = el('button', 'bt ' + cls, txt) as HTMLButtonElement; b.onclick = () => { this.A.som(); f(); }; return b; }

  menu() {
    this.fecha(); this.A.menu();
    const p = el('div', 'painel'); p.append(el('h1', 'titulo', 'CINTILA 3'), el('div', 'sub', 'PINBALL DE ATAQUE · 30 MÁQUINAS'));
    const abas = el('div', 'abas');
    for (const [id, nome] of [['mapa', 'MÁQUINAS'], ['recordes', 'RECORDES'], ['opcoes', 'OPÇÕES']] as const) abas.append(this.botao(nome, () => { this.aba = id; this.menu(); }, this.aba === id ? 'on' : ''));
    p.append(abas);
    if (this.aba === 'mapa') this.mapa(p); else if (this.aba === 'recordes') this.recordes(p); else this.opcoes(p);
    this.raiz.append(p);
  }
  private mapa(p: HTMLElement) {
    const livres = salvo.desbloqueadas();
    if (!this.sel || !MAQUINAS.some(m => m.id === this.sel && m.n <= livres)) this.sel = MAQUINAS[Math.min(livres, MAQUINAS.length) - 1].id;
    const d = MAQUINAS.find(m => m.id === this.sel)!, det = el('div', 'detalhe'), info = el('div'), et = salvo.eterno(d.id);
    det.append(this.miniatura(d), info);
    info.innerHTML = `<h2>${d.n}. ${d.nome.toUpperCase()}</h2><p>${d.lema}</p><p><b>Assinatura:</b> ${d.assinatura.dica}</p><p><b>Chefe:</b> ${d.chefe.nome} · <b>Andar de cima:</b> ${d.andar.nome} · <b>Modo mago:</b> ${d.mago.nome}</p><p><span class="est">${estrelas(salvo.mestria(d.id))}</span> · recorde ${num(salvo.recorde(d.id))}${et.tempo ? ' · eterno ' + tempo(et.tempo) : ''}</p>`;
    const l = el('div', 'linha'); l.append(this.botao('▶ JOGAR', () => { this.fecha(); this.A.jogar(d.id, 'normal'); }, 'forte'), this.botao('∞ MODO ETERNO', () => { this.fecha(); this.A.jogar(d.id, 'eterno'); }));
    info.append(l); p.append(det);
    const g = el('div', 'grade');
    for (const m of MAQUINAS) {
      const tr = m.n > livres, c = el('button', 'cartao' + (tr ? ' tranca' : '') + (m.id === this.sel ? ' sel' : '')) as HTMLButtonElement;
      c.setAttribute('aria-label', m.nome + (tr ? ' (bloqueada)' : '')); c.append(this.miniatura(m), el('span', 'n', String(m.n)));
      c.append(el('div', 'rod', `<div class="nome">${m.nome}</div>` + (tr ? `<span class="fraco">vença a máquina ${m.n - 1}</span>` : `<span class="est">${'★'.repeat(salvo.mestria(m.id)) || '<span class="fraco">sem mestria</span>'}</span><br><span class="fraco">${num(salvo.recorde(m.id))}</span>`)));
      if (!tr) c.onclick = () => { this.A.som(); if (this.sel === m.id) { this.fecha(); this.A.jogar(m.id, 'normal'); } else { this.sel = m.id; this.menu(); } };
      g.append(c);
    }
    p.append(g, el('p', 'sub', 'vença o modo mago de uma máquina para liberar a próxima'));
  }
  private recordes(p: HTMLElement) {
    const cx = el('div', 'caixa'); cx.style.margin = '0 auto'; cx.style.maxWidth = '760px';
    let h = '<table class="tab"><tr><th>Máquina</th><th>Mestria</th><th>Eterno</th><th>Recorde</th></tr>';
    for (const m of MAQUINAS.slice(0, salvo.desbloqueadas())) { const e = salvo.eterno(m.id); h += `<tr><td>${m.n}. ${m.nome}</td><td class="est">${'★'.repeat(salvo.mestria(m.id)) || '–'}</td><td>${e.tempo ? tempo(e.tempo) : '–'}</td><td>${num(salvo.recorde(m.id))}</td></tr>`; }
    cx.innerHTML = h + `</table><p class="fraco" style="font-size:12px">${salvo.partidas()} partidas jogadas · ${salvo.desbloqueadas()} de ${MAQUINAS.length} máquinas liberadas</p>`; p.append(cx);
  }
  private opcoes(p: HTMLElement) {
    const cx = el('div', 'caixa'); cx.style.margin = '0 auto'; const pr = salvo.prefs();
    const chave = (rot: string, k: keyof Prefs) => { const l = el('div', 'opc', `<span>${rot}</span>`); l.append(this.botao(pr[k] ? 'LIGADO' : 'DESLIGADO', () => { pr[k] = !pr[k]; this.A.prefs(pr); this.menu(); }, pr[k] ? 'on' : '')); cx.append(l); };
    chave('Efeitos sonoros', 'som'); chave('Música', 'musica'); chave('Narrador', 'narrador'); chave('Canhoto (inverte os lados do toque)', 'canhoto');
    const l = el('div', 'opc', '<span>Apagar todo o progresso</span>'); let arma = false;
    const b = this.botao('APAGAR', () => { if (!arma) { arma = true; b.textContent = 'TEM CERTEZA? TOQUE DE NOVO'; this.ocupada = true; return; } salvo.apaga(); this.sel = ''; this.menu(); }); l.append(b); cx.append(l);
    cx.append(el('p', 'fraco', 'Teclado: Z ou ← palheta esquerda · M ou → palheta direita · Espaço lança · ↑ sacode · P pausa<br>Celular: toque nas metades da tela · segure à direita para lançar'));
    (cx.lastChild as HTMLElement).style.fontSize = '11px'; (cx.lastChild as HTMLElement).style.lineHeight = '1.7'; p.append(cx);
  }

  pausa(J: Game) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa');
    cx.innerHTML = `<h2>PAUSA</h2><p class="fraco">${J.def.nome} · ${num(J.pontos)} pontos</p><p><b>Evoluções conquistadas</b></p><p>${J.nomesEvolucoes.join('<br>') || '<span class="fraco">nenhuma ainda</span>'}</p>`;
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('CONTINUAR', () => { this.fecha(); this.A.continuar(); }, 'forte'), this.botao('SAIR PARA O MAPA', () => this.menu())); cx.append(l); v.append(cx); this.raiz.append(v);
  }

  fim(J: Game, f: Fecho) {
    if (f.liberou) { this.passagem(J, f); return; }
    this.resultado(J, f);
  }
  /** tela de passagem: a máquina atual recua e a nova desce dos trilhos */
  private passagem(J: Game, f: Fecho) {
    this.fecha(); const nova = MAQUINAS[f.liberou - 1], v = el('div', 'painel vidro'), cx = el('div', 'caixa');
    cx.innerHTML = `<h2 style="color:#ffd24a">NOVA MÁQUINA LIBERADA</h2>`;
    const pa = el('div', 'passa'), a = this.miniatura(J.def), b = this.miniatura(nova); a.className = 'velha'; b.className = 'nova';
    for (const x of ['22%', '78%']) { const t = el('div', 'trilho'); t.style.left = x; pa.append(t); }
    pa.append(a, b); cx.append(pa, el('h2', '', `${nova.n}. ${nova.nome.toUpperCase()}`), el('p', '', nova.lema), el('p', 'fraco', 'Assinatura: ' + nova.assinatura.dica));
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('▶ JOGAR ' + nova.nome.toUpperCase(), () => { this.fecha(); this.A.jogar(nova.id, 'normal'); }, 'forte'), this.botao('VER RESULTADO', () => this.resultado(J, { ...f, liberou: 0 }))); cx.append(l); v.append(cx); this.raiz.append(v);
  }
  private resultado(J: Game, f: Fecho) {
    this.fecha(); const v = el('div', 'painel vidro'), cx = el('div', 'caixa'), s = J.stats, et = J.modo === 'eterno';
    const comp = et ? (f.recorde ? 'NOVO RECORDE DE TEMPO!' : 'recorde de tempo: ' + tempo(f.anterior)) : f.recorde ? 'NOVO RECORDE!' : 'recorde: ' + num(f.anterior) + ' (faltaram ' + num(Math.max(0, f.anterior - J.pontos)) + ')';
    cx.innerHTML = `<h2>${et ? 'FIM DO MODO ETERNO' : 'FIM DE JOGO'}</h2><div class="fraco">${J.def.nome}</div><div class="placar">${num(J.pontos)}</div>
      <div class="aviso">${comp}</div>${f.subiu ? `<div class="aviso">MESTRIA ${f.mestria} · a próxima partida começa com ${f.mestria} evolução(ões)</div>` : ''}
      <table class="tab"><tr><td>Núcleos derrubados</td><td>${s.nucleos}</td></tr><tr><td>Missões cumpridas</td><td>${s.missoes}</td></tr><tr><td>Subfases e andares</td><td>${s.subfases}</td></tr><tr><td>Evoluções</td><td>${s.evolucoes}</td></tr><tr><td>Nível da máquina</td><td>${J.nivel}</td></tr>${et ? `<tr><td>Tempo · degrau</td><td>${tempo(J.tempoJogo)} · ${J.degrau + 1}</td></tr>` : ''}</table>`;
    const l = el('div', 'linha'); l.style.justifyContent = 'center';
    l.append(this.botao('JOGAR DE NOVO', () => { this.fecha(); this.A.jogar(J.def.id, J.modo); }, 'forte'), this.botao('TROCAR DE MÁQUINA', () => this.menu())); cx.append(l); v.append(cx); this.raiz.append(v);
  }
}
