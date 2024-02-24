import { ClockIcon, PaperClipIcon, TrophyIcon } from '@heroicons/react/24/solid'
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
      className='group w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
    >
      <div className='w-full h-full p-4 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex flex-col items-start justify-start'>
        <p>{isClassified ? 'CLASSIFIED' : question}</p>

        {active ? (
          <div className='my-1 flex items-center text-sm text-zinc-400'>
            <ClockIcon className='w-5 h-5 mr-1 text-blue-400' />
            Pending Votes
          </div>
        ) : !active && !isClassified && topOption?.isMedia ? (
          <div className='my-1 flex items-center text-sm text-zinc-400'>
            <PaperClipIcon className='w-5 h-5 mr-1 text-amber-400' />
            {topOption?.mediaType} (click to view)
          </div>
        ) : !active && !isClassified && !topOption?.isMedia ? (
          <div className='my-1 flex items-center text-sm text-zinc-400'>
            <TrophyIcon className='w-5 h-5 mr-1 text-amber-400' />
            {topOption?.answer}
          </div>
        ) : null}

        <p className={'mt-4 text-xs ' + (active ? 'text-green-400' : 'text-red-400')}>
          {active ? 'Active until:' : 'Ended at:'} {new Date(endAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default PollCard
