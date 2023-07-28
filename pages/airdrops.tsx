import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/solid'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import resolveMonthName from '@/functions/formatters/resolveMonthName'
import truncateStringInMiddle from '@/functions/formatters/truncateStringInMiddle'
import MediaViewer from '@/components/MediaViewer'
import Loader from '@/components/Loader'
import TextFrown from '@/components/TextFrown'
import AirdropJourney from '@/components/journeys/AirdropJourney'
import type { Airdrop } from '@/@types'

interface AirdropTimeline {
  [year: string]: {
    [month: string]: Airdrop[]
  }
}

const Page = () => {
  const [loading, setLoading] = useState(false)
  const [openJourney, setOpenJourney] = useState(false)
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
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='max-w-lg sm:max-w-2xl mx-1 text-sm'>
        <p className='my-4'>
          The airdrop tool utilizes Cardano&apos;s Extended UTXO model to distribute rewards (ADA and
          Fungible-Tokens) amongst holders of given Policy ID(s).
        </p>

        <button
          className='w-full sm:max-w-[420px] p-4 flex items-center justify-center text-center rounded-lg bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 border hover:border disabled:border border-green-700 hover:border-green-700'
          onClick={() => setOpenJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Run an Airdrop
        </button>

        <AirdropJourney open={openJourney} onClose={() => setOpenJourney(false)} />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className='flex flex-col-reverse'>
          {!airdropTimeline ? (
            <div className='m-2'>
              <TextFrown text='Nothing to see here...' />
            </div>
          ) : (
            Object.entries(airdropTimeline).map(([year, months]) =>
              Object.entries(months).map(([month, drops]) => (
                <div key={`year-${year}-month-${month}`} className='my-2'>
                  <h6 className='sm:mx-1 text-lg text-center sm:text-start'>
                    {resolveMonthName(month)} - {year}
                  </h6>

                  <div className='flex flex-wrap justify-center sm:justify-start'>
                    {drops.map((drop) => (
                      <div
                        key={`drop-${drop.id}`}
                        className='m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-900 via-blue-900 to-green-900'
                      >
                        <div className='w-[190px] h-[160px] rounded-lg bg-zinc-800 flex flex-col items-center justify-evenly'>
                          <MediaViewer mediaType='IMAGE' src={drop.thumb} size='w-[55px] h-[55px]' />

                          <div>
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
          )}
        </div>
      )}
    </div>
  )
}

export default Page
