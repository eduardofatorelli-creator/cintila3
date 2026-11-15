// Progresso salvo em localStorage, uma chave por item, com try/catch em tudo.
const P = 'cintila3.';
function ler<T>(k: string, padrao: T): T { try { const v = localStorage.getItem(P + k); return v === null ? padrao : JSON.parse(v) as T; } catch { return padrao; } }
function gravar(k: string, v: unknown) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch { /* armazenamento indisponível */ } }

export interface Prefs { som: boolean; musica: boolean; narrador: boolean; canhoto: boolean }
export const salvo = {
  desbloqueadas: () => Math.max(1, ler('desbloqueadas', 1)),
  desbloqueia(n: number) { if (n > this.desbloqueadas()) gravar('desbloqueadas', n); },
  recorde: (id: string) => ler<number>('recorde.' + id, 0),
  ranking: (id: string) => ler<number[]>('ranking.' + id, []),
  registra(id: string, pontos: number): boolean {
    const r = this.ranking(id); r.push(pontos); r.sort((a, b) => b - a); gravar('ranking.' + id, r.slice(0, 5));
    if (pontos > this.recorde(id)) { gravar('recorde.' + id, pontos); return true; } return false;
  },
  mestria: (id: string) => Math.min(10, ler<number>('mestria.' + id, 0)),
  sobeMestria(id: string) { const m = Math.min(10, this.mestria(id) + 1); gravar('mestria.' + id, m); return m; },
  eterno: (id: string) => ler<{ tempo: number; pontos: number }>('eterno.' + id, { tempo: 0, pontos: 0 }),
  registraEterno(id: string, tempo: number, pontos: number): boolean { const e = this.eterno(id); if (tempo > e.tempo) { gravar('eterno.' + id, { tempo, pontos: Math.max(pontos, e.pontos) }); return true; } return false; },
  prefs: () => ({ som: true, musica: true, narrador: true, canhoto: false, ...ler<Partial<Prefs>>('prefs', {}) }) as Prefs,
  gravaPrefs(p: Prefs) { gravar('prefs', p); },
  partidas: () => ler<number>('partidas', 0),
  contaPartida() { gravar('partidas', this.partidas() + 1); },
  apaga() { try { for (const k of Object.keys(localStorage)) if (k.startsWith(P)) localStorage.removeItem(k); } catch { /* nada a apagar */ } },
};
