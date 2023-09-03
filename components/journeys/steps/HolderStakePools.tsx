import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '@/utils/api'
import { PlusCircleIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import Input from '@/components/form/Input'
import Button from '@/components/form/Button'
import TrashButton from '@/components/form/TrashButton'
import type { HolderSettings } from '@/@types'

const HolderStakePools = (props: {
  defaultData: Partial<HolderSettings>
  callback: (payload: Partial<HolderSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [formData, setFormData] = useState(defaultData)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [value: string]: boolean }>({})

  return (
    <JourneyStepWrapper
      disableNext={loading || (formData['withDelegators'] && !formData['stakePools']?.filter((str) => !!str).length)}
      disableBack={loading}
      next={async () => {
        setLoading(true)
        let allowNext = true

        if (formData['withDelegators']) {
          toast.loading('Validating')

          for await (const poolId of formData['stakePools'] || []) {
            try {
              if (!!poolId) await api.stakePool.getData(poolId)

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
          <input type='radio' name='withDelegators' onChange={() => {}} checked={formData['withDelegators'] === false} />
          <span className='ml-2 text-lg'>No</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>All holders will participate regardless of their delegation.</p>
      </div>

      <div
        onClick={() => setFormData(() => ({ withDelegators: true, stakePools: [''] }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withDelegators'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='withDelegators' onChange={() => {}} checked={formData['withDelegators'] === true} />
          <span className='ml-2 text-lg'>Yes</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>Only holders that delegate to at least 1 of the defined stake pools will participate.</p>
      </div>

      <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

      <div>
        {formData['withDelegators']
          ? (formData['stakePools'] || []).map((str, idx) => (
              <div key={`stake-pool-${idx}`} className='flex items-center'>
                <Input
                  placeholder='Pool ID:'
                  error={formErrors[str]}
                  disabled={!formData['withDelegators']}
                  value={str}
                  setValue={(v) =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                      if (!payload['stakePools']) {
                        payload['stakePools'] = [v]
                      } else {
                        payload['stakePools'][idx] = v
                      }

                      return payload
                    })
                  }
                />

                {(formData['stakePools'] || []).length > 1 ? (
                  <TrashButton
                    onClick={() => {
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

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
                  />
                ) : null}
              </div>
            ))
          : null}
      </div>

      {formData['withDelegators'] ? (
        <Button
          label='Add another Stake Pool'
          icon={PlusCircleIcon}
          disabled={!!(formData['stakePools'] || []).filter((str) => !str).length}
          onClick={() =>
            setFormData((prev) => {
              const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

              if (!payload['stakePools']) {
                payload['stakePools'] = []
              }

              payload['stakePools'].push('')

              return payload
            })
          }
        />
      ) : null}
    </JourneyStepWrapper>
  )
}

export default HolderStakePools
