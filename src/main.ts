// Bootstrap, laço principal e estados de tela.
import { Audio } from './core/audio';
import { ligaEntrada } from './core/input';
import { DT, H, W, novaBola } from './core/physics';
import { CAM_ANDAR, CAM_MESA, misturaCam } from './core/projection';
import { salvo } from './core/storage';
import { clamp, saida, suave } from './core/vec';
import { Robo } from './game/bot';
import { fecha, libera } from './game/campaign';
import { Game, ModoJogo } from './game/rules';
import { criaArena } from './game/arena';
import { MAQUINAS, porId } from './machines';
import type { MachineDef } from './machines/_schema';
import { Backbox, centroDmd, milhar, relogio, textoDmd } from './render/backbox';
import { Quadro, desenhaBotoes, desenhaGabinete, enquadra, rr } from './render/cabinet';
import { Efeitos } from './render/effects';
import { Pintor, desenhaCampo, pintaBase, semEtapa } from './render/playfield';
import { Tema, novaTela } from './render/tema';
import { Interface } from './ui';
import { aplicaVisual, movimentoReduzido, texturaAndar, texturaMesa } from './visual';
import { Ambiente } from './visual/ambiente';
import { Apresentacao } from './visual/apresentacao';
import { EfeitosVisuais } from './visual/eventos';
import { materialDe, visualDe } from './visual/manifesto';
import { painelDireito, painelEsquerdo } from './visual/paineis';
import { resolucao } from './visual/r05/sprites';

const tela = document.getElementById('tela') as HTMLCanvasElement, c = tela.getContext('2d')!;
const audio = new Audio(), efeitos = new Efeitos(), caixa = new Backbox(), pintor = new Pintor(c);
let prefs = salvo.prefs(); audio.som = prefs.som; audio.musica = prefs.musica; audio.narrador = prefs.narrador;
let Q: Quadro = enquadra(innerWidth, innerHeight), dpr = 1;
let J: Game | null = null, robo: Robo | null = null, def: MachineDef = MAQUINAS[0], modo: ModoJogo = 'normal';
let fundoTela: HTMLCanvasElement | null = null, fundoChave = '';
let texMesa: HTMLCanvasElement | null = null, texSub: HTMLCanvasElement | null = null, subDe: unknown = null;
let estado: 'menu' | 'jogo' | 'pausa' | 'fim' | 'atracao' = 'menu';
let qualidade = 0, lento = 0, folga = 0;
const sem: Record<string, boolean> = {}; // desliga etapas do desenho, só para medir (ganchos de teste)
const toque = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 6;
let acum = 0, ultimo = 0, tempo = 0, rodando = true, parado = 0, liberou = 0, primeiraBola = true;
// Visual R04: camadas de apresentação (só leem o jogo)
const apres = new Apresentacao(); let ambiente: Ambiente | null = null, fxv: EfeitosVisuais | null = null, miniCarta: HTMLCanvasElement | null = null;
const reduz = movimentoReduzido(); apres.reduzido = reduz; apres.curtas = prefs.curtas;

function ajusta() {
  // aparelho de toque já entra no degrau econômico: dpr 1 e bloom sem desfoque. O gargalo lá é rasterização.
  if (toque && qualidade === 0) { qualidade = 2; efeitos.max = 110; efeitos.simples = true; efeitos.semBloom = true; }
  dpr = Math.min(toque ? 1 : (qualidade >= 3 ? 1 : qualidade >= 2 ? 1.5 : 2), devicePixelRatio || 1); tela.width = Math.round(innerWidth * dpr); tela.height = Math.round(innerHeight * dpr);
  Q = enquadra(innerWidth, innerHeight); resolucao(dpr);
}
addEventListener('resize', ajusta); ajusta();

