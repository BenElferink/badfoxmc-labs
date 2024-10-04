import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import truncateStringInMiddle from '@/functions/formatters/truncateStringInMiddle'
import getExplorerUrl from '@/functions/formatters/getExplorerUrl'
import MediaViewer from '../MediaViewer'
import type { Airdrop } from '@/@types'

const AirdropCard = (props: {
  stakeKey: Airdrop['stakeKey']
  thumb: Airdrop['thumb']
  tokenName: Airdrop['tokenName']
  tokenAmount: Airdrop['tokenAmount']
}) => {
  const { stakeKey, thumb, tokenName, tokenAmount } = props

  return (
    <div className='m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700'>
      <div className='w-[180px] h-[150px] rounded-lg bg-zinc-800 flex flex-col items-center justify-evenly'>
        <MediaViewer mediaType='IMAGE' src={thumb} size='w-[55px] h-[55px]' />

        <div>
          <p className='text-center text-xs'>{tokenName.ticker || tokenName.display || tokenName.onChain}</p>
          <p className='text-center truncate'>
            {tokenAmount.display.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        <Link
          href={getExplorerUrl('stakeKey', stakeKey)}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-blue-200 flex items-center'
        >
          {truncateStringInMiddle(stakeKey, 7)}
          <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
        </Link>
      </div>
    </div>
  )
}

export default AirdropCard
