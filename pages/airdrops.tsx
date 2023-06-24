import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/solid'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import resolveMonthName from '@/functions/formatters/resolveMonthName'
import truncateStringInMiddle from '@/functions/formatters/truncateStringInMiddle'
import MediaViewer from '@/components/MediaViewer'
import Loader from '@/components/Loader'
import type { Airdrop } from '@/@types'

interface AirdropTimeline {
  [year: string]: {
    [month: string]: Airdrop[]
  }
}

const Page = () => {
  const [loading, setLoading] = useState(false)
  const [airdropTimeline, setAirdropTimeline] = useState<AirdropTimeline | null>(null)

  useEffect(() => {
    setLoading(true)
    getAirdrops()
      .then((data) => {
        const payload: AirdropTimeline = {}

        data.forEach((item) => {
          const date = new Date(item.timestamp)
          const y = date.getFullYear().toString()
          const m = date.getMonth().toString()

          if (payload[y]) {
            if (payload[y][m]) {
              payload[y][m].push(item)
            } else {
              payload[y][m] = [item]
            }
          } else {
            payload[y] = { [m]: [item] }
          }
        })

        setAirdropTimeline(payload)
      })
      .catch((error) => console.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='w-full'>
      <button
        className='sm:w-[370px] m-1 p-4 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600'
        onClick={() => alert('under development')}
      >
        <PlusIcon className='w-6 h-6 mr-2' /> Run an Airdrop
      </button>

      {loading ? <Loader /> : null}

      <div className='flex flex-col-reverse'>
        {airdropTimeline
          ? Object.entries(airdropTimeline).map(([year, months]) =>
              Object.entries(months).map(([month, drops]) => (
                <div
                  key={`year-${year}-month-${month}`}
                  className='my-2 flex flex-col items-center sm:items-start'
                >
                  <h5 className='sm:ml-1 text-lg'>
                    {resolveMonthName(month)} - {year}
                  </h5>

                  <div className='sm:flex sm:flex-wrap'>
                    {drops.map((drop) => (
                      <div
                        key={`drop-${drop.id}`}
                        className='m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-900 via-blue-900 to-green-900'
                      >
                        <div className='w-[190px] h-[160px] rounded-lg bg-zinc-800 flex flex-col items-center justify-evenly'>
                          <MediaViewer mediaType='IMAGE' src={drop.thumb} size='w-[55px] h-[55px]' />

                          <div className=''>
                            <p className='text-center text-xs'>
                              {drop.tokenName.ticker || drop.tokenName.display || drop.tokenName.onChain}
                            </p>
                            <p className='text-center truncate'>
                              {drop.tokenAmount.display.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>

                          <Link
                            href={`https://cexplorer.io/stake/${drop.stakeKey}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-blue-200 flex items-center'
                          >
                            {truncateStringInMiddle(drop.stakeKey, 7)}
                            <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )
          : null}
      </div>
    </div>
  )
}

export default Page