function carrega(d: MachineDef, m: ModoJogo, atracao = false) {
  def = d; modo = m;
  caixa.carrega(d); fundoChave = '';
  J = new Game(d, m, atracao ? 0 : salvo.mestria(d.id), (Date.now() % 100000) + 1);
  // tablado autoral da máquina (cena + acabamento), lendo as posições reais das peças já montadas
  texMesa = texturaMesa(d, J); subDe = null; aplicaVisual(pintor, d.id);
  const vis = visualDe(d.id); ambiente = new Ambiente(vis.ambiente, d.paleta, toque ? 18 : 30); ambiente.reduzido = reduz;
  fxv = new EfeitosVisuais(vis.choque, vis.particula, d.paleta, d.assinatura.tipo); fxv.pecas = () => J?.mesa.pecas || []; fxv.reduzido = reduz; fxv.maxPs = toque ? 40 : 70; miniCarta = null;
  { const ev0 = J.ev.bind(J), Jv = J, fx = fxv; Jv.ev = (tp, b, dd) => { ev0(tp, b, dd); try { fx.observa(tp, b, dd, Jv.m.chefe); } catch { /* a apresentação nunca derruba o jogo */ } }; }
  (J as any).ranking = salvo.ranking(d.id);
  J.saidaSom = atracao ? null : (n, p) => audio.toca(n, p); J.saidaFala = atracao ? null : s => audio.fala(s);
  liberou = 0; primeiraBola = !atracao;
  J.aoVencerMago = g => { if (!atracao) liberou = libera(g) || liberou; };
  J.aoAtalho = g => { if (!atracao) liberou = libera(g) || liberou; };
  J.aoFim = g => { if (atracao) return; const f = fecha(g, liberou); (g as any).ranking = salvo.ranking(d.id); estado = 'fim'; setTimeout(() => ui.fim(g, f), 2600); };
  robo = atracao ? new Robo(J, Math.random, 0.85) : null;
  audio.tema(d.bpm, d.escala, d.raiz); if (!atracao) audio.liga(); else audio.desliga();
  estado = atracao ? 'atracao' : 'jogo'; acum = 0; efeitos.ps.length = 0;
  if (atracao) apres.inicia(d, true), apres.encerra(); else apres.inicia(d, !!J.escolha);
}

const ui = new Interface({
  jogar: (id, m) => { audio.inicia(); carrega(porId(id), m); },
  menu: () => { estado = 'menu'; J = null; audio.desliga(); parado = 0; },
  continuar: () => { if (estado === 'pausa') estado = 'jogo'; },
  prefs: p => { prefs = p; audio.som = p.som; audio.musica = p.musica; audio.narrador = p.narrador; apres.curtas = p.curtas; salvo.gravaPrefs(p); },
  som: () => { audio.inicia(); audio.toca('faixa'); },
  vidro: d => Backbox.vidro(d, 400, 228, 0.6),
});

ligaEntrada(tela, {
  flip: (l, on) => J?.setFlip(l, on),
  lanca: on => { if (!J) return; if (J.escolha) { if (on) J.escolher(J.escolha.i); return; } if (on) { J.carregando = true; J.carga = 0; } else if (J.carregando) { J.carregando = false; J.lancar(J.carga); primeiraBola = false; } },
  sacode: d => { if (J?.escolha) J.escolher(J.escolha.i); else J?.sacudir(d); },
  pausa: () => { if (estado === 'jogo' && J) { estado = 'pausa'; ui.pausa(J); } else if (estado === 'pausa') { estado = 'jogo'; ui.fecha(); } },
  confirma: () => { if (J?.escolha) J.escolher(J.escolha.i); },
  zonaSacudir: () => Q.sacudir, podeLancar: () => !!J && !!J.bolaNaCanaleta() && !J.sub,
  ativo: () => estado === 'jogo',
  acorda: () => { parado = 0; audio.inicia(); apres.pula(); if (estado === 'atracao') { estado = 'menu'; J = null; ui.menu(); } },
}, () => prefs.canhoto);
addEventListener('pointerdown', () => { parado = 0; });
// clique direto numa carta de escolha
tela.addEventListener('pointerdown', e => {
  const E = J?.escolha; if (!E || estado !== 'jogo') return;
  const n = E.opcoes.length, cw = Math.min(150, (Q.mesa.s * W - 20) / n), x0 = Q.mesa.ox + Q.mesa.s * W / 2 - cw * n / 2, y0 = Q.mesa.oy + Q.mesa.s * H * 0.34;
  const i = Math.floor((e.clientX - x0) / cw); if (i >= 0 && i < n && e.clientY > y0 && e.clientY < y0 + cw * 1.5) { J!.escolher(i); e.stopImmediatePropagation(); }
}, true);
document.addEventListener('visibilitychange', () => { if (document.hidden && estado === 'jogo' && J) { estado = 'pausa'; ui.pausa(J); } });

