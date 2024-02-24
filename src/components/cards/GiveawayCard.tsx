import { Fragment } from 'react'
import MediaViewer from '../MediaViewer'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { Giveaway } from '@/@types'

const GiveawayCard = (props: {
  onClick?: (id: Giveaway['id']) => void
  id: Giveaway['id']
  active: Giveaway['active']
  endAt: Giveaway['endAt']
  thumb: Giveaway['thumb']
  isToken: Giveaway['isToken']
  tokenName: Giveaway['tokenName']
  tokenAmount: Giveaway['tokenAmount']
  otherTitle: Giveaway['otherTitle']
  otherAmount: Giveaway['otherAmount']
}) => {
  const { active, id, endAt, thumb, isToken, tokenName, tokenAmount, otherTitle, otherAmount, onClick } = props

  return (
    <div
      onClick={() => (onClick ? onClick(id) : null)}
      className='group w-fit m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
    >
      <div className='w-[calc(220px+2rem)] sm:w-[calc(300px+2rem)] p-4 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex flex-col items-center justify-evenly text-center'>
        <p className='truncate'>
          {isToken ? tokenAmount.display.toLocaleString() : otherAmount.toLocaleString()}&times;&nbsp;
          <span className='text-zinc-400'>{isToken ? tokenName.ticker || tokenName.display || tokenName.onChain : otherTitle}</span>
        </p>

        <p className={'mb-4 text-xs ' + (active ? 'text-green-400' : 'text-red-400')}>
          {active ? 'Active until:' : 'Ended at:'} {new Date(endAt).toLocaleString()}
        </p>

        <MediaViewer mediaType='IMAGE' src={thumb} size='w-[220px] h-[220px] sm:w-[300px] sm:h-[300px]' />

        <div
          className='mt-4 flex items-center text-sm'
          title={
            isToken
              ? 'The giveaway is processed by a script wallet, the winner(s) will automatically obtain the prize.'
              : 'The giveaway is processed by the giveaway host, the winner(s) will have to manually obtain the prize.'
          }
        >
          {isToken ? (
            <Fragment>
              <CheckCircleIcon className='w-6 h-6 mr-1 text-teal-400' />
              On-Chain Giveaway
            </Fragment>
          ) : (
            <Fragment>
              <ExclamationTriangleIcon className='w-6 h-6 mr-1 text-amber-400' />
              Off-Chain Giveaway
            </Fragment>
          )}
        </div>
      </div>
    </div>
  )
}

export default GiveawayCard
