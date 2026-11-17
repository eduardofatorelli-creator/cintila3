import { defineConfig } from 'vite';

// Na build de playtest (VITE_PLAYTEST=1) a página pede para não ser indexada; na oficial nada muda.
export default defineConfig({
  plugins: [{
    name: 'playtest-noindex',
    transformIndexHtml(html) {
      if (process.env.VITE_PLAYTEST !== '1') return html;
      return html.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow,noarchive">').replace('<title>Cintila 3 — Pinball de Ataque</title>', '<title>Cintila 3 — Playtest</title>');
    },
  }],
});
