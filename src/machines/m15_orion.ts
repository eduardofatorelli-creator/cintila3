import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'orion', n: 15, nome: 'Estação Órion', lema: 'O braço robótico pega a bola e arremessa onde você mirar',
  paleta: { c1: '#6ee7ff', c2: '#e6ecff', c3: '#ff8a3d', fundo: ['#03050c', '#0c1830', '#050812'] },
  gravidade: 0.94, bpm: 116, escala: [0, 2, 5, 7, 9], raiz: 47,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(151).estrelas(180); t.circuito(22, t.p.c1, 0.3); t.grade(34, t.p.c2, 0.08);
    t.aneis(190, 262, 110, 2, t.p.c2, 0.5, 6); t.aneis(190, 456, 64, 3, t.p.c3, 0.5, 2);
    t.poligono(190, 262, 60, 6, t.p.c1, 0.35, 0, 3); t.listras(60, 690, 260, 8, 20, t.p.c3, '#111', 0.5);
    t.disco(70, 140, 30, '#1c3d6e', 0.9); t.brilho(70, 140, 60, t.p.c1, 0.4); t.colunas(640, 4, 40, '#22304f', 0.5); t.texto('ÓRION', 190, 548, 28, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(5).estrelas(200); t.disco(60, 250, 150, '#1c3d6e'); t.brilho(60, 250, 200, t.p.c1, 0.4);
    t.camada(1); t.aneis(230, 110, 80, 1, t.p.c2, 1, 14); t.disco(230, 110, 34, '#cfd8f5'); t.listras(120, 104, 220, 12, 11, '#9aa6cf', '#cfd8f5', 1); t.listras(224, 10, 12, 200, 1, '#9aa6cf', '#9aa6cf', 1);
    t.camada(2); t.listras(60, 60, 60, 26, 6, '#27408a', '#1b2c66', 1); t.listras(330, 150, 60, 26, 6, '#27408a', '#1b2c66', 1); t.disco(230, 110, 12, t.p.c3); t.texto('ESTAÇÃO ÓRION', 200, 208, 28, t.p.c1, 0.95);
  },
  chefe: { nome: 'IA-Órion', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'olho', pontas: 6, olhos: 1, cor: '#ff5533' } },
  assinatura: { tipo: 'braco', nome: 'Braço Robótico', dica: 'O braço pega a bola: aperte uma palheta para arremessar na mira' },
  andar: { nome: 'Anel de Gravidade', tipo: 'chefao', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Acoplagem', 'Chuva de detritos', 'Volta à estação', 'Painéis solares', 'Desligue a IA'],
  mago: { nome: 'Protocolo Zero', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'Bem-vindo a bordo. O braço está online.', chefe: 'A inteligência central assumiu.', mago: 'Protocolo zero! Tudo liberado!', fim: 'Estação em silêncio.' },
};
export default m;
