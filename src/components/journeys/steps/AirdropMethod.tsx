import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { AirdropSettings } from '@/@types'

const AirdropMethod = (props: {
  defaultData: Partial<AirdropSettings>
  callback: (payload: Partial<AirdropSettings>) => void
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
    <JourneyStepWrapper disableNext={false} next={next} back={back}>
      <h6 className='mb-6 text-xl text-center'>How should holders get their airdrop?</h6>

      <div
        onClick={() => setData(() => ({ airdropMethod: 'holder-snapshot' }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['airdropMethod'] === 'holder-snapshot' ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='airdropMethod' onChange={() => {}} checked={data['airdropMethod'] === 'holder-snapshot'} />
          <span className='ml-2 text-lg'>Holder Snapshot</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>You&apos;ll be asked to provide Policy IDs and some other relevant information.</p>
      </div>

      <div
        onClick={() => setData(() => ({ airdropMethod: 'delegator-snapshot' }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['airdropMethod'] === 'delegator-snapshot' ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='airdropMethod' onChange={() => {}} checked={data['airdropMethod'] === 'delegator-snapshot'} />
          <span className='ml-2 text-lg'>Delegator Snapshot</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>You&apos;ll be asked to provide Stake Pool IDs.</p>
      </div>

      <div
        onClick={() => setData(() => ({ airdropMethod: 'custom-list' }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['airdropMethod'] === 'custom-list' ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='airdropMethod' onChange={() => {}} checked={data['airdropMethod'] === 'custom-list'} />
          <span className='ml-2 text-lg'>Custom List</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          You already have a list of receiving wallets and the amounts for each wallet, skip the snapshot.
        </p>
      </div>
    </JourneyStepWrapper>
  )
}

export default AirdropMethod
