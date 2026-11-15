import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'circo', n: 18, nome: 'Circo Gravitacional', lema: 'O canhão lança a bola direto para o andar de cima',
  paleta: { c1: '#ffd84d', c2: '#ff3b4e', c3: '#4de1c1', fundo: ['#14040a', '#3d0a1c', '#1a060e'] },
  gravidade: 0.95, bpm: 124, escala: [0, 2, 4, 5, 7, 9, 10], raiz: 46,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.semente(181); t.raios(190, 760, 760, 26, t.p.c2, 0.2, 0.5); t.raios(190, 760, 760, 26, '#fff', 0.06, 0.2);
    t.aneis(190, 456, 80, 3, t.p.c1, 0.6, 3); t.listras(40, 690, 300, 12, 15, t.p.c2, '#fff', 0.35);
    t.arcos(190, 130, 150, [t.p.c2, t.p.c1, t.p.c3], 8, 0.45); t.tenda(190, 318, 120, 60, t.p.c2, '#fff', 0.35);
    for (let i = 0; i < 12; i++) t.poligono(t.rr(40, 340), t.rr(140, 680), 6, 5, t.p.c1, 0.45, t.rr(0, 6));
    t.texto('CIRCO', 190, 548, 30, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.raios(200, 228, 420, 24, t.p.c2, 0.35, 0.5); t.semente(4).estrelas(60, t.p.c1);
    t.camada(1); t.tenda(200, 228, 330, 190, t.p.c2, '#fff4e0', 1); t.arcos(200, 228, 60, ['#14040a'], 60, 1);
    t.camada(2); t.aneis(90, 120, 26, 1, t.p.c1, 1, 4); t.aneis(310, 120, 26, 1, t.p.c3, 1, 4); t.listras(88, 40, 3, 60, 1, '#fff', '#fff', 0.8); t.listras(309, 40, 3, 60, 1, '#fff', '#fff', 0.8); for (let i = 0; i < 9; i++) t.poligono(t.rr(20, 380), t.rr(10, 90), 7, 5, t.p.c1, 0.9, t.rr(0, 6)); t.texto('CIRCO GRAVITACIONAL', 200, 206, 23, t.p.c1, 0.95);
  },
  chefe: { nome: 'Mestre de Pista', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'mascara', pontas: 1, olhos: 2, cor: '#ffe9c9' } },
  assinatura: { tipo: 'canhaoAndar', nome: 'Canhão Humano', dica: 'Entre no canhão e dispare: com o andar aceso, ele lança direto lá para cima' },
  andar: { nome: 'Trapézio', tipo: 'premium', variacao: 'bonus', gatilho: 'bater3', premium: 'criaturas' },
  missoes: ['Corda bamba', 'Malabares', 'Volta no picadeiro', 'Argolas de fogo', 'Derrube a cartola'],
  mago: { nome: 'Grande Final', duracao: 48, regra: { tipo: 'golpes', meta: 28 } },
  vozes: { inicio: 'Respeitável público! O canhão está carregado.', chefe: 'O mestre de pista entrou.', mago: 'Grande final! Aplausos!', fim: 'O picadeiro se esvazia.' },
};
export default m;
