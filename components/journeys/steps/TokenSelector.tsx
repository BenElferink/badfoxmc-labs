import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import MediaViewer from '@/components/MediaViewer'
import TokenExplorer from '@/components/TokenExplorer'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { TokenSelectionSettings } from '@/@types'

type AmountType = 'FIXED' | 'PERCENT'

const TokenAmount = (props: {
  defaultData: Partial<TokenSelectionSettings>
  callback: (payload: Partial<TokenSelectionSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const { user } = useAuth()
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
  }, [data])

  const _ticker = data.tokenName?.ticker || ''
  const _decimals = data.tokenAmount?.decimals || 0

  const [balanceOnChain, setBalanceOnChain] = useState(0)
  const [amountType, setAmountType] = useState<AmountType>('FIXED')
  const [amountValue, setAmountValue] = useState(0)
  const mountRef = useRef(false)

  useEffect(() => {
    if (!mountRef.current) {
      const tokenId = defaultData.tokenId || ''

      if (tokenId === 'lovelace') {
        const lovelaces = user?.lovelaces || 0
        setBalanceOnChain(lovelaces)
      } else {
        const found = user?.tokens?.find((token) => token.tokenId === tokenId)
        setBalanceOnChain(found?.tokenAmount.onChain || 0)
      }

      const selectedAmountOnChain = defaultData.tokenAmount?.onChain || 0

      if (selectedAmountOnChain) {
        setAmountValue(selectedAmountOnChain)
        setAmountType('FIXED')
      }

      mountRef.current = true
    }
  }, [defaultData])

  const handleAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    let v = Number(e.target.value)

    if (!isNaN(v)) {
      if (amountType === 'FIXED') {
        v = formatTokenAmount.toChain(v, _decimals)
      }
      v = Math.floor(v)

      // verify the amount is between the min and max ranges (with the help of available balance)
      if (amountType === 'FIXED') {
        const min = 0
        const max = formatTokenAmount.toChain(
          Math.floor(formatTokenAmount.fromChain(balanceOnChain || 0, _decimals)),
          _decimals
        )

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

        v = formatTokenAmount.toChain(
          Math.floor(formatTokenAmount.fromChain(balanceOnChain * (v / 100), _decimals)),
          _decimals
        )

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
      <h6 className='text-xl text-center'>How many tokens?</h6>
      <p className='my-6 text-xs text-center'>The amount is equally devided amongst all policy holders</p>

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
            'group cursor-pointer my-2 p-4 border rounded-lg ' +
            (amountType === 'FIXED' ? 'text-white' : 'text-zinc-400 border-transparent')
          }
        >
          <label className='flex items-center group-hover:text-white cursor-pointer'>
            <input
              type='radio'
              name='amountType'
              value='FIXED'
              onChange={() => {}}
              checked={amountType === 'FIXED'}
            />
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
            'group cursor-pointer my-2 p-4 border rounded-lg ' +
            (amountType === 'PERCENT' ? 'text-white' : 'text-zinc-400 border-transparent')
          }
        >
          <label className='flex items-center group-hover:text-white cursor-pointer'>
            <input
              type='radio'
              name='amountType'
              value='PERCENT'
              onChange={() => {}}
              checked={amountType === 'PERCENT'}
            />
            <span className='ml-2'>Percent Amount</span>
          </label>
        </div>
      </div>

      <input
        placeholder='Token Amount:'
        value={
          amountType === 'FIXED'
            ? formatTokenAmount.fromChain(amountValue, _decimals) || ''
            : amountType === 'PERCENT'
            ? amountValue || ''
            : ''
        }
        onChange={handleAmountChange}
        className='w-full my-2 p-4 flex items-center text-center placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 outline-none'
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
  defaultData: Partial<TokenSelectionSettings>
  callback: (payload: Partial<TokenSelectionSettings>) => void
  next?: () => void
  back?: () => void
  withAmount?: boolean
  onlyFungible?: boolean
  onlyNonFungible?: boolean
}) => {
  const { defaultData, callback, next, back, withAmount, onlyFungible, onlyNonFungible } = props
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
  }, [data])

  const [selectAmount, setSelectAmount] = useState(false)

  if (selectAmount) {
    return (
      <TokenAmount
        defaultData={data}
        callback={(payload) => setData((prev) => ({ ...prev, ...payload }))}
        next={next}
        back={back}
      />
    )
  }

  return (
    <JourneyStepWrapper
      disableNext={!data.tokenId}
      next={() => {
        if (withAmount) setTimeout(() => setSelectAmount(true), 0)
        else if (next) setTimeout(() => next(), 0)
      }}
      back={back}
    >
      <h6 className='text-xl text-center'>Select a Token</h6>

      <TokenExplorer
        selectedTokenId={data.tokenId}
        onlyFungible={onlyFungible}
        onlyNonFungible={onlyNonFungible}
        withAda
        showTokenAmounts
        callback={(payload) => {
          const { isFungible } = payload

          setData({
            thumb: payload['image']['url'],
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
        }}
      />
    </JourneyStepWrapper>
  )
}

export default TokenSelector
