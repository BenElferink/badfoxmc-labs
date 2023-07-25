import { useEffect, useState } from 'react'
import TokenExplorer from '@/components/TokenExplorer'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { Settings } from '@/@types'

const FungibleTokenSelector = (props: {
  defaultData: Partial<Settings>
  callback: (payload: Partial<Settings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
  }, [data])

  return (
    <JourneyStepWrapper disableNext={!data.tokenId} next={next} back={back}>
      <h6 className='text-xl text-center'>Select a Fungible Token</h6>

      <TokenExplorer
        selectedTokenId={data.tokenId}
        onlyFungible
        withAda
        showTokenAmounts
        callback={(payload) => {
          setData({
            thumb: payload['image']['url'],
            tokenId: payload['tokenId'],
            tokenName: payload['tokenName'],
            tokenAmount: {
              onChain: 0,
              display: 0,
              decimals: payload['tokenAmount']['decimals'],
            },
          })

          if (next) setTimeout(() => next(), 0)
        }}
      />
    </JourneyStepWrapper>
  )
}

export default FungibleTokenSelector
