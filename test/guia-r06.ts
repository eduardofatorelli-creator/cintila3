// Gera o guia R06 das 30 máquinas a partir dos dados reais (MachineDef + paleta R06).
import { MAQUINAS } from '../src/machines';
import { PALETAS } from '../src/visual/r06/paleta';

const EFEITO: Record<string, string> = {
  constelacao: 'traço de luz do alvo acertado até a próxima estrela da sequência (R05)',
  compasso: 'acerto no tempo da batida solta pulso gravitacional e poeira lunar; anel da pista pulsa com a batida real',
  criaturas: 'criatura capturada sobe como cometa com folhas; evolução abre pulso no ponto',
  escudos: 'escudo quebrado solta lascas e anel; portão aberto dispara pulso grande no chefe',
  salta: 'cada salto da nave-mãe deixa pulso e pixels na posição nova',
  ima: 'pulso quando o ímã prende; cometa na direção real do disparo',
  trem: 'vapor sobe da locomotiva quando ela fecha um tiro',
  relogio: 'engrenagem gira em volta do mostrador quando o bumper-relógio é acertado',
  roda: 'luzes correm em volta da roda conforme as cabines presas; roda solta dispara fogos e confete',
  boca: 'cometa percorre o cano sorteado e solta bolhas na saída (R04/R05)',
  salto: 'pouso da rampa de salto: pulso de lava e brasas',
  labirinto: 'saída do labirinto: pulso dourado e pigmentos',
  aceleracao: 'faixas de velocidade nas órbitas proporcionais ao medidor real de turbo; faíscas a cada órbita',
  vidro: 'camada estilhaçada: cacos facetados; trincas visíveis no alvo conforme as vidas reais',
  braco: 'pulso ao agarrar; cometa na direção real do arremesso',
  caveira: 'chamas verdes ao engolir e ao cuspir',
  pas: 'raio elétrico das pás até a bola quando a pá a rebate',
  canhaoAndar: 'disparo do homem-bala solta confete',
  prisma: 'três cometas nas cores das bolas saem do prisma',
  poco: 'cuspida do poço: pulso e poeira de areia',
  cartas: 'livro aberto (banco de queda): pulso e páginas voando',
  calor: 'núcleo brilha conforme o medidor real de calor; faíscas acima de 70%',
  mascaras: 'pagamento da assinatura com confete (FOLIA)',
  trilhos: 'rastro de luz pelo trilho quando um alvo é pego (R04/R05)',
  flores: 'flor visitada: pulso rosa e pétalas',
  elevador: 'cometa sobe o poço até a saída do nível real',
  serpente: 'escamas faiscam quando a serpente bloqueia a rampa',
  vinil: 'anéis em volta do vinil pela rotação real; notas a cada acerto',
  gelo: 'gelo trincando: cristais e anel no chefe e no banco',
  relampago: 'seis selos com os nomes dos poderes realmente sorteados; raio até a bola em cada golpe no chefe',
};
const L: string[] = [];
for (const m of MAQUINAS) {
  const P = PALETAS[m.id], f = m.chefe.forma;
  L.push(`### ${String(m.n).padStart(2, '0')}. ${m.nome}\n`);
  L.push(`- **Peças:** bumper com corpo ${P.bumper.corpo}, tampa ${P.bumper.tampa} e decalque "${P.bumper.forma}"; estilingue de acrílico ${P.sling.plastico} com decalque "${P.sling.decal}"; alvos ${P.alvo.face} (acesos ${P.alvo.aceso}); trilhos com fio de luz ${P.parede.fio}; palhetas com borracha ${P.palheta.borracha}.`);
  L.push(`- **Chefe ${m.chefe.nome}:** forma "${f.tipo}" (${f.pontas} pontas, ${f.olhos} olhos), material ${P.chefe.material}, acessório ${P.chefe.acessorio}, luz ${P.chefe.pedestal.luz}; movimento "${m.chefe.modo}" e vidas ${m.chefe.vidas.join('/')} inalterados.`);
  L.push(`- **Mecânica-assinatura (${m.assinatura.nome}):** ${EFEITO[m.assinatura.tipo] || 'pagamento visual da assinatura'}.`);
  L.push(`- **Andar de cima:** ${m.andar.nome} (${m.andar.tipo}; variação ${m.andar.variacao}); ambiente R06 por tipo de fase.\n`);
}
console.log(L.join('\n'));
