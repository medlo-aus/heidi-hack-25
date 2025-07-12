import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Last Mile 🚀 </title>
        <meta name="description" content="Last Mile 🚀 Patient Continuity" />
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
