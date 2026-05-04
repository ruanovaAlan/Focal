# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (HMR, port 5173)
npm run build     # Production build → /dist
npm run preview   # Preview production build locally
npm run lint      # ESLint (flat config, v9+)
```

No test runner configured.

## Architecture

**Fluum** — Spanish-first EPUB reader PWA using RSVP (Rapid Serial Visual Presentation). Stack: React 19, Vite, Tailwind CSS v4, epub.js.

### App Flow (3-screen state machine in `App.jsx`)

```
home → loading → reader
```

1. `FileDropzone.jsx` — drag-and-drop/click EPUB upload, validates `.epub` extension + MIME, calls `onFileSelected` callback
2. `App.jsx` — receives file, calls `parseEpub()`, stores `{ words[], title, author }`, manages screen transitions
3. `epubParser.js` — async: loads EPUB via epub.js → extracts metadata from manifest → iterates spine items → strips HTML → tokenizes into word array
4. Reader screen — **stub only**, RSVP playback not yet implemented ("próximamente")

### Styling System

CSS variables (dark-only) in `index.css`:
- `--bg` `#0c0c0d`, `--surface` `#161618`, `--text` `#e8e8e6`, `--accent` `#e8c547` (gold), `--muted` `#5a5a60`
- Fonts: Fraunces (serif headers) + DM Mono (monospace body), loaded from Google Fonts
- Tailwind v4 imported but custom CSS vars used for most styling

### Key Notes

- UI copy is in Spanish (es-ES)
- `lucide-react` installed but minimally used
- TypeScript types installed (`@types/react`) but no `.ts`/`.tsx` files — plain JSX
- PWA manifest in `/public/manifest.json` — icons referenced but not present in `/public/` yet
- Project recently renamed from "Focal" → "Fluum" (some icon references may still say "Focal")
