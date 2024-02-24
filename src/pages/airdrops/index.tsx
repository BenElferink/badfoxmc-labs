import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useData } from '@/contexts/DataContext'
import resolveMonthName from '@/functions/resolvers/resolveMonthName'
import Loader from '@/components/Loader'
import AirdropCard from '@/components/cards/AirdropCard'
import AirdropJourney from '@/components/journeys/AirdropJourney'
import type { Airdrop } from '@/@types'

interface AirdropTimeline {
  [year: string]: {
    [month: string]: Airdrop[]
  }
}

export const AIRDROP_DESCRIPTION =
  "The airdrop tool utilizes Cardano's Extended UTXO model to distribute rewards (ADA and Fungible-Tokens) amongst holders of given Policy ID(s)."

const Page = () => {
  const { airdrops, fetchAirdrops } = useData()
  const [openJourney, setOpenJourney] = useState(false)
  const [airdropTimeline, setAirdropTimeline] = useState<AirdropTimeline | null>(null)

  useEffect(() => {
    if (!airdrops.length) {
      fetchAirdrops()
    } else {
      const payload: AirdropTimeline = {}

      airdrops.forEach((item) => {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airdrops])

  return (
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='w-full mb-4 flex flex-wrap'>
        <p className='w-full m-1'>{AIRDROP_DESCRIPTION}</p>

        <button
          className='w-full m-1 p-4 flex items-center justify-center text-center rounded-lg border border-transparent hover:border-green-600 bg-green-900 hover:bg-green-800'
          onClick={() => setOpenJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Run an Airdrop
        </button>
      </div>

      <div className='flex flex-col-reverse'>
        {!airdropTimeline ? (
          <Loader />
        ) : (
          Object.entries(airdropTimeline).map(([year, months]) =>
            Object.entries(months).map(([month, drops]) => (
              <div key={`year-${year}-month-${month}`} className='my-2'>
                <h6 className='sm:mx-1 text-lg text-center sm:text-start'>
                  {resolveMonthName(month)} - {year}
                </h6>

                <div className='flex flex-wrap justify-center sm:justify-start'>
                  {drops.map((drop) => (
                    <AirdropCard
                      key={`drop-${drop.id}`}
                      stakeKey={drop.stakeKey}
                      thumb={drop.thumb}
                      tokenName={drop.tokenName}
                      tokenAmount={drop.tokenAmount}
                    />
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>

      <AirdropJourney
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          fetchAirdrops()
        }}
      />
    </div>
  )
}

export default Page
