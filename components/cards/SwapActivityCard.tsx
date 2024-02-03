import Link from 'next/link'
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid'
import truncateStringInMiddle from '@/functions/formatters/truncateStringInMiddle'
import formatIpfsReference from '@/functions/formatters/formatIpfsReference'
import MediaViewer from '../MediaViewer'
import type { Swap } from '@/@types'

const SwapActivityCard = (props: {
  stakeKey: Swap['stakeKey']
  timestamp: Swap['timestamp']
  withdraw: Swap['withdraw']
  deposit: Swap['deposit']
}) => {
  const { stakeKey, timestamp, withdraw, deposit } = props

  return (
    <div className='group w-[350px] sm:w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700'>
      <div className='w-full h-full p-4 rounded-lg bg-zinc-800 flex flex-wrap sm:flex-nowrap items-start justify-center'>
        <div className='flex flex-col items-center'>
          <div className='flex items-center text-sm'>
            <ArrowTrendingUpIcon className='w-8 h-8 mr-2 text-green-400' />
            <span className='text-zinc-400'>Withdraw</span>
          </div>

          <MediaViewer mediaType='IMAGE' src={formatIpfsReference(withdraw.thumb).url} size='w-[250px] h-[250px] m-2' />

          <p className='truncate'>
            {1}&times;&nbsp;
            <span className='text-zinc-400'>{withdraw.displayName}</span>
          </p>
        </div>

        <div className='my-[30px] sm:my-[70px] mx-8 flex flex-col items-center'>
          <ArrowPathIcon className='w-8 h-8 m-4' />

          <Link
            href={`https://cexplorer.io/stake/${stakeKey}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-blue-200 flex items-center'
          >
            {truncateStringInMiddle(stakeKey, 7)}
            <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
          </Link>
          <p className='mt-1 text-xs text-zinc-400'>{new Date(timestamp).toLocaleString()}</p>
        </div>

        <div className='flex flex-col items-center'>
          <div className='flex items-center text-sm'>
            <ArrowTrendingDownIcon className='w-8 h-8 mr-2 text-red-400' />
            <span className='text-zinc-400'>Deposit</span>
          </div>

          <MediaViewer mediaType='IMAGE' src={formatIpfsReference(deposit.thumb).url} size='w-[250px] h-[250px] m-2' />

          <p className='truncate'>
            {1}&times;&nbsp;
            <span className='text-zinc-400'>{deposit.displayName}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SwapActivityCard
