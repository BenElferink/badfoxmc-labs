import { useState } from 'react'
import axios from 'axios'
import JourneyStepWrapper from './JourneyStepWrapper'
import Input from '@/components/form/Input'
import DropDown from '@/components/form/DropDown'
import { TIME_LABELS } from '@/constants'
import type { GiveawaySettings } from '@/@types'
import type { FetchedTimestampResponse } from '@/pages/api/timestamp'

const EndTime = (props: { callback: (payload: Partial<GiveawaySettings>) => void; next?: () => void; back?: () => void }) => {
  const { callback, next, back } = props

  const [amount, setAmount] = useState(0)
  const [period, setPeriod] = useState(TIME_LABELS['DAYS'])
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

      <DropDown
        label='Select a Period'
        items={Object.values(TIME_LABELS).map((val) => ({ label: val, value: val }))}
        value={period}
        setValue={(_val) => setPeriod(_val)}
      />
    </JourneyStepWrapper>
  )
}

export default EndTime
