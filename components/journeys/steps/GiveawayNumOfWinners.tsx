import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import Input from '@/components/form/Input'
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

      <Input
        placeholder='Amount'
        value={data['numOfWinners']}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }

            const n = Number(v)
            if (isNaN(n) || n < 0) return prev

            payload['numOfWinners'] = Math.floor(n)

            return payload
          })
        }
      />
    </JourneyStepWrapper>
  )
}

export default GiveawayNumOfWinners
