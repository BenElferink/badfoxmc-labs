import { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react'
import api from '@/utils/api'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import getPolls from '@/functions/storage/polls/getPolls'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import getSwaps from '@/functions/storage/swaps/getSwaps'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import type { Airdrop, ApiPopulatedToken, Giveaway, Poll, Swap, SwapWallet } from '@/@types'
import { DECIMALS, WALLET_ADDRESSES } from '@/constants'

const ctxInit: {
  airdrops: Airdrop[]
  fetchAirdrops: () => Promise<void>
  polls: Poll[]
  fetchPolls: () => Promise<void>
  giveaways: Giveaway[]
  fetchGiveaways: () => Promise<void>
  swaps: Swap[]
  fetchSwaps: () => Promise<void>
  swapWallet: SwapWallet
  fetchSwapWallet: () => Promise<void>
} = {
  airdrops: [],
  fetchAirdrops: async () => {},
  polls: [],
  fetchPolls: async () => {},
  giveaways: [],
  fetchGiveaways: async () => {},
  swaps: [],
  fetchSwaps: async () => {},
  swapWallet: {},
  fetchSwapWallet: async () => {},
}

const DataContext = createContext(ctxInit)

export const useData = () => {
  return useContext(DataContext)
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [airdrops, setAirdrops] = useState(ctxInit.airdrops)
  const [polls, setPolls] = useState(ctxInit.polls)
  const [giveaways, setGiveaways] = useState(ctxInit.giveaways)
  const [swaps, setSwaps] = useState(ctxInit.swaps)
  const [swapWallet, setSwapWallet] = useState(ctxInit.swapWallet)

  const fetchAirdrops = useCallback(async () => {
    try {
      const data = await getAirdrops()
      setAirdrops(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const fetchPolls = useCallback(async () => {
    try {
      const data = await getPolls()
      setPolls(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const fetchGiveaways = useCallback(async () => {
    try {
      const data = await getGiveaways()
      setGiveaways(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const fetchSwaps = useCallback(async () => {
    try {
      const data = await getSwaps()
      setSwaps(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const fetchSwapWallet = useCallback(async () => {
    const { tokens } = await api.wallet.getData(WALLET_ADDRESSES['SWAP_APP'], { withTokens: true, populateTokens: true })

    const walletPayload: SwapWallet = {}

    for await (const { isFungible, policyId, ...token } of tokens as ApiPopulatedToken[]) {
      if (!isFungible) {
        const tokenPayload = {
          ...token,
          policyId,
          isFungible,
        }

        if (walletPayload[policyId]) {
          walletPayload[policyId].tokens.push(tokenPayload)
        } else {
          try {
            const details = await api.policy.market.getDetails(policyId)

            walletPayload[policyId] = {
              name: details.name || policyId,
              thumb: details.pfpUrl || token.image.url,
              floor: formatTokenAmount.fromChain(details.floorPrice, DECIMALS['ADA']),
              tokens: [tokenPayload],
            }
          } catch (error) {
            walletPayload[policyId] = {
              name: policyId,
              thumb: '',
              floor: formatTokenAmount.fromChain(0, DECIMALS['ADA']),
              tokens: [tokenPayload],
            }
          }
        }
      }
    }

    setSwapWallet(walletPayload)
  }, [])

  const memoedValue = useMemo(
    () => ({
      airdrops,
      fetchAirdrops,
      polls,
      fetchPolls,
      giveaways,
      fetchGiveaways,
      swaps,
      fetchSwaps,
      swapWallet,
      fetchSwapWallet,
    }),
    [airdrops, fetchAirdrops, polls, fetchPolls, giveaways, fetchGiveaways, swaps, fetchSwaps, swapWallet, fetchSwapWallet]
  )

  return <DataContext.Provider value={memoedValue}>{children}</DataContext.Provider>
}