function passo(dt: number) {
  tempo += dt;
  if (estado === 'menu') { parado += dt; if (parado > 20 && !ui.ocupada) { ui.fecha(); const livres = MAQUINAS.slice(0, salvo.desbloqueadas()); carrega(livres[Math.floor(Math.random() * livres.length)], 'normal', true); ui.atracao(); } return; }
  if (!J || estado === 'pausa') return;
  acum = Math.min(acum + dt, DT * 8);
  while (acum >= DT) { robo?.passo(DT); J.update(DT); acum -= DT; }
  if (estado === 'atracao' && J.estado === 'fim') { estado = 'menu'; J = null; ui.menu(); return; }
  efeitos.recebe(J.fxs); efeitos.passo(dt); apres.observa(J.anuncios, J.cores); caixa.recebe(J.anuncios); caixa.passo(dt);
  apres.passo(dt); fxv?.passo(dt); if (ambiente) { ambiente.forca = (J.mago ? 2 : J.multibola ? 1.4 : 1) * (qualidade >= 2 ? 0.6 : 1); ambiente.leve = qualidade >= 2; ambiente.passo(dt); }
  audio.nivel = J.mago ? 4 : J.multibola ? 3 : J.intensidade > 0.3 || J.sub ? 2 : 1; audio.progressao = J.sub ? 1 : 0;
}

