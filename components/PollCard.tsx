import { Fragment } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'
import { TrophyIcon } from '@heroicons/react/24/solid'
import type { Poll, PollOption } from '@/@types'

const PollCard = (props: {
  onClick?: (id: Poll['id']) => void
  id: Poll['id']
  active: Poll['active']
  endAt: Poll['endAt']
  isClassified: Poll['isClassified']
  question: Poll['question']
  topOption?: PollOption
}) => {
  const { active, id, endAt, isClassified, question, topOption, onClick } = props

  return (
    <div
      onClick={() => (onClick ? onClick(id) : null)}
      className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-900 via-blue-900 to-green-900 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
    >
      <div className='w-full h-full p-4 rounded-lg bg-zinc-800 flex flex-col items-start justify-start'>
        <p className={'text-sm ' + (active ? 'text-green-400' : 'text-red-400')}>
          {active ? 'Active until:' : 'Ended at:'} {new Date(endAt).toLocaleString()}
        </p>

        <p className={active ? 'my-4' : 'my-4 text-zinc-400'}>{isClassified ? 'CLASSIFIED' : question}</p>

        {active ? (
          <div className='flex items-center text-xs text-zinc-400'>
            <ClockIcon className='w-6 h-6 mr-1 text-blue-400' />
            Pending Votes
          </div>
        ) : (
          <div className='flex items-center text-xs'>
            <TrophyIcon className='w-6 h-6 mr-1 text-amber-400' />
            {isClassified ? (
              <span className='text-zinc-400'>CLASSIFIED</span>
            ) : topOption?.isMedia ? (
              <Fragment>
                {topOption?.mediaType}&nbsp;<span className='text-zinc-400'>click to view</span>
              </Fragment>
            ) : (
              topOption?.answer
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PollCard
