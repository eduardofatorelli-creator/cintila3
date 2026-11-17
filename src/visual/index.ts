// Ponto de entrada do Visual R04: monta o tablado de cada máquina e aplica o material ao Pintor.
// A apresentação só lê o jogo; nada aqui escreve em regra, física ou progresso.
import { H, W } from '../core/physics';
import type { Game } from '../game/rules';
import type { MachineDef } from '../machines/_schema';
import type { Pintor } from '../render/playfield';
import { Tema, novaTela } from '../render/tema';
import { CENAS, InfoMesa, acabamento } from './cenas';
import { MATERIAIS, visualDe } from './manifesto';
import { Pincel, alfa } from './pincel';
import { skinDe } from './r05/skin';
import './r05/aurora';

/** o que as cenas precisam saber da mesa real (posições lidas das peças montadas) */
export function infoMesa(J: Game): InfoMesa {
  const M = J.m;
  return {
    bumpers: M.bumpers.map(b => ({ x: b.x, y: b.y, r: b.r })),
    chefe: { x: M.chefe.x, y: M.chefe.y },
    rampas: M.rampas.map(r => ({ mx: r.mx, lado: r.lado, caminho: r.caminho })),
    orbitas: M.orbitas.map(o => o.x),
    pecas: J.mesa.pecas.filter((p: any) => typeof p.x === 'number') as any,
    sig: J.def.assinatura.tipo,
  };
}

/** textura do tablado: cena autoral da máquina + acabamento comum. Cai na arte antiga se a cena faltar. */
export function texturaMesa(d: MachineDef, J: Game, escala = 2): HTMLCanvasElement {
  const [t, c] = novaTela(W, H, escala), cena = CENAS[d.id], v = visualDe(d.id), p = new Pincel(c, d.paleta, W, H);
  const sk = skinDe(d.id);
  if (sk) { try { sk.tablado(p, infoMesa(J)); return t; } catch (e) { console.warn(e); } }
  try { if (cena) cena(p, infoMesa(J)); else d.arte(c, new Tema(c, d.paleta, W, H)); } catch (e) { console.warn(e); d.arte(c, new Tema(c, d.paleta, W, H)); }
  acabamento(p, infoMesa(J), v.luz);
  return t;
}

/** textura dos campos de cima (andar, chefão, subfases): a cena da máquina, apagada, com o emblema do tipo de fase */
export function texturaAndar(d: MachineDef, J: Game, titulo: string, tipo: string): HTMLCanvasElement {
  const [t, c] = novaTela(W, H, 1.5), p = new Pincel(c, d.paleta, W, H), k = d.paleta, cena = CENAS[d.id];
  const sk = skinDe(d.id), pinta = sk ? sk.tablado : cena;
  if (pinta) { pinta(p, infoMesa(J)); p.ceu([[0, 'rgba(2,3,10,0.62)'], [1, 'rgba(2,3,10,0.8)']]); } else p.fundo();
  const cor = tipo === 'chefao' ? '#ff4466' : tipo === 'tunel' ? k.c2 : tipo === 'premium' ? k.c3 : k.c1;
  // piso em grade com luz central: lê como "outro andar" da mesma máquina
  p.grade(34, cor, 0.12, 60);
  p.nevoa(190, 300, 220, 200, cor, 0.25, 'lighter');
  if (tipo === 'chefao') { for (let i = 0; i < 8; i++) { const q = i / 8 * Math.PI * 2; p.chevron(190 + Math.cos(q) * 150, 300 + Math.sin(q) * 150, 9, q + Math.PI / 2, cor, 0.35); } p.aneis(190, 300, 170, 3, cor, 0.4, 2); }
  else if (tipo === 'premium') { p.roseta(190, 300, 120, 12, cor, 0.35, 1.5); }
  else if (tipo === 'bonus') { for (let i = 0; i < 12; i++) p.cintila(60 + (i % 4) * 90, 140 + Math.floor(i / 4) * 120, 8, cor, 0.5); p.aneis(190, 300, 150, 2, cor, 0.35, 2); }
  else { p.espiral(190, 300, 180, 4, cor, 3, 0.3); }
  p.letreiro(titulo.split(' · ')[0], 190, 470, 22, cor, alfa('#000000', 0.6), 0.75);
  p.texto(titulo.split(' · ')[1] || tipo.toUpperCase(), 190, 496, 12, '#ffffff', 0.55);
  p.calma(560, 0.45); p.grao(0.06); p.vinheta(0.5);
  return t;
}

/** liga o material, a forma dos insertos e a luz da máquina no Pintor */
export function aplicaVisual(g: Pintor, id: string) { const v = visualDe(id); g.mat = MATERIAIS[v.material]; g.insert = v.insert; g.luzCor = v.luz; g.skin = skinDe(id); }

/** preferência de movimento reduzido do sistema */
export const movimentoReduzido = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
