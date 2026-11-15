// Teclado, toque (multitoque real) e sacudida.
export interface Alvo {
  flip(lado: 0 | 1, on: boolean): void; lanca(on: boolean): void; sacode(dir: number): void; pausa(): void; confirma(): void;
  /** onde fica o botão SACUDIR e se há bola esperando no lançador */
  zonaSacudir(): { x: number; y: number; w: number; h: number }; podeLancar(): boolean; ativo(): boolean; acorda(): void;
}
export function ligaEntrada(tela: HTMLElement, A: Alvo, canhoto: () => boolean) {
  const E = new Set(['ArrowLeft', 'KeyZ', 'KeyA']), D = new Set(['ArrowRight', 'KeyM', 'KeyL']);
  addEventListener('keydown', e => {
    A.acorda(); if (e.repeat) { if (E.has(e.code) || D.has(e.code) || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); return; }
    if (e.code === 'KeyP' || e.code === 'Escape') { A.pausa(); return; }
    if (!A.ativo()) return;
    if (E.has(e.code)) { A.flip(0, true); e.preventDefault(); } else if (D.has(e.code)) { A.flip(1, true); e.preventDefault(); }
    else if (e.code === 'Space') { A.lanca(true); e.preventDefault(); } else if (e.code === 'ArrowUp') { A.sacode(0); e.preventDefault(); } else if (e.code === 'Enter') A.confirma();
  });
  addEventListener('keyup', e => { if (E.has(e.code)) A.flip(0, false); else if (D.has(e.code)) A.flip(1, false); else if (e.code === 'Space') A.lanca(false); });
  addEventListener('blur', () => { A.flip(0, false); A.flip(1, false); A.lanca(false); });
  // toque: metade esquerda e direita; segurar à direita com bola no lançador puxa a mola
  const toques = new Map<number, { lado: 0 | 1; lancou: boolean }>();
  const conta = (l: number) => [...toques.values()].some(t => t.lado === l);
  tela.addEventListener('pointerdown', e => {
    A.acorda(); if (!A.ativo()) return; e.preventDefault();
    const z = A.zonaSacudir(); if (e.clientX >= z.x && e.clientX <= z.x + z.w && e.clientY >= z.y && e.clientY <= z.y + z.h) { A.sacode(0); return; }
    let lado: 0 | 1 = e.clientX < innerWidth / 2 ? 0 : 1; const fisico = lado; if (canhoto()) lado = (1 - lado) as 0 | 1;
    const lancou = fisico === 1 && A.podeLancar(); toques.set(e.pointerId, { lado, lancou });
    try { tela.setPointerCapture(e.pointerId); } catch { /* ponteiro já solto */ }
    A.flip(lado, true); if (lancou) A.lanca(true);
  });
  const solta = (e: PointerEvent) => { const t = toques.get(e.pointerId); if (!t) return; toques.delete(e.pointerId); if (!conta(t.lado)) A.flip(t.lado, false); if (t.lancou) A.lanca(false); };
  tela.addEventListener('pointerup', solta); tela.addEventListener('pointercancel', solta);
  tela.addEventListener('contextmenu', e => e.preventDefault());
}
