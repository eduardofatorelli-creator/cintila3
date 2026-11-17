// Playtest público (homologação). Ativado SÓ quando a build é feita com VITE_PLAYTEST=1.
// Na build oficial (sem a variável) tudo isto fica desligado: desbloqueio normal, sem laboratório.
export const PLAYTEST = import.meta.env?.VITE_PLAYTEST === '1';
/** commit da build (mostrado no rodapé do playtest para conferir que o código publicado é o do repositório) */
export const VERSAO = (import.meta.env?.VITE_COMMIT as string) || 'dev';

/** recursos do laboratório: cada um usa um método real do jogo (nada de animação simulada) */
export interface Recurso { id: string; nome: string; desc: string }
export const RECURSOS: Recurso[] = [
  { id: 'chefao', nome: 'Confronto com o chefe', desc: 'Sobe ao andar de cima no modo chefão' },
  { id: 'chefeFase', nome: 'Derrubar fase do chefe', desc: 'Derruba a fase atual do chefe na mesa' },
  { id: 'chefeUltima', nome: 'Chefe na última vida', desc: 'O próximo golpe derruba o núcleo' },
  { id: 'mago', nome: 'Modo mago', desc: 'Começa o modo mago da máquina' },
  { id: 'multibola', nome: 'Multibola', desc: 'Trava duas bolas e abre a multibola' },
  { id: 'jackpot', nome: 'Jackpot', desc: 'Multibola + jackpot' },
  { id: 'super', nome: 'Super jackpot', desc: 'Três jackpots acendem o super; o golpe no chefe paga' },
  { id: 'andarAceso', nome: 'Acender o andar de cima', desc: 'Acende a luz: suba pela rampa direita ou pelo portal' },
  { id: 'bonus', nome: 'Andar de cima: fase bônus', desc: 'Tudo vale 5×, sem risco' },
  { id: 'premium', nome: 'Andar de cima: etapa premium', desc: 'Alvos especiais da máquina' },
  { id: 'tunel', nome: 'Túnel mágico', desc: 'Guie a bola até o topo do poço' },
  { id: 'nucleo', nome: 'Subfase: núcleo', desc: 'Campo separado do núcleo' },
  { id: 'enxame', nome: 'Subfase: enxame', desc: 'Campo separado do enxame' },
  { id: 'muralha', nome: 'Subfase: muralha', desc: 'Campo separado da muralha' },
  { id: 'camara', nome: 'Câmara Alta', desc: 'Subfase da rampa esquerda' },
];