function desenha() {
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = innerWidth, h = innerHeight; pintor.t = tempo;
  if (!J || !texMesa) { c.fillStyle = '#05060f'; c.fillRect(0, 0, w, h); return; }
  const k = J.cores, v = Q.mesa, T = J.trans, S = J.sub;
  pintor.bloom = efeitos.semBloom ? null : efeitos.preparaBloom(w, h); pintor.semBrilho = efeitos.semBloom;
  // presença do campo de cima: d = quanto desceu, cm = quanto a câmera já subiu
  let d = 0, cm = 0;
  if (S) {
    if (!T) { d = 1; cm = 1; } else {
      const andar = S.origem === 'andar';
      if (T.dir > 0) { d = andar ? suave((T.t - 0.2) / 0.6) : suave(T.t / 0.5); cm = andar ? suave((T.t - 0.8) / 0.4) : suave((T.t - 0.4) / 0.4); }
      else { const u = 1 - T.t / T.dur; cm = suave(u * 2 - 1); d = suave(u * 2); }
    }
  }
  const tr = J.tremor * 5, tx = tr ? (Math.random() - 0.5) * tr : 0, ty = tr ? (Math.random() - 0.5) * tr : 0;
  // fundo parado (gabinete + tablado + backglass): pintado uma vez por máquina e por tamanho de tela, depois é só uma cópia por quadro
  const chave = def.id + '|' + tela.width + 'x' + tela.height;
  if (!fundoTela || fundoChave !== chave) {
    const [ft, fc] = novaTela(w, h, dpr); desenhaGabinete(fc, Q, k, def.paleta.fundo, caixa.camadas[0] || null, 0, { luz: visualDe(def.id).luz, metal: materialDe(def.id).metal });
    pintaBase(fc, 'mesa:' + def.id, J.mesa, texMesa, v, CAM_MESA, pintor.skin); caixa.desenha(fc, Q.caixa, null, 0);
    fundoTela = ft; fundoChave = chave;
  }
  c.setTransform(1, 0, 0, 1, 0, 0); if (tr) { c.fillStyle = '#03040b'; c.fillRect(0, 0, tela.width, tela.height); }
  if (!sem.fundo) c.drawImage(fundoTela, Math.round(tx * dpr), Math.round(ty * dpr)); else { c.fillStyle = '#03040b'; c.fillRect(0, 0, tela.width, tela.height); }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const vm = { ox: v.ox + tx, oy: v.oy + ty, s: v.s };
  const amb = ambiente && !sem.ambiente ? (g: Pintor) => ambiente!.desenha(g) : undefined;
  if (!sem.mesa) desenhaCampo(pintor, J.mesa, vm, CAM_MESA, { id: 'mesa:' + def.id, tex: texMesa, cores: k, lancador: J.carregando ? J.carga : 0, basePronta: true, ambiente: amb, jogo: J });
  if (!S || T) { efeitos.desenha(pintor); if (!sem.fxv) fxv?.desenha(pintor); }
  if (S && d > 0) {
    if (subDe !== S) { subDe = S; texSub = texturaAndar(def, J, S.nome, S.tipo); }
    c.fillStyle = `rgba(0,0,6,${0.62 * d})`; c.fillRect(v.ox - 30, v.oy - 10, W * v.s + 60, H * v.s + 20);
    const desce = def.andar.desce && S.origem === 'andar' ? -1 : 1;
    const f = 0.9 + 0.1 * cm, vs = { ox: v.ox + W * v.s * (1 - f) / 2 + tx, oy: v.oy - desce * (1 - saida(d)) * (H * v.s + 160) - (1 - cm) * 30 * v.s + ty, s: v.s * f };
    const cam = misturaCam(CAM_MESA, CAM_ANDAR, cm);
    // sombra projetada sobre a mesa principal
    c.fillStyle = `rgba(0,0,0,${0.4 * d * (1 - cm)})`; c.beginPath(); c.ellipse(v.ox + W * v.s / 2, v.oy + H * v.s * (0.35 + 0.3 * d), W * v.s * 0.5, H * v.s * 0.2, 0, 0, Math.PI * 2); c.fill();
    desenhaCampo(pintor, S.campo, vs, cam, { id: 'sub', tex: texSub!, cores: k, passo: cm > 0 && cm < 1 ? 8 : 0, semBase: S.rolagem });
    if (!T) { efeitos.desenha(pintor); fxv?.desenha(pintor); }
  }
  if (!efeitos.semBloom) efeitos.compoeBloom(c, w, h);
  // bordas de estado (chefe, mago, multibola), transições e reflexo do vidro: só nas margens da mesa
  if (!sem.apres) { apres.bordas(c, v, J); apres.transicao(c, v, J); if (!S && qualidade < 2) apres.reflexo(c, v, dpr); }
  const b0 = J.campo.bolas[0];
  if (!sem.caixa) caixa.desenha(c, Q.caixa, estado === 'atracao' ? null : J, tempo, b0 ? clamp(b0.x / W, 0, 1) : 0.5, b0 ? clamp((b0.y - J.campo.camY) / H, 0, 1) : 0.5, atracaoDmd, efeitos.semBloom);
  if (!sem.apres && estado !== 'atracao') apres.letreiro(c, Q.caixa);
  if (Q.painel || Q.esquerda) paineis();
  if (estado !== 'atracao') desenhaBotoes(c, Q, k, J.carregando ? J.carga : 0, !!J.bolaNaCanaleta() && !S, tempo, primeiraBola && J.estado === 'lancar' && !J.escolha && !apres.emEntrada);
  if (J.escolha) cartas();
  // clarão de evento: mais contido que antes (e quase nulo com movimento reduzido) para não ofuscar a bola
  if (J.flash > 0) { c.globalAlpha = Math.min(reduz ? 0.1 : 0.3, J.flash * 0.3); c.fillStyle = J.flashCor; c.fillRect(0, 0, w, h); c.globalAlpha = 1; }
  if (estado === 'jogo') apres.desenhaEntrada(c, v, Q.celular);
  if (T && T.dir > 0 && T.t < 0.2) { c.fillStyle = `rgba(0,0,0,${T.t * 2})`; c.fillRect(0, 0, w, h); }
  if (estado === 'atracao') { c.font = `800 ${Math.max(16, 22 * v.s)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.fillStyle = Math.floor(tempo * 2) % 2 ? '#fff' : k.c1; c.fillText(Q.celular ? 'TOQUE PARA JOGAR' : 'APERTE QUALQUER TECLA', v.ox + W * v.s / 2, v.oy + H * v.s * 0.5); }
}

function atracaoDmd(d: CanvasRenderingContext2D, t: number) {
  const fase = Math.floor(t / 3) % 3;
  if (fase === 0) { centroDmd(d, 'CINTILA 3', 20, 16, Math.floor(t * 3) % 2 ? '#7df9ff' : '#fff'); centroDmd(d, 'PINBALL DE ATAQUE', 46, 7, '#ff6fb5'); }
  else if (fase === 1) { centroDmd(d, 'RECORDES · ' + def.nome.toUpperCase(), 8, 7, '#7df9ff'); const r = salvo.ranking(def.id); if (!r.length) centroDmd(d, 'SEJA O PRIMEIRO', 36, 8, '#fff'); r.slice(0, 4).forEach((p, i) => { textoDmd(d, (i + 1) + '.', 40, 22 + i * 11, 7, '#b48cff', 'right'); textoDmd(d, milhar(p), 170, 22 + i * 11, 7, '#fff', 'right'); }); }
  else { centroDmd(d, salvo.desbloqueadas() + ' DE ' + MAQUINAS.length + ' MÁQUINAS', 20, 8, '#fff'); centroDmd(d, 'APERTE START', 44, 10, Math.floor(t * 4) % 2 ? '#ffd24a' : '#553'); }
}

/** painéis laterais do desktop: redesenhados em 8 Hz num canvas próprio e copiados nos outros quadros */
let painelTela: HTMLCanvasElement | null = null, painelT = -1, painelChave = '';
function paineis() {
  const L = Q.esquerda, R = Q.painel, chave = tela.width + 'x' + tela.height + def.id;
  if (!painelTela || painelChave !== chave || tempo - painelT > 0.125 || tempo < painelT) {
    if (!painelTela || painelChave !== chave) { painelTela = novaTela(innerWidth, innerHeight, dpr)[0]; painelChave = chave; }
    const pc = painelTela.getContext('2d')!; pc.setTransform(dpr, 0, 0, dpr, 0, 0); pc.clearRect(0, 0, innerWidth, innerHeight); painelT = tempo;
    const lancar = J!.bolaNaCanaleta() && !J!.sub && J!.estado === 'lancar' && !J!.escolha ? 'SEGURE ESPAÇO E SOLTE PARA LANÇAR' : '';
    if (R) painelDireito(pc, R, J!, def, modo === 'eterno' ? salvo.eterno(def.id) : null, tempo, (J as any).ranking || [], lancar);
    if (L) { if (!miniCarta) miniCarta = compoe(caixa.camadas); painelEsquerdo(pc, L, J!, def, miniCarta, tempo); }
  }
  // copia só os retângulos dos painéis (não a tela inteira)
  c.setTransform(1, 0, 0, 1, 0, 0);
  for (const r of [L, R]) if (r) { const x = Math.max(0, Math.floor((r.x - 4) * dpr)), y = Math.max(0, Math.floor((r.y - 4) * dpr)), w2 = Math.min(painelTela.width - x, Math.ceil((r.w + 8) * dpr)), h2 = Math.min(painelTela.height - y, Math.ceil((r.h + 8) * dpr)); if (w2 > 0 && h2 > 0) c.drawImage(painelTela, x, y, w2, h2, x, y, w2, h2); }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** junta as 3 camadas do backglass numa imagem só (cartão do painel esquerdo) */
function compoe(cam: HTMLCanvasElement[]) { if (!cam.length) return null; const [t, x] = novaTela(cam[0].width, cam[0].height); for (const k of cam) x.drawImage(k, 0, 0); return t; }

/** painel lateral antigo (mantido para referência; o R04 usa visual/paineis.ts) */
function lateral(r: { x: number; y: number; w: number; h: number }) {
  if (!J || r.h < 120) return; const k = J.cores; let y = r.y + 8; const lh = Math.max(15, Math.min(22, r.h / 17));
  const L = (s: string, cor = '#cdd3f5', neg = false) => { c.font = `${neg ? 800 : 500} ${lh * 0.62}px Orbitron, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = cor; c.fillText(s, r.x + 6, y); y += lh; };
  L(def.nome.toUpperCase() + (modo === 'eterno' ? ' · MODO ETERNO' : '') + ' · NÍVEL ' + J.nivel, k.c1, true);
  L('ASSINATURA: ' + def.assinatura.dica, '#fff');
  y += 4; L('MISSÕES', k.c2, true);
  J.missoes.forEach((m, i) => L((m.feita ? '✔ ' : i === J!.missaoAtiva ? '▶ ' : '· ') + m.nome + (i === J!.missaoAtiva ? '  ' + m.n + '/' + m.meta : ''), m.feita ? k.c1 : i === J!.missaoAtiva ? '#fff' : '#8088aa'));
  y += 4; L('EVOLUÇÕES', k.c2, true); L(J.nomesEvolucoes.join(' · ') || 'nenhuma ainda', '#cdd3f5');
  y += 4; L('TRAVAS ' + J.travas + '/2 · CHEFE ' + Math.max(0, J.m.chefe.vida) + ' · ANDAR ' + (J.andarAceso ? 'ACESO' : 'apagado'), '#cdd3f5');
  if (modo === 'eterno') L('RESERVA ' + J.vidasEternas + ' · TEMPO ' + relogio(J.tempoJogo) + ' · RECORDE ' + relogio(salvo.eterno(def.id).tempo), '#ffd24a');
  y += 4; L('Z / ←  palheta esquerda   ·   M / →  palheta direita', '#8088aa'); L('ESPAÇO lança   ·   ↑ sacode   ·   P pausa', '#8088aa');
}

