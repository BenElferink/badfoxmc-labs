import Link from 'next/link'
import { Fragment } from 'react'
import { useTimer } from 'react-timer-hook'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import MediaViewer from './MediaViewer'
import WhoHolders from './WhoHolders'
import type { Giveaway } from '@/@types'

interface GiveawayViewerProps {
  giveaway: Giveaway
  callbackTimeExpired?: () => void
}

const GiveawayViewer = (props: GiveawayViewerProps) => {
  const { giveaway, callbackTimeExpired } = props

  const timer = useTimer({
    expiryTimestamp: new Date(!!giveaway.id && giveaway.active ? giveaway.endAt : 0),
    onExpire: () => (callbackTimeExpired ? callbackTimeExpired() : null),
  })

  return (
    <div className='flex flex-col items-center text-center'>
      {giveaway.isToken ? (
        <h6 className='w-full text-lg'>
          {giveaway.tokenAmount.display.toLocaleString()}&times;{' '}
          {giveaway.tokenName.ticker || giveaway.tokenName.display || giveaway.tokenName.onChain}
        </h6>
      ) : (
        <Fragment>
          <h6 className='w-full text-lg'>
            {giveaway.otherAmount.toLocaleString()}&times; {giveaway.otherTitle}
          </h6>

          {giveaway.otherDescription ? (
            <p className='w-full mt-2 text-sm text-zinc-400'>
              {giveaway.otherDescription.split('\n').map((str, idx) => (
                <Fragment key={`str-${idx}-${str}`}>
                  {str}
                  <br />
                </Fragment>
              ))}
            </p>
          ) : null}
        </Fragment>
      )}

      <MediaViewer mediaType='IMAGE' src={giveaway.thumb} size='w-[250px] sm:w-[550px] h-[250px] sm:h-[550px] my-4' />

      {!!giveaway.id && giveaway.active ? (
        <div className='mb-2'>
          <table className='mx-auto'>
            <tbody>
              <tr className='text-xl'>
                <td>{`${timer.days < 10 ? '0' : ''}${timer.days}`}</td>
                <td>:</td>
                <td>{`${timer.hours < 10 ? '0' : ''}${timer.hours}`}</td>
                <td>:</td>
                <td>{`${timer.minutes < 10 ? '0' : ''}${timer.minutes}`}</td>
                <td>:</td>
                <td>{`${timer.seconds < 10 ? '0' : ''}${timer.seconds}`}</td>
              </tr>
            </tbody>
          </table>

          <WhoHolders
            label='Who can enter?'
            holderPolicies={giveaway.holderPolicies}
            withDelegators={giveaway.withDelegators}
            stakePools={giveaway.stakePools}
          />
        </div>
      ) : !!giveaway.id && !giveaway.active && !giveaway.winners.length ? (
        <div className='mb-2'>Winner{giveaway.numOfWinners > 1 ? 's' : ''} pending...</div>
      ) : !!giveaway.id && !giveaway.active && !!giveaway.winners.length ? (
        <div className='mb-2'>
          Winner{giveaway.winners.length > 1 ? 's' : ''}:
          <ul className='text-xs'>
            {giveaway.winners.map((item) => (
              <Link
                key={`winner-${item.stakeKey}`}
                href={`https://cexplorer.io/stake/${item.stakeKey}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center text-blue-400 hover:underline'
              >
                {item.stakeKey}
                <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
              </Link>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default GiveawayViewer
