import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useState } from 'react'
import { toast } from 'react-hot-toast'
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid'
import { badApi } from '@/utils/badApi'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { HolderSettings } from '@/@types'

const INIT_TRAIT_POINTS = {
  category: '',
  trait: '',
  amount: 0,
}
const INIT_RANK_POINTS = {
  minRange: 0,
  maxRange: 0,
  amount: 0,
}
const INIT_HOLDER_SETTINGS = {
  policyId: '',
  weight: 1,
  withTraits: false,
  traitOptions: [{ ...INIT_TRAIT_POINTS }],
  withRanks: false,
  rankOptions: [{ ...INIT_RANK_POINTS }],
}

const HolderPolicies = (props: {
  defaultData: Partial<HolderSettings>
  callback: (payload: Partial<HolderSettings>) => void
  next?: () => void
  back?: () => void
  isAirdrop?: boolean
}) => {
  const { defaultData, callback, next, back, isAirdrop } = props
  const [formData, setFormData] = useState({
    holderPolicies: defaultData['holderPolicies']?.length
      ? defaultData['holderPolicies']
      : [{ ...INIT_HOLDER_SETTINGS }],
  })

  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [value: string]: boolean }>({})

  return (
    <JourneyStepWrapper
      disableNext={loading || !formData['holderPolicies']?.length}
      disableBack={loading}
      next={async () => {
        setLoading(true)
        let allowNext = true

        if (formData['holderPolicies'].length) {
          toast.loading('Validating')

          for await (const { policyId } of formData['holderPolicies']) {
            try {
              if (!!policyId) await badApi.policy.getData(policyId)

              setFormErrors((prev) => ({ ...prev, [policyId]: false }))
            } catch (error) {
              allowNext = false

              setFormErrors((prev) => ({ ...prev, [policyId]: true }))
            }
          }

          toast.dismiss()
          if (!allowNext) toast.error('Bad Value(s)')
        }

        const filtered = formData['holderPolicies']
          .filter((obj) => !!obj.policyId)
          .map((obj) => {
            const traitOptions =
              obj.withTraits && obj.traitOptions.length
                ? obj.traitOptions.filter(
                    (traitObj) => !!traitObj.category && !!traitObj.trait && !!traitObj.amount
                  )
                : []

            const rankOptions =
              obj.withRanks && obj.rankOptions.length
                ? obj.rankOptions.filter(
                    (traitObj) => !!traitObj.minRange && !!traitObj.maxRange && !!traitObj.amount
                  )
                : []

            return {
              ...obj,
              withTraits: !!traitOptions.length,
              traitOptions,
              withRanks: !!rankOptions.length,
              rankOptions,
            }
          })

        callback({
          holderPolicies: filtered,
        })

        setLoading(false)
        if (allowNext && next) setTimeout(() => next(), 0)
      }}
      back={back}
    >
      <h6 className='text-xl text-center'>Who are the holders?</h6>
      <p className='my-6 text-xs text-center'>
        * Weight is the multiplier of that Policy ID (default 1)
        <br />
        (For example: you may want to give pass holders 2x points than pfp holders)
        {isAirdrop ? (
          <Fragment>
            <br />
            <br />* Trait & Rank points are non-inclusive (additional to the amount previously selected)
          </Fragment>
        ) : null}
        <br />
        <br />* Ranks are obtained from
        <Link href='https://cnft.tools' target='_blank' rel='noopener noreferrer' className='group'>
          <Image
            src='https://badfoxmc.com/media/logo/other/cnfttools.png'
            alt=''
            width={20}
            height={20}
            className='inline ml-1 mr-0.5'
            priority
            unoptimized
          />
          <span className='text-blue-200 group-hover:underline'>cnft.tools</span>
        </Link>
      </p>

      {formData['holderPolicies']?.map(
        ({ policyId, weight, withTraits, traitOptions, withRanks, rankOptions }, policyIdx) => (
          <div key={`pid-${policyIdx}-${formData['holderPolicies'].length}`}>
            <div>
              <div className='flex items-center'>
                <input
                  placeholder='Policy ID:'
                  value={policyId}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                      // @ts-ignore
                      payload['holderPolicies'][policyIdx] = {
                        // @ts-ignore
                        ...payload['holderPolicies'][policyIdx],
                        policyId: e.target.value,
                      }

                      return payload
                    })
                  }
                  className={
                    'w-full my-2 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white border rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 outline-none ' +
                    (formErrors[policyId] ? 'border-red-400' : '')
                  }
                />
                {/* @ts-ignore */}
                {formData['holderPolicies'].length > 1 ? (
                  <button
                    onClick={() => {
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                        payload['holderPolicies'].splice(policyIdx, 1)

                        return payload
                      })
                    }}
                    className='w-8 h-8 p-1.5 ml-2 text-sm text-red-400 rounded-full bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200'
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>

              <div className='flex items-center'>
                <div className='flex items-center'>
                  <label className={'mr-2 ml-4 ' + (!policyId ? 'text-zinc-600' : 'text-zinc-400')}>Weight:</label>
                  <input
                    disabled={!policyId}
                    value={String(weight)}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                        const v = Number(e.target.value)

                        if (isNaN(v) || v < 0) return payload

                        // @ts-ignore
                        payload['holderPolicies'][policyIdx] = {
                          // @ts-ignore
                          ...payload['holderPolicies'][policyIdx],
                          weight: v,
                        }

                        return payload
                      })
                    }
                    className='w-20 my-0 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                  />
                </div>

                <div className='ml-4 flex flex-wrap items-center'>
                  <label
                    className={
                      'mx-2 flex items-center ' +
                      (!policyId
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white cursor-pointer')
                    }
                  >
                    <input
                      type='checkbox'
                      disabled={!policyId}
                      checked={withTraits}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                          payload['holderPolicies'][policyIdx] = {
                            ...payload['holderPolicies'][policyIdx],
                            withTraits: !withTraits,
                            traitOptions: [{ ...INIT_TRAIT_POINTS }],
                          }

                          return payload
                        })
                      }
                      className='disabled:opacity-50'
                    />
                    <span className='ml-2 text-sm'>Trait Points</span>
                  </label>

                  <label
                    className={
                      'mx-2 flex items-center ' +
                      (!policyId
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white cursor-pointer')
                    }
                  >
                    <input
                      type='checkbox'
                      disabled={!policyId}
                      checked={withRanks}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                          payload['holderPolicies'][policyIdx] = {
                            ...payload['holderPolicies'][policyIdx],
                            withRanks: !withRanks,
                            rankOptions: [{ ...INIT_RANK_POINTS }],
                          }

                          return payload
                        })
                      }
                      className='disabled:opacity-50'
                    />
                    <span className='ml-2 text-sm'>Rank Points</span>
                  </label>
                </div>
              </div>
            </div>

            {withTraits ? (
              <div className='w-full'>
                {traitOptions.map(({ category, trait, amount }, rewardingTraitsIdx) => (
                  <div
                    key={`pid-${policyIdx}-${formData['holderPolicies'].length}-trait-${rewardingTraitsIdx}-${traitOptions.length}`}
                    className='my-1'
                  >
                    <div className='flex items-center justify-between'>
                      <input
                        placeholder='Category: (ex. Eyewear)'
                        disabled={!policyId || !withTraits}
                        value={category}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...traitOptions]

                            arr[rewardingTraitsIdx].category = e.target.value

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      <input
                        placeholder='Value: (ex. 3D Glasses)'
                        disabled={!policyId || !withTraits}
                        value={trait}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...traitOptions]

                            arr[rewardingTraitsIdx].trait = e.target.value

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      <input
                        placeholder='Amount: (ex. 10)'
                        disabled={!policyId || !withTraits}
                        value={String(amount || '')}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...traitOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v < 0) return payload

                            arr[rewardingTraitsIdx].amount = v

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      {traitOptions.length > 1 ? (
                        <button
                          onClick={() =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                traitOptions: traitOptions.filter((_item, _idx) => _idx !== rewardingTraitsIdx),
                              }

                              return payload
                            })
                          }
                          className='w-8 h-8 p-1.5 m-0 ml-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200'
                        >
                          <TrashIcon />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                <button
                  type='button'
                  disabled={
                    !!formData['holderPolicies'][policyIdx].traitOptions.filter(
                      (obj) => !obj.category || !obj.trait || !obj.amount
                    ).length
                  }
                  onClick={() =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                      payload['holderPolicies'][policyIdx].traitOptions.push({ ...INIT_TRAIT_POINTS })

                      return payload
                    })
                  }
                  className='w-full my-2 p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
                >
                  <PlusCircleIcon className='w-6 h-6 mr-2' />
                  Add another Attribute
                </button>
              </div>
            ) : null}

            {withRanks ? (
              <div className='w-full'>
                {rankOptions.map(({ minRange, maxRange, amount }, rewardingRanksIdx) => (
                  <div
                    key={`pid-${policyIdx}-${formData['holderPolicies'].length}-rank-${rewardingRanksIdx}-${rankOptions.length}`}
                    className='my-1'
                  >
                    <div className='flex items-center justify-between'>
                      <input
                        placeholder='Min. Range: (ex. 1)'
                        disabled={!policyId || !withRanks}
                        value={minRange || ''}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v < 0) return payload

                            arr[rewardingRanksIdx].minRange = v

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      <input
                        placeholder='Max. Range: (ex. 1000)'
                        disabled={!policyId || !withRanks}
                        value={maxRange || ''}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v < 0) return payload

                            arr[rewardingRanksIdx].maxRange = v

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      <input
                        placeholder='Amount: (ex. 10)'
                        disabled={!policyId || !withRanks}
                        value={String(amount || '')}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v < 0) return payload

                            arr[rewardingRanksIdx].amount = v

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='grow mx-0.5 p-4 flex items-center text-start placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:placeholder:text-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none'
                      />

                      {rankOptions.length > 1 ? (
                        <button
                          onClick={() =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                rankOptions: rankOptions.filter((_item, _idx) => _idx !== rewardingRanksIdx),
                              }

                              return payload
                            })
                          }
                          className='w-8 h-8 p-1.5 m-0 ml-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200'
                        >
                          <TrashIcon />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                <button
                  type='button'
                  disabled={
                    !!formData['holderPolicies'][policyIdx].rankOptions.filter(
                      (obj) => !obj.minRange || !obj.maxRange || !obj.amount
                    ).length
                  }
                  onClick={() =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                      payload['holderPolicies'][policyIdx].rankOptions.push({ ...INIT_RANK_POINTS })

                      return payload
                    })
                  }
                  className='w-full my-2 p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
                >
                  <PlusCircleIcon className='w-6 h-6 mr-2' />
                  Add another Range
                </button>
              </div>
            ) : null}

            <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />
          </div>
        )
      )}

      <button
        type='button'
        disabled={!formData.holderPolicies?.filter((obj) => !!obj.policyId).length}
        onClick={() =>
          setFormData((prev) => {
            const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

            payload['holderPolicies'].push({ ...INIT_HOLDER_SETTINGS })

            return payload
          })
        }
        className='w-full p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
      >
        <PlusCircleIcon className='w-6 h-6 mr-2' />
        Add another Policy ID
      </button>
    </JourneyStepWrapper>
  )
}

export default HolderPolicies
