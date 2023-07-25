import TextFrown from '@/components/TextFrown'
import { POLICY_IDS } from '@/constants'
import Link from 'next/link'

const ErrorNotTokenGateHolder = () => {
  return (
    <div className='max-w-[350px] mx-auto flex flex-col items-center justify-center'>
      <img src='/media/key.png' alt='key' width={300} height={300} className='mt-[10%]' />

      <TextFrown text="You don't own a Bad Key" className='mb-2' />

      <div className='w-full rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500'>
        <Link
          href={`https://jpg.store/collection/${POLICY_IDS['BAD_KEY']}`}
          target='_blank'
          rel='noopener noreferrer'
          className='w-full p-4 flex items-center justify-center rounded-lg bg-opacity-50 hover:bg-opacity-50 bg-zinc-700 hover:bg-zinc-500'
        >
          Buy
        </Link>
      </div>
    </div>
  )
}

export default ErrorNotTokenGateHolder
