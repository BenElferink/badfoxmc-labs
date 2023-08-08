import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { GiveawaySettings } from '@/@types'

const GiveawayTokenOrOther = (props: {
  defaultData: Partial<GiveawaySettings>
  callback: (payload: Partial<GiveawaySettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
  }, [data])

  return (
    <JourneyStepWrapper disableNext={false} next={next} back={back}>
      <h6 className='mb-6 text-xl text-center'>What type of giveaway?</h6>

      <div
        onClick={() => setData(() => ({ isToken: true }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['isToken'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='isToken' onChange={() => {}} checked={data['isToken'] === true} />
          <span className='ml-2 text-lg'>On Chain</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          You&apos;re giving away a token (NFT/FT), and a script wallet is responsible of it&apos;s distribution.
        </p>
      </div>

      <div
        onClick={() => setData(() => ({ isToken: false }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['isToken'] === false ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='isToken' onChange={() => {}} checked={data['isToken'] === false} />
          <span className='ml-2 text-lg'>Off Chain</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          You&apos;re giving away a something else (ex. whitelist), and you are responsible of it&apos;s
          distribution.
        </p>
      </div>
    </JourneyStepWrapper>
  )
}

export default GiveawayTokenOrOther
