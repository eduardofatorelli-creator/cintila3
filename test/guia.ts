// Gera a tabela do guia das 30 máquinas a partir dos dados reais (MachineDef + manifesto visual).
import { MAQUINAS } from '../src/machines';
import { VISUAIS } from '../src/visual/manifesto';
const L: string[] = [];
for (const m of MAQUINAS) {
  const v = VISUAIS[m.id];
  L.push(`### ${String(m.n).padStart(2, '0')}. ${m.nome} (\`${m.id}\`)\n`);
  L.push(`- **Conceito:** ${v.conceito}.`);
  L.push(`- **Mecânica real:** ${m.assinatura.nome} — ${m.assinatura.dica}. Chefe ${m.chefe.nome}; andar de cima ${m.andar.nome} (${m.andar.tipo}); modo mago ${m.mago.nome}.`);
  L.push(`- **Material e peças:** ${v.material} (tampas dos bumpers, trilhos, pivôs); insertos em forma de ${v.insert}; paleta ${m.paleta.c1} / ${m.paleta.c2} / ${m.paleta.c3}.`);
  L.push(`- **Luz e camada viva:** luz dominante ${v.luz}; ambiente animado "${v.ambiente}".`);
  L.push(`- **Acertos:** choque "${v.choque}" nos bumpers e golpes; partícula "${v.particula}".`);
  L.push(`- **Efeito ligado à mecânica:** ${v.efeito}.\n`);
}
console.log(L.join('\n'));
