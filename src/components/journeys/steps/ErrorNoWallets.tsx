import Link from 'next/link'
import TextFrown from '@/components/TextFrown'

const ErrorNoWallets = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <TextFrown text='No wallets installed...' className='mt-[10vh] mb-2' />

      <div className='max-w-[350px] w-full rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500'>
        <Link
          href='https://builtoncardano.com/ecosystem/wallets'
          target='_blank'
          rel='noopener noreferrer'
          className='w-full p-4 flex items-center justify-center rounded-lg bg-opacity-50 hover:bg-opacity-50 bg-zinc-700 hover:bg-zinc-500'
        >
          Get a Wallet
        </Link>
      </div>
    </div>
  )
}

export default ErrorNoWallets