function cartas() {
  const E = J!.escolha!, k = J!.cores, v = Q.mesa, n = E.opcoes.length, cw = Math.min(150, (v.s * W - 20) / n), x0 = v.ox + v.s * W / 2 - cw * n / 2, y0 = v.oy + v.s * H * 0.34;
  c.fillStyle = 'rgba(0,0,8,0.72)'; c.fillRect(v.ox, v.oy, W * v.s, H * v.s);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.font = `800 ${Math.max(13, 17 * v.s)}px Orbitron, sans-serif`; c.fillText(E.titulo, v.ox + W * v.s / 2, y0 - 34 * v.s);
  E.opcoes.forEach((o, i) => {
    const x = x0 + i * cw + 4, sel = i === E.i, sobe = sel ? -10 * v.s : 0;
    rr(c, x, y0 + sobe, cw - 8, cw * 1.5, 10); c.fillStyle = sel ? k.c2 : '#141830'; c.fill(); c.lineWidth = sel ? 3 : 1.5; c.strokeStyle = sel ? '#fff' : k.c3; c.stroke();
    c.fillStyle = sel ? '#000' : k.c1; c.font = `800 ${Math.max(10, cw * 0.15)}px Orbitron, sans-serif`; c.fillText(o.nome, x + cw / 2 - 4, y0 + sobe + cw * 0.3);
    c.fillStyle = sel ? '#111' : '#cdd3f5'; c.font = `500 ${Math.max(8, cw * 0.1)}px Orbitron, sans-serif`;
    const pal = o.texto.split(' '); let l = '', ly = y0 + sobe + cw * 0.62;
    for (const p of pal) { if (c.measureText(l + p).width > cw - 22) { c.fillText(l, x + cw / 2 - 4, ly); l = ''; ly += cw * 0.14; } l += p + ' '; } c.fillText(l, x + cw / 2 - 4, ly);
  });
  c.fillStyle = k.c1; c.fillRect(v.ox + W * v.s * 0.2, y0 + cw * 1.5 + 18, W * v.s * 0.6 * clamp(E.t / 6, 0, 1), 4);
  c.fillStyle = '#fff'; c.font = `500 ${Math.max(10, 11 * v.s)}px Orbitron, sans-serif`; c.fillText(Q.celular ? 'toque na carta para escolher' : '← → escolhem · ESPAÇO confirma', v.ox + W * v.s / 2, y0 + cw * 1.5 + 40);
}

