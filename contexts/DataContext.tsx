import { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import getPolls from '@/functions/storage/polls/getPolls'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import type { Airdrop, Giveaway, Poll } from '@/@types'

const ctxInit: {
  airdrops: Airdrop[]
  fetchAirdrops: () => Promise<void>
  polls: Poll[]
  fetchPolls: () => Promise<void>
  giveaways: Giveaway[]
  fetchGiveaways: () => Promise<void>
} = {
  airdrops: [],
  fetchAirdrops: async () => {},
  polls: [],
  fetchPolls: async () => {},
  giveaways: [],
  fetchGiveaways: async () => {},
}

const DataContext = createContext(ctxInit)

export const useData = () => {
  return useContext(DataContext)
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [airdrops, setAirdrops] = useState(ctxInit.airdrops)
  const [polls, setPolls] = useState(ctxInit.polls)
  const [giveaways, setGiveaways] = useState(ctxInit.giveaways)

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

  const memoedValue = useMemo(
    () => ({
      airdrops,
      fetchAirdrops,
      polls,
      fetchPolls,
      giveaways,
      fetchGiveaways,
    }),
    [airdrops, fetchAirdrops, polls, fetchPolls, giveaways, fetchGiveaways]
  )

  return <DataContext.Provider value={memoedValue}>{children}</DataContext.Provider>
}
