import { Fragment, useMemo } from 'react'
import { useTimer } from 'react-timer-hook'
import MediaViewer from './MediaViewer'
import WhoHolders from './WhoHolders'
import ProgressBar from './ProgressBar'
import type { Poll, PollOption } from '@/@types'

interface PollViewerProps {
  poll: Poll
  showClassified: boolean
  callbackTimeExpired?: () => void
  serial?: PollOption['serial']
  setSerial?: (serial: PollOption['serial']) => void
}

const PollViewer = (props: PollViewerProps) => {
  const { poll, showClassified, callbackTimeExpired, serial, setSerial } = props

  const totalPoints = useMemo(() => {
    let count = 0

    poll.options.forEach(({ serial }) => {
      count += poll[`vote_${serial}`]
    })

    return count
  }, [poll])

  const timer = useTimer({
    expiryTimestamp: new Date(!!poll.id && poll.active ? poll.endAt : 0),
    onExpire: () => (callbackTimeExpired ? callbackTimeExpired() : null),
  })

  return (
    <div className='flex flex-col items-center text-center'>
      {!poll.isClassified || showClassified ? (
        <Fragment>
          <h6 className='w-full text-lg'>{poll.question}</h6>

          {poll.description ? (
            <p className='w-full mt-2 text-sm text-zinc-400'>
              {poll.description.split('\n').map((str, idx) => (
                <Fragment key={`str-${idx}-${str}`}>
                  {str}
                  <br />
                </Fragment>
              ))}
            </p>
          ) : null}

          <div className='w-full my-4 text-start text-sm'>
            {poll.options.map((obj, idx) => {
              const isActive = poll.active
              const isWinner = !isActive && poll.topSerial === obj.serial
              const pointValue = !isActive ? poll[`vote_${obj.serial}`] : 0
              // const percentValue = !isActive ? Math.round((100 / totalPoints) * pointValue) : 0

              return (
                <div
                  key={`vote-option-${obj.serial}`}
                  onClick={() => isActive && setSerial && setSerial(obj.serial)}
                  className={
                    'group max-w-[500px] my-4 mx-auto p-4 border rounded-lg ' +
                    (isActive
                      ? 'text-zinc-400 border-transparent cursor-pointer'
                      : (!isActive && !totalPoints) || serial === obj.serial
                      ? 'text-white border-white'
                      : isWinner
                      ? 'text-white border-green-400'
                      : 'text-zinc-400 border-transparent')
                  }
                >
                  {isActive ? (
                    <label className='flex items-center group-hover:text-white cursor-pointer'>
                      <input type='radio' name='serial' onChange={() => {}} checked={serial === obj.serial} />
                      <span className='ml-2 text-lg'>{obj.serial}.</span>
                    </label>
                  ) : (
                    <label className='flex items-center'>
                      <span className='text-lg'>{obj.serial}.</span>
                    </label>
                  )}

                  {obj.mediaType && obj.mediaUrl ? (
                    <MediaViewer mediaType={obj.mediaType} src={obj.mediaUrl} size='w-full h-full my-4' />
                  ) : (
                    <p className={'mt-1 text-sm ' + (isActive ? 'group-hover:text-white' : '')}>{obj.answer}</p>
                  )}

                  {!isActive && !!totalPoints ? <ProgressBar max={totalPoints} current={pointValue} isGreen={isWinner} isRed={!isWinner} /> : null}
                </div>
              )
            })}
          </div>
        </Fragment>
      ) : (
        <p className='mt-8 text-center text-red-400'>
          This poll is classified, and cannot be seen by the public eye.
          <br />
          Please check if your wallet meets the requirements.
        </p>
      )}

      {!!poll.id ? (
        <div className='mb-2'>
          {poll.active ? (
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
          ) : null}

          <WhoHolders
            label={poll.active ? 'Who can vote?' : 'Who voted?'}
            holderPolicies={poll.holderPolicies}
            withDelegators={poll.withDelegators}
            stakePools={poll.stakePools}
            totalEntries={poll.totalEntries}
          />
        </div>
      ) : null}
    </div>
  )
}

export default PollViewer
