import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { GiveawaySettings } from '@/@types'

const GiveawayNumOfWinners = (props: {
  defaultData: Partial<GiveawaySettings>
  callback: (payload: Partial<GiveawaySettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <JourneyStepWrapper disableNext={!data['numOfWinners']} back={back} next={next}>
      <h6 className='mb-6 text-xl text-center'>How many winners should there be?</h6>

      <input
        placeholder='Amount'
        value={data['numOfWinners'] || ''}
        onChange={(e) =>
          setData((prev) => {
            const payload = { ...prev }

            const v = Number(e.target.value)
            if (isNaN(v) || v < 0) return prev

            payload['numOfWinners'] = Math.floor(v)

            return payload
          })
        }
        className='w-full my-2 p-4 flex items-center text-center placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 outline-none'
      />
    </JourneyStepWrapper>
  )
}

export default GiveawayNumOfWinners