function quadro(agora: number) {
  const dt = Math.min(0.05, (agora - ultimo) / 1000 || 0); ultimo = agora;
  // qualidade adaptativa: se o quadro passa de 20 ms por um tempo, corta partículas, depois bloom e resolução
  if (estado === 'jogo' || estado === 'atracao') { if (dt > 0.021) lento += dt; else { lento = Math.max(0, lento - dt * 0.5); folga += dt; } if (lento > 1.5 && qualidade < 3) { qualidade++; lento = 0; folga = 0; efeitos.max = [300, 110, 60, 40][qualidade]; efeitos.simples = qualidade >= 2; if (qualidade >= 3) efeitos.semBloom = true; ajusta(); } }
  if (rodando) { passo(dt); desenha(); requestAnimationFrame(quadro); }
}

// espera as fontes (no máximo 1,5 s) para que as miniaturas do mapa já saiam com a letra certa
const fontes = (document as any).fonts;
Promise.race([Promise.all([fontes?.load('8px "Press Start 2P"'), fontes?.load('800 12px Orbitron'), fontes?.load('500 12px Orbitron')]), new Promise(r => setTimeout(r, 1500))]).catch(() => 0).then(() => { document.getElementById('carga')?.remove(); ui.menu(); requestAnimationFrame(quadro); });


