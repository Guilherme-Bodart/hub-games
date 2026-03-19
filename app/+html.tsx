import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="notranslate" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="google" content="notranslate" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body className="notranslate" translate="no">
        {children}
      </body>
    </html>
  );
}

const responsiveBackground = `
html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: #0F0F1A;
  -webkit-text-size-adjust: 100%;
  overscroll-behavior: none;
}`;
