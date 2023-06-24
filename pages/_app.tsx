import Head from 'next/head'
import Link from 'next/link'
import { Roboto } from 'next/font/google'
import { useState } from 'react'
import { MeshProvider } from '@meshsdk/react'
import { Toaster } from 'react-hot-toast'
import { Bars3Icon, BeakerIcon } from '@heroicons/react/24/solid'
import Auth from '@/components/Auth'
import Sidebar from '@/components/Sidebar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Roboto({ weight: '300', subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <div className={inter.className}>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Ben Elferink' />

        <title>Bad Labs</title>
      </Head>

      <Toaster />

      <MeshProvider>
        <AuthProvider>
          <header id='header' className='sticky top-0 z-50 h-20 px-4 flex items-center justify-between'>
            <div className='flex items-center'>
              <BeakerIcon className='w-10 h-10' />
              <h1 className='ml-1.5 text-xl whitespace-nowrap'>Bad Labs</h1>
            </div>

            <div className='flex items-center'>
              <button
                type='button'
                onClick={() => setOpenSidebar((prev) => !prev)}
                className='p-1.5 text-sm rounded-lg sm:hidden text-zinc-400 focus:ring-2 focus:ring-zinc-600'
              >
                <Bars3Icon className='w-6 h-6' />
              </button>

              <Auth />
            </div>
          </header>

          <div className='w-screen min-h-screen flex'>
            <Sidebar open={openSidebar} />

            <div className='w-full sm:w-[calc(100vw-15rem)] sm:ml-auto'>
              <main className='w-full min-h-screen p-2'>
                <Component {...pageProps} />
              </main>

              <footer
                id='footer'
                className='p-1 flex items-center justify-center drop-shadow-[0_0_2px_rgba(0,0,0,1)]'
              >
                <Link
                  href='https://badfoxmc.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 flex items-center justify-center'
                >
                  <img src='https://badfoxmc.com/media/logo/white_cropped.png' alt='logo' width={50} height={50} />
                  <div className='ml-2 text-start whitespace-nowrap'>
                    <span className='text-xs'>Powered by:</span>
                    <h6 className='text-sm'>Bad Fox MC</h6>
                  </div>
                </Link>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </MeshProvider>
    </div>
  )
}

export default MyApp
