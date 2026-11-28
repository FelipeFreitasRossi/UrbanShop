import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Documento HTML base da versão web (somente na exportação estática).
 * Define idioma, cor do tema, fundo preto antes do JS carregar e estilos globais.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
html, body { background-color: #000; color: #F4F3EF; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
::selection { background: #C8A75E; color: #000; }
* { -webkit-tap-highlight-color: transparent; }
a { text-decoration: none; }
:focus-visible { outline: 1px solid #C8A75E; outline-offset: 3px; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; border: 2px solid #000; }
::-webkit-scrollbar-thumb:hover { background: #8E7339; }
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; }
}
`;
