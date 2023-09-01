import { useState } from 'react'
import axios from 'axios'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import Input from '@/components/form/Input'
import type { GiveawaySettings } from '@/@types'
import type { FetchedTimestampResponse } from '@/pages/api/timestamp'
import { TIME_LABELS } from '@/constants'

const EndTime = (props: { callback: (payload: Partial<GiveawaySettings>) => void; next?: () => void; back?: () => void }) => {
  const { callback, next, back } = props

  const [amount, setAmount] = useState(0)
  const [period, setPeriod] = useState(TIME_LABELS['DAYS'])
  const [openSelector, setOpenSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchTimestamp = async (_a: typeof amount, _p: typeof period) => {
    setLoading(true)

    const {
      data: { now, endAt },
    } = await axios.get<FetchedTimestampResponse>(`/api/timestamp?endAmount=${_a}&endPeriod=${_p}`)

    setLoading(false)

    return { now, endAt }
  }

  return (
    <JourneyStepWrapper
      disableNext={!amount || !period || loading}
      back={back}
      next={async () => {
        fetchTimestamp(amount, period)
          .then(({ endAt }) => {
            callback({ endAt })
            if (next) setTimeout(() => next(), 0)
          })
          .catch((err) => console.error(err))
      }}
    >
      <h6 className='mb-6 text-xl text-center'>When should it end?</h6>

      <Input
        placeholder='0'
        value={amount || ''}
        setValue={(v) =>
          setAmount((prev) => {
            const n = Number(v)

            if (isNaN(n) || n < 0) {
              return prev
            }

            return n
          })
        }
      />

      <div className='w-full my-2 relative'>
        <button
          type='button'
          onClick={() => setOpenSelector((prev) => !prev)}
          className='w-full p-4 flex items-center justify-center text-center placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70'
        >
          <span>{period || 'Select a Period'}</span>
          {openSelector ? <ChevronUpIcon className='w-4 h-4 ml-1' /> : <ChevronDownIcon className='w-4 h-4 ml-1' />}
        </button>

        <div
          className={
            (openSelector ? 'flex' : 'hidden') +
            ' flex-col max-h-60 mt-2 overflow-y-auto absolute top-[100%] z-20 w-full rounded-lg bg-zinc-700 bg-opacity-70'
          }
        >
          {Object.values(TIME_LABELS).map((val) => (
            <button
              key={`period-${val}`}
              type='button'
              onClick={() => {
                setPeriod(val)
                setOpenSelector(false)
              }}
              className={
                'w-full p-2 flex items-center justify-center text-center rounded-lg hover:bg-zinc-600 hover:bg-opacity-70 ' +
                (period === val ? 'text-white underline' : 'text-zinc-400 hover:text-white')
              }
            >
              <span>{val}</span>
            </button>
          ))}
        </div>
      </div>
    </JourneyStepWrapper>
  )
}

export default EndTime
