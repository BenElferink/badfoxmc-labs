import Link from 'next/link'
import { useEffect } from 'react'
import { LoaderIcon } from 'react-hot-toast'
import { useData } from '@/contexts/DataContext'
import { AIRDROP_DESCRIPTION } from './airdrops'

const Page = () => {
  const { airdrops, fetchAirdrops } = useData()

  useEffect(() => {
    ;(async () => {
      if (!airdrops.length) await fetchAirdrops()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='w-full flex flex-col items-center'>
      <Link
        href='/airdrops'
        className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
      >
        <div className='w-full h-full p-8 rounded-lg bg-zinc-800'>
          <div className='mb-4 uppercase text-xl flex items-center'>
            <div className='mr-4 h-10 px-4 text-yellow-100 rounded-lg border border-yellow-700 bg-yellow-800/50 flex items-center justify-center'>
              {!airdrops.length ? <LoaderIcon /> : airdrops.length.toLocaleString()}
            </div>
            &nbsp;Airdrops
          </div>
          <p className='text-xs'>{AIRDROP_DESCRIPTION}</p>
        </div>
      </Link>
    </div>
  )
}

export default Page
