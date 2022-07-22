// This is the entry point of your app, every page starts here

import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Commute?</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
