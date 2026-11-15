// O contrato de dados de uma máquina. Uma máquina nova é só mais um arquivo deste tipo.
import type { ChefeForma } from '../game/elements';
import type { Tema } from '../render/tema';

export type ElDef = { t: string; x: number; y: number; [k: string]: any };
export type LayoutDef = {
  bumpers: number[][];              // [x, y, raio?]
  chefe: [number, number];
  alvos: number[][];                // [x, y, ângulo]
  banco: [number, number, number, number]; // x, y, dx, dy entre alvos
  giro?: 'esq' | 'dir';
  extras?: ElDef[];
};
export type ChefeDef = { nome: string; vidas: [number, number, number]; modo: 'fixo' | 'vaga' | 'orbita' | 'salta'; forma: ChefeForma };
export type AssinaturaDef = { tipo: string; nome: string; dica: string; [k: string]: any };
export type TipoAndar = 'bonus' | 'premium' | 'chefao' | 'tunel';
export type AndarDef = {
  nome: string; tipo: TipoAndar; variacao: TipoAndar;
  gatilho: 'bater3' | 'passar5' | 'tunel';
  premium?: 'muralha' | 'criaturas' | 'holofotes';
  desce?: boolean;
};
export type ModoMago = { tipo: 'golpes' | 'rampas' | 'chefe' | 'bumpers'; meta: number };

export type MachineDef = {
  id: string; n: number; nome: string; lema: string;
  paleta: { c1: string; c2: string; c3: string; fundo: [string, string, string] };
  gravidade: number; bpm: number; escala: number[]; raiz: number;
  layout: LayoutDef;
  arte: (c: CanvasRenderingContext2D, t: Tema) => void;
  vidro: (c: CanvasRenderingContext2D, t: Tema) => void;
  chefe: ChefeDef;
  assinatura: AssinaturaDef;
  andar: AndarDef;
  missoes: [string, string, string, string, string];
  mago: { nome: string; duracao: number; regra: ModoMago };
  vozes: { inicio: string; chefe: string; mago: string; fim: string };
};

/** Quatro disposições de base para a metade de cima; a parte de baixo é sempre a validada. */
export function disposicao(v: 'A' | 'B' | 'C' | 'D', extras: ElDef[] = []): LayoutDef {
  const base: Record<string, LayoutDef> = {
    A: { bumpers: [[150, 170], [230, 170], [190, 215]], chefe: [190, 300], alvos: [[264, 262, 0.7], [250, 240, 0.7]], banco: [116, 262, 14, -12], giro: 'esq' },
    B: { bumpers: [[138, 186], [190, 160], [242, 186]], chefe: [190, 296], alvos: [[116, 262, -0.7], [130, 240, -0.7]], banco: [264, 262, -14, -12], giro: 'dir' },
    C: { bumpers: [[190, 150, 15], [152, 196, 15], [228, 196, 15], [190, 238, 13]], chefe: [190, 318], alvos: [[270, 268, 0.7], [112, 268, -0.7]], banco: [176, 372, 14, 0], giro: 'esq' },
    D: { bumpers: [[128, 200, 19], [252, 200, 19], [190, 150, 14]], chefe: [190, 262], alvos: [[262, 300, 0.9], [118, 300, -0.9]], banco: [176, 352, 14, 0], giro: 'dir' },
  };
  return { ...base[v], extras };
}
