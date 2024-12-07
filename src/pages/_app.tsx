import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Roboto } from 'next/font/google'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { MeshProvider } from '@meshsdk/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { RenderProvider } from '@/contexts/RenderContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import '@/styles/globals.css'

const inter = Roboto({ weight: '300', subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <div className={inter.className}>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Ben Elferink' />
        <meta name='keywords' content='cardano, blockchain, nft, coin, tools, airdrop, escrow' />
        <meta name='description' content='DeFi tools for the Cardano Blockchain' />

        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        <title>Cardano Tools</title>
      </Head>

      <Toaster />

      <MeshProvider>
        <DataProvider>
          <AuthProvider>
            <RenderProvider>
              <div className='w-screen min-h-screen'>
                <Header clickMenu={() => setOpenSidebar((prev) => !prev)} />
                <Sidebar open={openSidebar} />

                <div className='w-full sm:w-[calc(100vw-15rem)] sm:ml-auto'>
                  <main className='w-full min-h-[calc(100vh-150px)] px-4'>
                    <Component {...pageProps} />
                  </main>

                  <Footer />
                </div>
              </div>
            </RenderProvider>
          </AuthProvider>
        </DataProvider>
      </MeshProvider>
    </div>
  )
}

export default MyApp
