import { Fragment, useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { badApi } from '@/utils/badApi'
import { PlusCircleIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import ProgressBar from '@/components/ProgressBar'
import Loader from '@/components/Loader'
import Input from '@/components/form/Input'
import Button from '@/components/form/Button'
import TrashButton from '@/components/form/TrashButton'
import type { HolderSettings, PolicyId, StakeKey, TokenId } from '@/@types'

interface BlacklistByBlockHeight {
  policyId: PolicyId
  blockHeight: number
  isAfter: boolean
}

const initProgress = {
  msg: '',
  loading: false,
  policy: {
    current: 0,
    max: 0,
  },
  token: {
    current: 0,
    max: 0,
  },
}

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

  const [withWallets, setWithWallets] = useState(false)
  const [withTokens, setWithTokens] = useState(false)
  const [tokensAlreadyScanned, setTokensAlreadyScanned] = useState(false)
  const [blacklistByBlockHeight, setBlacklistByBlockHeight] = useState<BlacklistByBlockHeight[]>([])
  const [progress, setProgress] = useState({ ...initProgress })

  const populateTokenIds = useCallback(async () => {
    const filtered = blacklistByBlockHeight.filter(({ blockHeight }) => !!blockHeight)
    const blacklistTokenIds: TokenId[] = []

    try {
      setProgress((prev) => ({
        ...prev,
        loading: true,
        msg: 'Processing...',
        policy: { ...prev.policy, current: 0, max: filtered.length },
      }))

      for (const { policyId, blockHeight: policyBlockHeight, isAfter: policyBlockHeightIsAfter } of filtered) {
        const { tokens: policyTokens } = await badApi.policy.getData(policyId, { allTokens: true })

        setProgress((prev) => ({
          ...prev,
          token: { ...prev.token, current: 0, max: policyTokens.length },
        }))

        for (let aIdx = 0; aIdx < policyTokens.length; aIdx++) {
          const { tokenId, tokenAmount } = policyTokens[aIdx]

          if (tokenAmount.onChain !== 0) {
            const { mintBlockHeight } = await badApi.token.getData(tokenId, { populateMintTx: true })

            if (policyBlockHeightIsAfter) {
              if ((mintBlockHeight as number) > policyBlockHeight) {
                blacklistTokenIds.push(tokenId)
              }
            } else {
              if ((mintBlockHeight as number) < policyBlockHeight) {
                blacklistTokenIds.push(tokenId)
              }
            }
          }

          setProgress((prev) => ({
            ...prev,
            token: { ...prev.token, current: prev.token.current + 1, max: policyTokens.length },
          }))
        }

        setProgress((prev) => ({
          ...prev,
          policy: { ...prev.policy, current: prev.policy.current + 1, max: filtered.length },
        }))
      }

      setTokensAlreadyScanned(true)
      setFormData((prev) => ({ ...prev, blacklistTokens: blacklistTokenIds }))
      setProgress((prev) => ({ ...prev, loading: false, msg: '' }))
    } catch (error: any) {
      console.error(error)
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

      setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
    }
  }, [blacklistByBlockHeight])

  return (
    <JourneyStepWrapper
      disableNext={
        loading ||
        progress.loading ||
        (formData['withBlacklist'] && !withWallets && !withTokens) ||
        (formData['withBlacklist'] && withWallets && !formData['blacklistWallets']?.filter((str) => !!str).length) ||
        (formData['withBlacklist'] && withTokens && !formData['blacklistTokens']?.filter((str) => !!str).length)
      }
      disableBack={loading || progress.loading}
      next={async () => {
        if (!formData['withBlacklist']) {
          callback({
            withBlacklist: false,
            blacklistWallets: [],
            blacklistTokens: [],
          })

          if (next) return setTimeout(() => next(), 0)
          else return
        }

        setLoading(true)

        let allowNext = true
        const blacklistStakeKeys: StakeKey[] = []
        const blacklistTokenIds: TokenId[] = []

        toast.loading('Validating')

        if (withWallets && formData['blacklistWallets']?.length) {
          for await (const walletId of formData['blacklistWallets']) {
            try {
              if (!!walletId) {
                const { stakeKey: id } = await badApi.wallet.getData(walletId)

                if (!id) throw new Error(`No stake key for wallet ID: ${walletId}`)

                blacklistStakeKeys.push(id)
              }

              setFormErrors((prev) => ({ ...prev, [walletId]: false }))
            } catch (error) {
              allowNext = false

              setFormErrors((prev) => ({ ...prev, [walletId]: true }))
            }
          }
        }

        if (withTokens && formData['blacklistTokens']?.length) {
          if (tokensAlreadyScanned) {
            blacklistTokenIds.push(...formData['blacklistTokens'])
          } else {
            for await (const tokenId of formData['blacklistTokens']) {
              try {
                if (!!tokenId) {
                  const { tokenId: id } = await badApi.token.getData(tokenId)
                  blacklistTokenIds.push(id)
                }

                setFormErrors((prev) => ({ ...prev, [tokenId]: false }))
              } catch (error) {
                allowNext = false

                setFormErrors((prev) => ({ ...prev, [tokenId]: true }))
              }
            }
          }
        }

        toast.dismiss()
        if (!allowNext) toast.error('Bad Value(s)')

        const filteredWallets = blacklistStakeKeys.filter((str) => !!str)
        const filteredTokenIds = blacklistTokenIds.filter((str) => !!str)

        callback({
          withBlacklist: !!filteredWallets.length || !!filteredTokenIds.length,
          blacklistWallets: filteredWallets,
          blacklistTokens: filteredTokenIds,
        })

        setLoading(false)
        if (allowNext && next) setTimeout(() => next(), 0)
      }}
      back={back}
      buttons={
        formData['withBlacklist'] && !formData['blacklistTokens']?.filter((str) => !!str).length
          ? [
              {
                label: 'Populate Token IDs',
                disabled: loading || progress.loading || !blacklistByBlockHeight.filter(({ blockHeight }) => !!blockHeight).length,
                onClick: populateTokenIds,
              },
            ]
          : []
      }
      hoverButtons={tokensAlreadyScanned}
    >
      <h6 className='text-xl text-center'>Blacklist</h6>

      <div
        onClick={() => {
          if (!loading && !progress.loading) {
            setWithWallets(false)
            setWithTokens(false)
            setBlacklistByBlockHeight([])
            setProgress({ ...initProgress })
            setFormData(() => ({ withBlacklist: false, blacklistWallets: [], blacklistTokens: [] }))
          }
        }}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withBlacklist'] === false ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='withBlacklist' onChange={() => {}} checked={formData['withBlacklist'] === false} />
          <span className='ml-2 text-lg'>No</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>All holders have the right to participate.</p>
      </div>

      <div
        onClick={() => {
          if (!loading && !progress.loading) {
            setFormData((prev) => ({ ...prev, withBlacklist: true }))
          }
        }}
        className={
          'group cursor-pointer my-4 p-4 border rounded-lg ' +
          (formData['withBlacklist'] === true ? 'text-white' : 'text-zinc-400 border-transparent')
        }
      >
        <label className='flex items-center group-hover:text-white cursor-pointer'>
          <input type='radio' name='withBlacklist' onChange={() => {}} checked={formData['withBlacklist'] === true} />
          <span className='ml-2 text-lg'>Yes</span>
        </label>
        <p className='mt-1 text-sm group-hover:text-white'>Exclude wallets/tokens from participing, regardless of their holdings.</p>
      </div>

      <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

      {formData['withBlacklist'] ? (
        <Fragment>
          <label className='mx-2 flex items-center text-zinc-400 hover:text-white cursor-pointer'>
            <input
              type='checkbox'
              disabled={loading || progress.loading}
              checked={withWallets}
              onChange={(e) => {
                const checked = e.target.checked

                setWithWallets(checked)
                setFormData((prev) => ({ ...prev, blacklistWallets: checked ? [''] : [] }))
              }}
            />
            <span className='pl-2 py-1 text-lg text-zinc-400'>Blacklist using wallets:</span>
          </label>

          {withWallets ? (
            <div>
              {(formData['blacklistWallets'] || []).map((str, idx) => (
                <div key={`blacklistWallets-${idx}`} className='flex items-center'>
                  <Input
                    placeholder='Wallet: $handle / addr1... / stake1...'
                    error={formErrors[str]}
                    disabled={!formData['withBlacklist'] || loading || progress.loading}
                    value={str}
                    setValue={(v) =>
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                        if (!payload['blacklistWallets']) {
                          payload['blacklistWallets'] = [v]
                        } else {
                          payload['blacklistWallets'][idx] = v
                        }

                        return payload
                      })
                    }
                  />

                  {(formData['blacklistWallets'] || []).length > 1 ? (
                    <TrashButton
                      disabled={loading || progress.loading}
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
                    />
                  ) : null}
                </div>
              ))}

              <Button
                label='Add another Wallet'
                icon={PlusCircleIcon}
                disabled={!!(formData['blacklistWallets'] || []).filter((str) => !str).length || loading || progress.loading}
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
              />
            </div>
          ) : null}

          <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

          <label className='mx-2 flex items-center text-zinc-400 hover:text-white cursor-pointer'>
            <input
              type='checkbox'
              disabled={loading || progress.loading}
              checked={withTokens}
              onChange={(e) => {
                const checked = e.target.checked

                setWithTokens(checked)
                setFormData((prev) => ({ ...prev, blacklistTokens: checked ? [''] : [] }))
                if (!checked) setBlacklistByBlockHeight([])
              }}
            />
            <span className='pl-2 py-1 text-lg text-zinc-400'>Blacklist using tokens:</span>
          </label>

          {withTokens ? (
            <div>
              {(formData['blacklistTokens'] || []).map((str, idx) => (
                <div key={`blacklistTokens-${idx}`} className='flex items-center'>
                  <Input
                    placeholder='Token ID:'
                    error={formErrors[str]}
                    disabled={!formData['withBlacklist'] || loading || progress.loading}
                    value={str}
                    setValue={(v) =>
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                        if (!payload['blacklistTokens']) {
                          payload['blacklistTokens'] = [v]
                        } else {
                          payload['blacklistTokens'][idx] = v
                        }

                        return payload
                      })
                    }
                  />

                  {(formData['blacklistTokens'] || []).length > 1 ? (
                    <TrashButton
                      disabled={loading || progress.loading}
                      onClick={() => {
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                          if (!payload['blacklistTokens']) {
                            payload['blacklistTokens'] = []
                          }

                          const foundIdx = payload['blacklistTokens'].findIndex((val) => val === str)

                          if (foundIdx !== -1) {
                            payload['blacklistTokens'].splice(foundIdx, 1)
                          }

                          return payload
                        })
                      }}
                    />
                  ) : null}
                </div>
              ))}

              <Button
                label='Add another Token'
                icon={PlusCircleIcon}
                disabled={!!(formData['blacklistTokens'] || []).filter((str) => !str).length || loading || progress.loading}
                onClick={() => {
                  setFormData((prev) => {
                    const payload: HolderSettings = JSON.parse(JSON.stringify(prev))

                    if (!payload['blacklistTokens']) {
                      payload['blacklistTokens'] = []
                    }

                    payload['blacklistTokens'].push('')

                    return payload
                  })

                  setTokensAlreadyScanned(false)
                }}
              />

              {!formData['blacklistTokens']?.filter((str) => !!str).length ? (
                progress.loading ? (
                  <Fragment>
                    {progress.policy.max ? <ProgressBar label='Policy IDs' max={progress.policy.max} current={progress.policy.current} /> : null}
                    {progress.token.max ? <ProgressBar label='Tokens' max={progress.token.max} current={progress.token.current} /> : null}
                    <Loader withLabel label={progress.msg} />
                  </Fragment>
                ) : (
                  <Fragment>
                    <p className='pl-4 py-1 text-lg text-zinc-400'>Alternatively, populate Token IDs using block-height:</p>

                    {defaultData['holderPolicies']?.map(({ policyId }, policyIdx) => {
                      const blockIdx = blacklistByBlockHeight.findIndex((item) => item.policyId === policyId)
                      const blockItem = blockIdx !== -1 ? blacklistByBlockHeight[blockIdx] : null

                      return (
                        <div key={`pid-${policyIdx}-${defaultData['holderPolicies']?.length}`}>
                          <div>
                            <div className='flex items-center'>
                              <Input placeholder='Policy ID:' readOnly disabled={!blockItem?.blockHeight} value={policyId} />
                            </div>

                            <div className='flex items-center'>
                              <div className='mx-2 flex flex-wrap items-center'>
                                <label
                                  className={
                                    'mx-2 flex items-center ' +
                                    (!blockItem?.blockHeight ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                                  }
                                >
                                  <input
                                    type='radio'
                                    name={`before-or-after-${policyId}`}
                                    disabled={!blockItem?.blockHeight || loading || progress.loading}
                                    checked={blockItem?.isAfter === false}
                                    onChange={(e) =>
                                      setBlacklistByBlockHeight((prev) => {
                                        const payload: typeof blacklistByBlockHeight = JSON.parse(JSON.stringify(prev))

                                        payload[blockIdx] = {
                                          ...payload[blockIdx],
                                          isAfter: false,
                                        }

                                        return payload
                                      })
                                    }
                                    className='disabled:opacity-50'
                                  />
                                  <span className='ml-2 text-sm'>Minted Before</span>
                                </label>

                                <label
                                  className={
                                    'mx-2 flex items-center ' +
                                    (!blockItem?.blockHeight ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                                  }
                                >
                                  <input
                                    type='radio'
                                    name={`before-or-after-${policyId}`}
                                    disabled={!blockItem?.blockHeight || loading || progress.loading}
                                    checked={blockItem?.isAfter === true}
                                    onChange={(e) =>
                                      setBlacklistByBlockHeight((prev) => {
                                        const payload: typeof blacklistByBlockHeight = JSON.parse(JSON.stringify(prev))

                                        payload[blockIdx] = {
                                          ...payload[blockIdx],
                                          isAfter: true,
                                        }

                                        return payload
                                      })
                                    }
                                    className='disabled:opacity-50'
                                  />
                                  <span className='ml-2 text-sm'>Minted After</span>
                                </label>
                              </div>

                              <div className='flex items-center'>
                                <label className='mx-2 text-zinc-400 whitespace-nowrap'>Block Height:</label>
                                <Input
                                  disabled={!policyId || loading || progress.loading}
                                  value={blockItem?.blockHeight}
                                  setValue={(v) =>
                                    setBlacklistByBlockHeight((prev) => {
                                      const payload: typeof blacklistByBlockHeight = JSON.parse(JSON.stringify(prev))
                                      const n = Number(v)

                                      if (isNaN(n) || n < 0) return payload

                                      if (blockIdx === -1) {
                                        payload.push({
                                          policyId,
                                          blockHeight: n,
                                          isAfter: false,
                                        })
                                      } else {
                                        payload[blockIdx] = {
                                          ...payload[blockIdx],
                                          blockHeight: n,
                                        }
                                      }

                                      return payload
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </Fragment>
                )
              ) : null}
            </div>
          ) : null}

          <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />
        </Fragment>
      ) : null}
    </JourneyStepWrapper>
  )
}

export default HolderBlacklist
