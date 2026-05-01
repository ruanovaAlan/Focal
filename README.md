```
███████╗ ██████╗  ██████╗ █████╗ ██╗
██╔════╝██╔═══██╗██╔════╝██╔══██╗██║
█████╗  ██║   ██║██║     ███████║██║
██╔══╝  ██║   ██║██║     ██╔══██║██║
██║     ╚██████╔╝╚██████╗██║  ██║███████╗
╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝

una palabra a la vez.
```

---

**Focal** es un lector RSVP (*Rapid Serial Visual Presentation*) para archivos `.epub`. En lugar de desplazarte por páginas, cada palabra aparece una a la vez en el centro de la pantalla — eliminando el movimiento ocular y permitiéndote leer hasta 3× más rápido.

## Cómo funciona

1. Sube un archivo `.epub` — arrastrándolo o seleccionándolo
2. Focal extrae el texto completo del libro
3. Las palabras aparecen una a la vez en pantalla a la velocidad que elijas
4. Pausa, retrocede, ajusta los WPM en cualquier momento

## Stack

| | |
|---|---|
| Framework | React 19 + Vite |
| Estilos | Tailwind CSS v4 |
| Parser EPUB | epub.js |
| Distribución | PWA (sin App Store) |

## Arrancar en local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
```

El output en `/dist` puede desplegarse directamente en Vercel, Netlify o cualquier hosting estático. Al abrirlo desde el móvil, el navegador ofrecerá instalarlo como app.

---

> *"No leas más rápido. Deja que las palabras lleguen a ti."*