// ganchos de teste (seção 12.1)
if (import.meta.env.DEV) {
  (window as any).__cintila = {
    get jogo() { return J; }, efeitos, caixa, sem, semEtapa, get bolas() { return J?.campo.bolas || []; }, get palhetas() { return J?.campo.pas || []; }, get estado() { return estado; },
    setFlip: (i: 0 | 1, on: boolean) => J?.setFlip(i, on),
    step: (dt = DT) => { J?.update(dt); },
    stopLoop: () => { rodando = false; },
    loadMachine: (id: string, m: ModoJogo = 'normal') => { ui.fecha(); carrega(porId(id), m); return !!J; },
    grantUpgrade: () => J?.evolui(),
    enterUpper: (tipo?: any) => { if (!J) return false; const b = J.mesa.bolas[0] || J.novaNaCanaleta(); J.estado = 'jogo'; J.sobe(b, J.m.portal, tipo); return !!J.sub; },
    enterArena: (tipo: string) => { if (!J) return false; const b = J.mesa.bolas[0] || J.novaNaCanaleta(); J.estado = 'jogo'; J.iniciaTrans(criaArena(J, tipo), b, J.m.portal); return !!J.sub; },
    mago: () => J?.iniciaMago(),
    pulaIntro: () => apres.encerra(),
    /** Visual R04: desenha um quadro já (com o laço parado) e diz onde a bola 0 está na tela, em pixels do canvas */
    desenhaJa: () => desenha(),
    bolaNaTela: () => { const b = J?.mesa.bolas[0]; if (!b) return null; pintor.mira(Q.mesa, CAM_MESA, J!.mesa.camY); const [X, Y, K] = pintor.p(b.x, b.y, 7 + b.z); return { x: X * dpr, y: Y * dpr, r: b.r * K * dpr }; },
    get apres() { return apres; },
    /** seção 12.4: tempo de quadro com 4 bolas e 300 partículas */
    medeQuadros: (n = 2000) => {
      if (!J) return null; rodando = false; J.estado = 'jogo';
      while (J.mesa.bolas.length < 4) J.mesa.bolas.push(novaBola(120 + J.mesa.bolas.length * 40, 300, 60, -200));
      const ts: number[] = [];
      for (let i = 0; i < n; i++) {
        while (efeitos.ps.length < 300) { J.fxs.push({ tipo: 'explosao', x: 60 + Math.random() * 280, y: 100 + Math.random() * 500, cor: '#7df9ff', n: 30 }); efeitos.recebe(J.fxs); }
        const t0 = performance.now(); passo(1 / 60); desenha(); ts.push(performance.now() - t0);
      }
      ts.sort((a, b) => a - b); return { mediana: ts[n >> 1], p95: ts[Math.floor(n * 0.95)], max: ts[n - 1] };
    },
  };
}
