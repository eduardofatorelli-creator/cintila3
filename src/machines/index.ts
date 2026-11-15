import type { MachineDef } from './_schema';
import m01 from './m01_aurora';

export const MAQUINAS: MachineDef[] = [m01];
export const porId = (id: string) => MAQUINAS.find(m => m.id === id) || MAQUINAS[0];
