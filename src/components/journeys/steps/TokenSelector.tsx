import { useEffect, useRef, useState } from 'react'
import { useLovelace } from '@meshsdk/react'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import MediaViewer from '@/components/MediaViewer'
import Input from '@/components/form/Input'
import TokenExplorer, { TokenExplorerCollections } from '@/components/TokenExplorer'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { TokenId, TokenSelectionSettings } from '@/@types'

type AmountType = 'FIXED' | 'PERCENT'

const TokenAmount = (props: {
  defaultData: Partial<TokenSelectionSettings>
  callback: (payload: Partial<TokenSelectionSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const { user } = useAuth()
  const lovelaces = useLovelace()
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const _ticker = data.tokenName?.ticker || ''
  const _decimals = data.tokenAmount?.decimals || 0

  const [balanceOnChain, setBalanceOnChain] = useState(0)
  const [amountType, setAmountType] = useState<AmountType>('FIXED')
  const [amountValue, setAmountValue] = useState(0)
  const mountRef = useRef(false)

  useEffect(() => {
    if (!mountRef.current && lovelaces) {
      const tokenId = defaultData.tokenId || ''

      if (tokenId === 'lovelace') {
        setBalanceOnChain(Number(lovelaces || '0'))
      } else {
        setBalanceOnChain(user?.tokens.find((t) => t.tokenId === tokenId)?.tokenAmount.onChain || 0)
      }

      const selectedAmountOnChain = defaultData.tokenAmount?.onChain || 0

      if (selectedAmountOnChain) {
        setAmountValue(selectedAmountOnChain)
        setAmountType('FIXED')
      }

      mountRef.current = true
    }
  }, [defaultData, lovelaces, user?.tokens])

  const handleAmountChange = (val: string) => {
    let v = Number(val)

    if (!isNaN(v)) {
      if (amountType === 'FIXED') v = formatTokenAmount.toChain(v, _decimals)
      v = Math.floor(v)

      // verify the amount is between the min and max ranges (with the help of available balance)
      if (amountType === 'FIXED') {
        const min = 0
        const max = formatTokenAmount.toChain(formatTokenAmount.fromChain(balanceOnChain || 0, _decimals), _decimals)

        v = v < min ? min : v > max ? max : v

        setAmountValue(v)

        setData((prev) => ({
          ...prev,
          tokenAmount: {
            onChain: v,
            display: formatTokenAmount.fromChain(v, _decimals),
            decimals: _decimals,
          },
        }))
      } else if (amountType === 'PERCENT') {
        const min = 0
        const max = 100

        v = v < min ? min : v > max ? max : v

        setAmountValue(v)

        v = formatTokenAmount.toChain(formatTokenAmount.fromChain(balanceOnChain * (v / 100), _decimals), _decimals)

        setData((prev) => ({
          ...prev,
          tokenAmount: {
            onChain: v,
            display: formatTokenAmount.fromChain(v, _decimals),
            decimals: _decimals,
          },
        }))
      }
    }
  }

  return (
    <JourneyStepWrapper disableNext={!data.tokenAmount?.onChain} next={next} back={back}>
      <h6 className='mb-6 text-xl text-center'>How many tokens?</h6>

      <MediaViewer mediaType='IMAGE' src={data.thumb || ''} size='w-[150px] h-[150px] my-8 mx-auto' />

      <div className='flex items-center justify-center'>
        <div
          onClick={() => {
            setAmountType(() => 'FIXED')
            setAmountValue(0)
            setData((prev) => ({
              ...prev,
              tokenAmount: {
                onChain: 0,
                display: 0,
                decimals: _decimals,
              },
            }))
          }}
          className={
            'group cursor-pointer my-2 p-4 border rounded-lg ' + (amountType === 'FIXED' ? 'text-white' : 'text-zinc-400 border-transparent')
          }
        >
          <label className='flex items-center group-hover:text-white cursor-pointer'>
            <input type='radio' name='amountType' value='FIXED' onChange={() => {}} checked={amountType === 'FIXED'} />
            <span className='ml-2'>Fixed Amount</span>
          </label>
        </div>

        <div
          onClick={() => {
            setAmountType(() => 'PERCENT')
            setAmountValue(0)
            setData((prev) => ({
              ...prev,
              tokenAmount: {
                onChain: 0,
                display: 0,
                decimals: _decimals,
              },
            }))
          }}
          className={
            'group cursor-pointer my-2 p-4 border rounded-lg ' + (amountType === 'PERCENT' ? 'text-white' : 'text-zinc-400 border-transparent')
          }
        >
          <label className='flex items-center group-hover:text-white cursor-pointer'>
            <input type='radio' name='amountType' value='PERCENT' onChange={() => {}} checked={amountType === 'PERCENT'} />
            <span className='ml-2'>Percent Amount</span>
          </label>
        </div>
      </div>

      <Input
        placeholder='Token Amount:'
        value={amountType === 'FIXED' ? formatTokenAmount.fromChain(amountValue, _decimals) || '' : amountType === 'PERCENT' ? amountValue || '' : ''}
        setValue={(v) => handleAmountChange(v)}
      />

      <p className='my-2 text-center text-xs text-zinc-400'>
        Translates to:&nbsp;
        <span className='text-zinc-200'>{(data.tokenAmount?.display || 0).toLocaleString('en-US')}</span>
        {_ticker ? <>&nbsp;${_ticker}</> : ''}
      </p>
    </JourneyStepWrapper>
  )
}

const TokenSelector = (props: {
  defaultData: Partial<TokenSelectionSettings> | TokenId[]
  callback: (payload: Partial<TokenSelectionSettings> | TokenId[]) => void
  next?: () => void
  back?: () => void
  multiSelect?: boolean
  withAda?: boolean
  withAmount?: boolean
  onlyFungible?: boolean
  onlyNonFungible?: boolean
  forceCollections?: TokenExplorerCollections
  forceTitle?: string
}) => {
  const { defaultData, callback, next, back, multiSelect, withAda, withAmount, onlyFungible, onlyNonFungible, forceCollections, forceTitle } = props

  const [data, setData] = useState<Partial<TokenSelectionSettings>>(multiSelect ? {} : (defaultData as TokenSelectionSettings))
  const [dataForMultiSelect, setDataForMultiSelect] = useState<TokenId[]>(multiSelect ? (defaultData as TokenId[]) : [])

  useEffect(() => {
    if (multiSelect) {
      if (dataForMultiSelect.length) callback(dataForMultiSelect)
    } else {
      if (Object.keys(data).length) callback(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiSelect, data, dataForMultiSelect])

  const [selectAmount, setSelectAmount] = useState(false)

  if (selectAmount) {
    return (
      <TokenAmount
        defaultData={data as TokenSelectionSettings}
        callback={(payload) => setData((prev) => ({ ...prev, ...payload }))}
        next={next}
        back={back}
      />
    )
  }

  return (
    <JourneyStepWrapper
      disableNext={(!multiSelect && !data.tokenId) || (multiSelect && !dataForMultiSelect.length)}
      back={back}
      next={() => {
        if (withAmount) setSelectAmount(true)
        else if (next) next()
      }}
    >
      <h6 className='text-xl text-center'>
        {forceTitle || `Select ${onlyFungible ? 'Token' : onlyNonFungible ? 'NFT' : 'Asset'}${multiSelect ? 's' : ''}`}
      </h6>

      <TokenExplorer
        selectedTokenIds={multiSelect ? dataForMultiSelect : data.tokenId ? [data.tokenId] : []}
        withAda={withAda}
        onlyFungible={onlyFungible}
        onlyNonFungible={onlyNonFungible}
        showTokenAmounts={withAmount}
        forceCollections={forceCollections}
        callback={(payload) => {
          if (multiSelect) {
            setDataForMultiSelect((prev) => {
              const mutated = [...prev]

              const tId = payload['tokenId']
              const idx = mutated.findIndex((str) => str === tId)

              if (idx !== -1) {
                mutated.splice(idx, 1)
              } else {
                mutated.push(tId)
              }

              return mutated
            })
          } else {
            const { isFungible } = payload

            setData({
              thumb: payload['image']['ipfs'] || payload['image']['url'],
              tokenId: payload['tokenId'],
              tokenName: payload['tokenName'],
              tokenAmount: {
                onChain: withAmount && isFungible ? 0 : payload['tokenAmount']['onChain'],
                display: withAmount && isFungible ? 0 : payload['tokenAmount']['display'],
                decimals: payload['tokenAmount']['decimals'],
              },
            })

            if (withAmount) setTimeout(() => setSelectAmount(true), 0)
            else if (next) setTimeout(() => next(), 0)
          }
        }}
      />
    </JourneyStepWrapper>
  )
}

export default TokenSelector
