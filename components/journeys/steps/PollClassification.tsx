import { useEffect, useState } from 'react'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { PollSettings } from '@/@types'

const PollClassification = (props: {
  defaultData: Partial<PollSettings>
  callback: (payload: Partial<PollSettings>) => void
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
    <JourneyStepWrapper disableNext={false} next={next} back={back}>
      <h6 className='mb-6 text-xl text-center'>Should this poll be classified?</h6>

      <div
        onClick={() => setData(() => ({ isClassified: false }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' + (data['isClassified'] === false ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='isClassified' onChange={() => {}} checked={data['isClassified'] === false} />
          <span className='ml-2 text-lg'>No</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>Allow anyone to view this poll & it&apos;s results, but only holders can vote.</p>
      </div>

      <div
        onClick={() => setData(() => ({ isClassified: true }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' + (data['isClassified'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='isClassified' onChange={() => {}} checked={data['isClassified'] === true} />
          <span className='ml-2 text-lg'>Yes</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          Only holders can view this poll & it&apos;s results (Alpha Groups / DAOs may need this).
        </p>
      </div>
    </JourneyStepWrapper>
  )
}

export default PollClassification
