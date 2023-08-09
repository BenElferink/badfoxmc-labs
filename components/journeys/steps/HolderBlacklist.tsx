import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { badApi } from '@/utils/badApi'
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { HolderSettings, StakeKey } from '@/@types'

const HolderBlacklist = (props: {
  defaultData: Partial<HolderSettings>
  callback: (payload: Partial<HolderSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [formData, setFormData] = useState(defaultData)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [value: string]: boolean }>({})

  console.log(formData)

  return (
    <JourneyStepWrapper
      disableNext={
        loading ||
        (formData['withBlacklist'] &&
          !formData['blacklistWallets']?.filter((str) => !!str).length &&
          !formData['blacklistTokens']?.filter((str) => !!str).length)
      }
      disableBack={loading}
      next={async () => {
        setLoading(true)
        let allowNext = true
        const blacklistStakeKeys: StakeKey[] = []

        if (formData['withBlacklist']) {
          toast.loading('Validating')

          for await (const walletId of formData['blacklistWallets'] || []) {
            try {
              if (!!walletId) {
                const { stakeKey } = await badApi.wallet.getData(walletId)
                blacklistStakeKeys.push(stakeKey)
              }

              setFormErrors((prev) => ({ ...prev, [walletId]: false }))
            } catch (error) {
              allowNext = false

              setFormErrors((prev) => ({ ...prev, [walletId]: true }))
            }
          }

          toast.dismiss()
          if (!allowNext) toast.error('Bad Value(s)')
        }

        const filtered = blacklistStakeKeys.filter((str) => !!str)

        callback({
          withBlacklist: !!filtered.length,
          blacklistWallets: filtered,
        })

        setLoading(false)
        if (allowNext && next) setTimeout(() => next(), 0)
      }}
      back={back}
    >
      <h6 className='text-xl text-center'>Blacklist</h6>

      <div
        onClick={() => setFormData(() => ({ withBlacklist: false, blacklistWallets: [] }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withBlacklist'] === false ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input
            type='radio'
            name='withBlacklist'
            onChange={() => {}}
            checked={formData['withBlacklist'] === false}
          />
          <span className='ml-2 text-lg'>No</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>All holders have the right to participate.</p>
      </div>

      <div
        onClick={() => setFormData(() => ({ withBlacklist: true, blacklistWallets: [''] }))}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withBlacklist'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input
            type='radio'
            name='withBlacklist'
            onChange={() => {}}
            checked={formData['withBlacklist'] === true}
          />
          <span className='ml-2 text-lg'>Yes</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>
          Exclude wallets/tokens from participing, regardless of their holdings.
        </p>
      </div>

      <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

      <div>
        {formData['withBlacklist']
          ? (formData['blacklistWallets'] || []).map((str, idx) => (
              <div key={`blacklistWallets-${idx}`} className='flex items-center'>
                <input
                  placeholder='Wallet: $handle / addr1... / stake1...'
                  disabled={!formData['withBlacklist']}
                  value={str}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                      const v = e.target.value

                      if (!payload['blacklistWallets']) {
                        payload['blacklistWallets'] = [v]
                      } else {
                        payload['blacklistWallets'][idx] = v
                      }

                      return payload
                    })
                  }
                  className={
                    'w-full mb-2 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white border rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 outline-none ' +
                    (formErrors[str] ? 'border-red-400' : 'border-transparent')
                  }
                />

                {(formData['blacklistWallets'] || []).length > 1 ? (
                  <button
                    onClick={() => {
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                        if (!payload['blacklistWallets']) {
                          payload['blacklistWallets'] = []
                        }

                        const foundIdx = payload['blacklistWallets'].findIndex((val) => val === str)

                        if (foundIdx !== -1) {
                          payload['blacklistWallets'].splice(foundIdx, 1)
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

      {formData['withBlacklist'] ? (
        <button
          type='button'
          disabled={!!(formData['blacklistWallets'] || []).filter((str) => !str).length}
          onClick={() =>
            setFormData((prev) => {
              const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

              if (!payload['blacklistWallets']) {
                payload['blacklistWallets'] = []
              }

              payload['blacklistWallets'].push('')

              return payload
            })
          }
          className='w-full p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
        >
          <PlusCircleIcon className='w-6 h-6 mr-2' />
          Add another Wallet
        </button>
      ) : null}
    </JourneyStepWrapper>
  )
}

export default HolderBlacklist
