import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@meshsdk/react'
import { AssetExtended } from '@meshsdk/core'
import api from '@/utils/api'
import chunk from '@/functions/chunk'
import eachLimit from '@/functions/eachLimit'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import type { ApiPopulatedToken, User } from '@/@types'
import { POLICY_IDS } from '@/constants'

const BFMC_BANKER_CARD_TOKEN_IDS = [
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303733',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303534',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303633',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303638',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303533',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303532',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303636',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303535',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303531',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303631',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303630',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303539',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303632',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303730',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303637',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303732',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303536',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303537',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303639',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303731',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303635',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303634',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303530',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303538',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303734',
]

interface AuthContext {
  user: User | null
  getAndSetUser: (forceStakeKey?: string) => Promise<void>
  openConnectModal: boolean
  toggleConnectModal: (bool?: boolean) => void
}

const initContext: AuthContext = {
  user: null,
  getAndSetUser: async () => {},
  openConnectModal: false,
  toggleConnectModal: () => {},
}

const AuthContext = createContext(initContext)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = (props: PropsWithChildren) => {
  const { children } = props
  const { connecting, connected, wallet, disconnect } = useWallet()

  const [openConnectModal, setOpenConnectModal] = useState(false)
  const toggleConnectModal = (bool?: boolean) => setOpenConnectModal((prev) => bool ?? !prev)

  const [user, setUser] = useState<AuthContext['user']>(null)

  const getAndSetUser = useCallback(async (): Promise<void> => {
    try {
      const sKey = (await wallet.getRewardAddresses())[0]
      const assets = await wallet.getAssets()
      const isTokenGateHolder = !!assets?.find((a) => a.policyId === POLICY_IDS['BAD_KEY'] || BFMC_BANKER_CARD_TOKEN_IDS.includes(a.unit))

      // const populatedTokens = await Promise.all(tokens?.map((t) => api.token.getData(t.tokenId)) || [])
      const populatedTokens: ApiPopulatedToken[] = []

      await eachLimit<AssetExtended[]>(chunk<AssetExtended>(assets || [], 10), 10, async (items) => {
        for await (const { unit, quantity } of items) {
          try {
            const fetchedToken = await api.token.getData(unit)

            fetchedToken.tokenAmount.onChain = Number(quantity)
            fetchedToken.tokenAmount.display = formatTokenAmount.fromChain(quantity, fetchedToken.tokenAmount.decimals)

            populatedTokens.push(fetchedToken)
          } catch (error: any) {
            if (error.code === 'ECONNRESET') {
              console.error('Connection reset error.')
            } else {
              console.error(error.message)
            }
          }
        }
      })

      setUser({
        stakeKey: sKey,
        tokens: populatedTokens,
        isTokenGateHolder,
      })
    } catch (error: any) {
      setUser(null)
      disconnect()

      toast.dismiss()
      toast.error(error.message || error.toString())
    }
  }, [wallet, disconnect])

  useEffect(() => {
    if (connected && !user) {
      toast.loading('Loading Wallet')

      getAndSetUser().then(() => {
        toast.dismiss()
        toast.success('Wallet Loaded')
      })
    } else if (!connected) {
      setUser(null)
    }
  }, [connecting, connected, user, getAndSetUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        getAndSetUser,
        openConnectModal,
        toggleConnectModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
