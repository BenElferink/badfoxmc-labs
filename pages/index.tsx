import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LoaderIcon } from 'react-hot-toast'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import getPolls from '@/functions/storage/polls/getPolls'
import type { Airdrop, Giveaway, Poll } from '@/@types'
import { AIRDROP_DESCRIPTION } from './airdrops'
import { POLL_DESCRIPTION } from './polls'
import { GIVEAWAY_DESCRIPTION } from './giveaways'

const Page = () => {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])

  useEffect(() => {
    ;(async () =>
      await Promise.all([
        getAirdrops()
          .then((data) => setAirdrops(data))
          .catch((error) => console.error(error.message)),
        getPolls()
          .then((data) => setPolls(data))
          .catch((error) => console.error(error.message)),
        getGiveaways()
          .then((data) => setGiveaways(data))
          .catch((error) => console.error(error.message)),
      ]))()
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
            </div>{' '}
            Airdrops
          </div>
          <p className='text-xs'>{AIRDROP_DESCRIPTION}</p>
        </div>
      </Link>

      <Link
        href='/polls'
        className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
      >
        <div className='w-full h-full p-8 rounded-lg bg-zinc-800'>
          <div className='mb-4 uppercase text-xl flex items-center'>
            <div className='mr-4 h-10 px-4 text-yellow-100 rounded-lg border border-yellow-700 bg-yellow-800/50 flex items-center justify-center'>
              {!polls.length ? <LoaderIcon /> : polls.length.toLocaleString()}
            </div>{' '}
            Polls
          </div>
          <p className='text-xs'>{POLL_DESCRIPTION}</p>
        </div>
      </Link>

      <Link
        href='/giveaways'
        className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
      >
        <div className='w-full h-full p-8 rounded-lg bg-zinc-800'>
          <div className='mb-4 uppercase text-xl flex items-center'>
            <div className='mr-4 h-10 px-4 text-yellow-100 rounded-lg border border-yellow-700 bg-yellow-800/50 flex items-center justify-center'>
              {!giveaways.length ? <LoaderIcon /> : giveaways.length.toLocaleString()}
            </div>{' '}
            Giveaways
          </div>
          <p className='text-xs'>{GIVEAWAY_DESCRIPTION}</p>
        </div>
      </Link>
    </div>
  )
}

export default Page
