import type { AppProps } from 'next/app'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Roboto } from 'next/font/google'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { MeshProvider } from '@meshsdk/react'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { RenderProvider } from '@/contexts/RenderContext'
import CloseButton from '@/components/sdk/CloseButton'
import Auth from '@/components/Auth'
import Sidebar from '@/components/Sidebar'
import '@/styles/globals.css'

const inter = Roboto({ weight: '300', subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isSdk = router.asPath.indexOf('/sdk') === 0

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
              {isSdk ? (
                <div className='overflow-auto relative w-screen h-screen p-4 bg-zinc-900 flex flex-col items-center'>
                  <CloseButton />

                  <Link href='https://labs.badfoxmc.com' target='_blank' rel='noopener noreferrer' className='mb-4 flex items-center justify-center'>
                    <Image src='/media/logo/badlabs.png' alt='logo' width={50} height={50} />
                    <h5 className='ml-2 text-sm text-start whitespace-nowrap'>
                      <span className='text-xs'>Powered by:</span>
                      <br />
                      Bad Labs
                    </h5>
                  </Link>

                  <Component {...pageProps} />
                </div>
              ) : (
                <div className='w-screen min-h-screen'>
                  <header id='header' className='sticky top-0 h-20 px-4 z-20 flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Image src='/media/logo/badlabs.png' alt='logo' width={50} height={50} />
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

                  <Sidebar open={openSidebar} />

                  <div className='w-full sm:w-[calc(100vw-15rem)] sm:ml-auto'>
                    <main className='w-full min-h-screen px-4'>
                      <Component {...pageProps} />
                    </main>

                    <footer id='footer' />
                  </div>
                </div>
              )}
            </RenderProvider>
          </AuthProvider>
        </DataProvider>
      </MeshProvider>
    </div>
  )
}

export default MyApp
