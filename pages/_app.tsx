// This is the entry point of your app, every page starts here

import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { ToastContainer, toast } from 'react-toastify';  // toast notifications

function MyApp({ Component, pageProps }: AppProps) {
  
  return (
    <>
      <Head>
        <title>Toasty Map</title>
      </Head>
      
      {/* Toast properties  */}
      <ToastContainer autoClose={30000}/>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
