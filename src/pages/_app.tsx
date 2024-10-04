import type { AppProps } from 'next/app'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Roboto } from 'next/font/google'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { MeshBadge, MeshProvider } from '@meshsdk/react'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { RenderProvider } from '@/contexts/RenderContext'
import Auth from '@/components/Auth'
import Sidebar from '@/components/Sidebar'
import MediaViewer from '@/components/MediaViewer'
import '@/styles/globals.css'

const inter = Roboto({ weight: '300', subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <div className={inter.className}>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Bad Labs</title>
      </Head>

      <Toaster />

      <MeshProvider>
        <DataProvider>
          <AuthProvider>
            <RenderProvider>
              <div className='w-screen min-h-screen'>
                <header id='header' className='sticky top-0 h-20 px-4 z-20 flex items-center justify-between'>
                  <div className='flex items-center'>
                    <Image src='/media/logo/badlabs.png' alt='logo' width={50} height={50} />
                    <h1 className='ml-1.5 text-xl whitespace-nowrap'>Bad Labs</h1>
                  </div>

                  <div className='flex items-center'>
                    <div className='sm:hidden p-0.5 rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 cursor-pointer'>
                      <button
                        type='button'
                        onClick={() => setOpenSidebar((prev) => !prev)}
                        className='p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center'
                      >
                        <Bars3Icon className='w-6 h-6' />
                      </button>
                    </div>

                    <Auth />
                  </div>
                </header>

                <Sidebar open={openSidebar} />

                <div className='w-full sm:w-[calc(100vw-15rem)] sm:ml-auto'>
                  <main className='w-full min-h-[calc(100vh-150px)] px-4'>
                    <Component {...pageProps} />
                  </main>

                  <footer id='footer' className='p-2 flex flex-col items-center justify-center'>
                    <div className='flex items-end justify-center'>
                      <div className='mx-2'>
                        <Link href='https://cardano.org' target='_blank' rel='noopener noreferrer' className='flex flex-col items-center'>
                          <MediaViewer mediaType='IMAGE' src='https://cardano.org/img/cardano-white.svg' size='h-[30px] w-[30px]' />
                          <span>Cardano</span>
                        </Link>
                      </div>

                      <div className='mx-2'>
                        <MeshBadge isDark />
                      </div>
                    </div>
                  </footer>
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
