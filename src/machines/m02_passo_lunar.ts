import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'passo-lunar', n: 2, nome: 'Passo Lunar', lema: 'Dance na gravidade baixa e acerte no compasso',
  paleta: { c1: '#ffe14d', c2: '#ff4fd8', c3: '#4dd2ff', fundo: ['#12041f', '#2a0a4a', '#0a0420'] },
  gravidade: 0.88, bpm: 120, escala: [0, 2, 3, 5, 7, 9, 10], raiz: 43,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(21).estrelas(120, '#fff', 0, 260);
    t.xadrez(40, 380, 300, 300, 8, t.p.c2, 0.28); t.xadrez(40, 380, 300, 300, 4, t.p.c3, 0.14);
    t.raios(190, 296, 300, 16, t.p.c1, 0.13, 0.35); t.aneis(190, 296, 90, 4, t.p.c3, 0.5, 2);
    t.lua(310, 110, 30, '#f5f0ff', 0); t.disco(300, 102, 6, '#cfc6ee', 0.6); t.disco(320, 122, 4, '#cfc6ee', 0.6);
    t.listras(60, 690, 260, 10, 13, t.p.c1, t.p.c2, 0.45); t.nota(90, 250, 12, t.p.c1); t.nota(286, 330, 10, t.p.c3);
    t.texto('PASSO LUNAR', 190, 548, 20, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(4).estrelas(140); t.raios(200, 70, 420, 18, t.p.c2, 0.22, 0.4);
    t.camada(1); t.lua(200, 250, 150, '#e9e2ff', 0); t.xadrez(0, 170, 400, 60, 16, t.p.c2, 0.35); t.aneis(200, 66, 30, 3, t.p.c1, 0.9, 2);
    t.camada(2); t.disco(200, 66, 22, '#f2f2ff', 0.95); t.nota(70, 110, 16, t.p.c1, 0.9); t.nota(320, 90, 13, t.p.c3, 0.9); t.texto('PASSO LUNAR', 200, 150, 34, t.p.c1, 0.95);
  },
  chefe: { nome: 'Globo de Espelhos', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'globo', pontas: 6, olhos: 2, cor: '#e8e8ff' } },
  assinatura: { tipo: 'compasso', nome: 'No Compasso', dica: 'Acertos no tempo da música valem o dobro' },
  andar: { nome: 'Palco Suspenso', tipo: 'premium', variacao: 'bonus', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Giro nas rampas', 'Pista cheia', 'Volta na pista', 'Luzes da pista', 'Quebre o globo'],
  mago: { nome: 'Febre Lunar', duracao: 48, regra: { tipo: 'golpes', meta: 22 } },
  vozes: { inicio: 'A pista está aberta. Sinta o compasso.', chefe: 'O globo de espelhos girou.', mago: 'Febre lunar! Dance!', fim: 'A música parou. Volte amanhã.' },
};
export default m;
