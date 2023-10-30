import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { SwapDonateSettings } from '@/@types'

const DonateMethod = (props: {
  defaultData: Partial<SwapDonateSettings>
  callback: (payload: Partial<SwapDonateSettings>) => void
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
    <JourneyStepWrapper back={back} next={next}>
      <h6 className='text-xl text-center'>Add to Swap Pool</h6>

      <p className='my-6 text-center text-sm'>
        By adding NFTs to the swap pool,
        <br />
        you&apos;re giving holders of the Policy ID a chance to trade & collect them.
        <br />
        <br />
        The pool size can only increase with due time, it does not decrease when executing a swap.
      </p>

      <div
        onClick={() => setData({ donateMethod: 'BUILD_TX' })}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['donateMethod'] === 'BUILD_TX' ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='useCustomList' onChange={() => {}} checked={data['donateMethod'] === 'BUILD_TX'} />
          <span className='ml-2 text-lg'>Build TX</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>Build a TX with the Bad Labs user interface.</p>
      </div>

      <div
        onClick={() => setData({ donateMethod: 'MANUAL_TX' })}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (data['donateMethod'] === 'MANUAL_TX' ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='useCustomList' onChange={() => {}} checked={data['donateMethod'] === 'MANUAL_TX'} />
          <span className='ml-2 text-lg'>Manual TX</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>Send a TX manually (for users experiencing UTXO issues).</p>
      </div>
    </JourneyStepWrapper>
  )
}

export default DonateMethod
