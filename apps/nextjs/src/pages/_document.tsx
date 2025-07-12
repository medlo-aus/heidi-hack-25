import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Doccy - Medical Certificates </title>
        <meta
          name="description"
          content="Get Medical Certificates and Scripts Online. Fast, convenient, and secure telehealth services. Connect with licensed doctors from the comfort of your home."
        />
        {process.env.NODE_ENV === "development" ? (
          <link href="/favicon-dev.png" rel="icon" />
        ) : (
          <link href="/favicon.png" rel="icon" />
        )}
        {/* <meta
          property="og:image"
          key="og:image"
          content="https://doccy.com.au/meta.png"
        /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
