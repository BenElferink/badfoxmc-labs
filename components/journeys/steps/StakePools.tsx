import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { badApi } from '@/utils/badApi'
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { Settings } from '@/@types'

const StakePools = (props: {
  defaultData: Partial<Settings>
  callback: (payload: Partial<Settings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [formData, setFormData] = useState(defaultData)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [value: string]: boolean }>({})

  return (
    <JourneyStepWrapper
      disableNext={loading || (formData['withDelegators'] && !formData['stakePools']?.length)}
      disableBack={loading}
      next={async () => {
        setLoading(true)
        let allowNext = true

        if (formData['withDelegators']) {
          toast.loading('Validating')

          for await (const poolId of formData['stakePools'] || []) {
            try {
              if (!!poolId) await badApi.stakePool.getData(poolId)

              setFormErrors((prev) => ({ ...prev, [poolId]: false }))
            } catch (error) {
              allowNext = false

              setFormErrors((prev) => ({ ...prev, [poolId]: true }))
            }
          }

          toast.dismiss()
          if (!allowNext) toast.error('Bad Value(s)')
        }

        const filtered = (formData['stakePools'] || []).filter((str) => !!str)

        callback({
          withDelegators: !!filtered.length,
          stakePools: filtered,
        })

        setLoading(false)
        if (allowNext && next) setTimeout(() => next(), 0)
      }}
      back={back}
    >
      <h6 className='text-xl text-center'>Should holders be delegating?</h6>

      <div
        onClick={() => setFormData(() => ({ withDelegators: false, stakePools: [] }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withDelegators'] === false ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input
            type='radio'
            name='withDelegators'
            onChange={() => {}}
            checked={formData['withDelegators'] === false}
          />
          <span className='ml-2 text-lg'>No</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          All holders will participate regardless of their delegation.
        </p>
      </div>

      <div
        onClick={() => setFormData(() => ({ withDelegators: true, stakePools: [''] }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withDelegators'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input
            type='radio'
            name='withDelegators'
            onChange={() => {}}
            checked={formData['withDelegators'] === true}
          />
          <span className='ml-2 text-lg'>Yes</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          Only holders that delegate to at least 1 of the defined stake pools will participate.
        </p>
      </div>

      <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

      <div>
        {formData['withDelegators']
          ? (formData['stakePools'] || []).map((str, idx) => (
              <div key={`stake-pool-${idx}`} className='flex items-center'>
                <input
                  placeholder='Pool ID:'
                  disabled={!formData['withDelegators']}
                  value={str}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const payload: Settings = JSON.parse(JSON.stringify(prev))
                      const v = e.target.value

                      if (!payload['stakePools']) {
                        payload['stakePools'] = [v]
                      } else {
                        payload['stakePools'][idx] = v
                      }

                      return payload
                    })
                  }
                  className={
                    'w-full mb-2 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white border rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 outline-none ' +
                    (formErrors[str] ? 'border-red-400' : 'border-transparent')
                  }
                />

                {(formData['stakePools'] || []).length > 1 ? (
                  <button
                    onClick={() => {
                      setFormData((prev) => {
                        const payload: Settings = JSON.parse(JSON.stringify(prev))

                        if (!payload['stakePools']) {
                          payload['stakePools'] = []
                        }

                        const foundIdx = payload['stakePools'].findIndex((val) => val === str)

                        if (foundIdx !== -1) {
                          payload['stakePools'].splice(foundIdx, 1)
                        }

                        return payload
                      })
                    }}
                    className='w-8 h-8 p-1.5 ml-2 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200'
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            ))
          : null}
      </div>

      {formData['withDelegators'] ? (
        <button
          type='button'
          disabled={!!(formData['stakePools'] || []).filter((str) => !str).length}
          onClick={() =>
            setFormData((prev) => {
              const payload: Settings = JSON.parse(JSON.stringify(prev))

              if (!payload['stakePools']) {
                payload['stakePools'] = []
              }

              payload['stakePools'].push('')

              return payload
            })
          }
          className='w-full p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
        >
          <PlusCircleIcon className='w-6 h-6 mr-2' />
          Add another Stake Pool
        </button>
      ) : null}
    </JourneyStepWrapper>
  )
}

export default StakePools
