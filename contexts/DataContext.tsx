import { createContext, useState, useContext, useMemo, ReactNode, useEffect, useCallback } from 'react'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import getPolls from '@/functions/storage/polls/getPolls'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import type { Airdrop, Giveaway, Poll } from '@/@types'

const ctxInit: {
  airdrops: Airdrop[]
  refetchAirdrops: () => Promise<void>
  polls: Poll[]
  refetchPolls: () => Promise<void>
  giveaways: Giveaway[]
  refetchGiveaways: () => Promise<void>
} = {
  airdrops: [],
  refetchAirdrops: async () => {},
  polls: [],
  refetchPolls: async () => {},
  giveaways: [],
  refetchGiveaways: async () => {},
}

const DataContext = createContext(ctxInit)

export const useData = () => {
  return useContext(DataContext)
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [airdrops, setAirdrops] = useState(ctxInit.airdrops)
  const [polls, setPolls] = useState(ctxInit.polls)
  const [giveaways, setGiveaways] = useState(ctxInit.giveaways)

  const refetchAirdrops = useCallback(async () => {
    try {
      const data = await getAirdrops()
      setAirdrops(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const refetchPolls = useCallback(async () => {
    try {
      const data = await getPolls()
      setPolls(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const refetchGiveaways = useCallback(async () => {
    try {
      const data = await getGiveaways()
      setGiveaways(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const memoedValue = useMemo(
    () => ({
      airdrops,
      refetchAirdrops,
      polls,
      refetchPolls,
      giveaways,
      refetchGiveaways,
    }),
    [airdrops, refetchAirdrops, polls, refetchPolls, giveaways, refetchGiveaways]
  )

  return <DataContext.Provider value={memoedValue}>{children}</DataContext.Provider>
}
