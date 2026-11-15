import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'relampago', n: 30, nome: 'O Relâmpago', lema: 'A máquina final: seis poderes das anteriores, sorteados a cada partida',
  paleta: { c1: '#fff36b', c2: '#8ab4ff', c3: '#ffffff', fundo: ['#03030a', '#141a3d', '#06071a'] },
  gravidade: 1.1, bpm: 150, escala: [0, 2, 3, 5, 7, 8, 11], raiz: 40,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(301).estrelas(140); t.ondas(70, 18, 5, '#2a3566', 0.7, 16, 16);
    t.relampago(190, 60, 190, 290, t.p.c1, 5, 0.8); t.relampago(60, 120, 150, 440, t.p.c2, 2.5, 0.6); t.relampago(320, 120, 230, 440, t.p.c2, 2.5, 0.6);
    t.raios(190, 300, 300, 24, t.p.c1, 0.09, 0.3); t.aneis(190, 300, 80, 4, t.p.c1, 0.5, 2); t.aneis(190, 456, 64, 3, t.p.c2, 0.45);
    t.colunas(720, 6, 110, '#22284f', 0.55); t.poligono(190, 620, 50, 3, t.p.c1, 0.2); t.brilho(190, 300, 200, t.p.c1, 0.2); t.texto('RELÂMPAGO', 190, 548, 22, t.p.c1, 0.65);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(2).ondas(10, 16, 7, '#2a3566', 0.9, 22, 14); t.brilho(200, 60, 240, t.p.c2, 0.5);
    t.camada(1); t.semente(5).colunas(228, 6, 110, '#e6ebff', 0.9); t.poligono(200, 96, 150, 3, '#e6ebff', 0.9); t.listras(60, 112, 280, 10, 1, '#c9d2f5', '#c9d2f5', 1);
    t.camada(2); t.semente(9).relampago(200, 0, 200, 170, t.p.c1, 8, 1); t.relampago(200, 60, 120, 150, t.p.c1, 4, 0.9); t.relampago(200, 80, 290, 160, t.p.c1, 4, 0.9); t.texto('O RELÂMPAGO', 200, 206, 32, t.p.c1, 0.95);
  },
  chefe: { nome: 'O Primeiro', vidas: [4, 5, 6], modo: 'orbita', forma: { tipo: 'estrela', pontas: 12, olhos: 3, cor: '#fff36b' } },
  assinatura: { tipo: 'relampago', nome: 'Seis Poderes', dica: 'Seis mecânicas das outras máquinas, sorteadas a cada partida' },
  andar: { nome: 'Olimpo', tipo: 'tunel', variacao: 'chefao', gatilho: 'bater3' },
  missoes: ['Escadaria do céu', 'Trovoada', 'Volta ao trono', 'Colunas', 'Encare O Primeiro'],
  mago: { nome: 'Trovão dos Trovões', duracao: 48, regra: { tipo: 'golpes', meta: 32 } },
  vozes: { inicio: 'Você chegou ao topo. Tudo o que aprendeu vale agora.', chefe: 'O Primeiro abriu os olhos.', mago: 'Trovão dos trovões!', fim: 'O céu se cala. Você foi longe.' },
};
export default m;
