import { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react'
import getAirdrops from '@/functions/storage/airdrops/getAirdrops'
import type { Airdrop } from '@/@types'

const ctxInit: {
  airdrops: Airdrop[]
  fetchAirdrops: () => Promise<void>
} = {
  airdrops: [],
  fetchAirdrops: async () => {},
}

const DataContext = createContext(ctxInit)

export const useData = () => {
  return useContext(DataContext)
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [airdrops, setAirdrops] = useState(ctxInit.airdrops)

  const fetchAirdrops = useCallback(async () => {
    try {
      const data = await getAirdrops()
      setAirdrops(data)
    } catch (error: any) {
      console.error(error.message)
    }
  }, [])

  const memoedValue = useMemo(
    () => ({
      airdrops,
      fetchAirdrops,
    }),
    [airdrops, fetchAirdrops]
  )

  return <DataContext.Provider value={memoedValue}>{children}</DataContext.Provider>
}
