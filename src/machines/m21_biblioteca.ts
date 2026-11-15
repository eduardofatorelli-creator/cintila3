import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'biblioteca', n: 21, nome: 'Biblioteca Infinita', lema: 'A cada livro aberto, escolha uma de três cartas',
  paleta: { c1: '#ffd9a0', c2: '#b0703c', c3: '#7fd1ff', fundo: ['#0f0906', '#2c1a10', '#140c08'] },
  gravidade: 1.0, bpm: 94, escala: [0, 2, 3, 5, 7, 8, 10], raiz: 45,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(211); t.estantes(24, 110, 90, 220, 6, 0.6); t.estantes(266, 110, 90, 220, 6, 0.6);
    t.estantes(60, 600, 260, 100, 3, 0.4); t.xadrez(120, 380, 140, 180, 6, '#3a2416', 0.5);
    t.brilho(190, 296, 140, t.p.c1, 0.3); t.aneis(190, 296, 70, 2, t.p.c1, 0.5, 2); t.espiral(190, 456, 50, 3, t.p.c3, 2, 0.4);
    for (let i = 0; i < 5; i++) t.poligono(120 + i * 35, 470 + (i % 2) * 14, 13, 4, t.p.c1, 0.35, 0.2 * i);
    t.texto('BIBLIOTECA', 190, 548, 20, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(4).estantes(0, 0, 400, 228, 7, 0.7); t.brilho(200, 110, 200, '#000', 0.6);
    t.camada(1); t.arcos(200, 228, 150, ['#2c1a10', '#1c100a'], 30, 1); t.brilho(200, 150, 120, t.p.c1, 0.7); t.espiral(200, 150, 70, 4, t.p.c1, 3, 0.6);
    t.camada(2); t.poligono(200, 160, 46, 4, '#f3e3c0', 1, Math.PI / 4); t.listras(170, 146, 60, 3, 1, '#2c1a10', '#2c1a10', 0.7); t.listras(170, 158, 60, 3, 1, '#2c1a10', '#2c1a10', 0.7); t.listras(170, 170, 40, 3, 1, '#2c1a10', '#2c1a10', 0.7); t.texto('BIBLIOTECA INFINITA', 200, 28, 24, t.p.c1, 0.95);
  },
  chefe: { nome: 'Bibliotecário', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'bloco', pontas: 6, olhos: 2, cor: '#7a4a2a' } },
  assinatura: { tipo: 'cartas', nome: 'Carta na Mão', dica: 'Derrube o banco de alvos para abrir um livro e escolher 1 de 3 cartas' },
  andar: { nome: 'Mezanino', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'muralha' },
  missoes: ['Escadas rolantes', 'Páginas soltas', 'Volta ao saguão', 'Lombadas', 'Silencie o bibliotecário'],
  mago: { nome: 'Último Capítulo', duracao: 48, regra: { tipo: 'golpes', meta: 28 } },
  vozes: { inicio: 'Silêncio. Abra um livro e escolha.', chefe: 'O bibliotecário pediu silêncio.', mago: 'Último capítulo! Leia tudo!', fim: 'O livro se fecha.' },
};
export default m;
