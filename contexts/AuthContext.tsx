import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@meshsdk/react'
import { badApi } from '@/utils/badApi'
import getUser from '@/functions/storage/users/getUser'
import { POLICY_IDS } from '@/constants'
import type { User } from '@/@types'

interface AuthContext {
  user: User | null
  getAndSetUser: () => Promise<void>
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
  const { connecting, connected, name, wallet, disconnect } = useWallet()

  const [openConnectModal, setOpenConnectModal] = useState(false)
  const toggleConnectModal = (bool?: boolean) => setOpenConnectModal((prev) => bool ?? !prev)

  const [user, setUser] = useState<AuthContext['user']>(null)

  const getAndSetUser = useCallback(async (): Promise<void> => {
    toast.dismiss()
    toast.loading('Loading Profile')

    try {
      const stakeKeys = await wallet.getRewardAddresses()
      const stakeKey = stakeKeys[0]
      const lovelaces = Number(await wallet.getLovelace())

      const { addresses, poolId, tokens } = await badApi.wallet.getData(stakeKey, {
        withStakePool: true,
        withTokens: true,
      })

      const populatedTokens = await Promise.all(
        tokens?.map(async (ownedToken) => {
          const fetchedToken = await badApi.token.getData(ownedToken.tokenId)

          return {
            ...fetchedToken,
            tokenAmount: ownedToken.tokenAmount,
          }
        }) || []
      )
      const isTokenGateHolder = !!tokens?.find(({ tokenId }) => tokenId.indexOf(POLICY_IDS['BAD_KEY']) == 0)

      const user = await getUser(stakeKey)

      setUser({
        stakeKey,
        addresses,
        lovelaces,
        username: user?.username || '',
        profilePicture: user?.profilePicture || '',
        poolId,
        isTokenGateHolder,
        tokens: populatedTokens,
      })

      toast.dismiss()
      toast.success('Profile Loaded')
    } catch (error: any) {
      setUser(null)
      disconnect()

      toast.dismiss()
      toast.error(error.message || error.toString())
    }
  }, [name, wallet, disconnect])

  useEffect(() => {
    if (connecting) {
      toast.loading('Connecting Wallet')
    }

    if (connected) {
      toast.dismiss()
      toast.success(`Connected ${name}`)

      getAndSetUser()
    } else {
      setUser(null)
    }
  }, [connecting, connected, getAndSetUser])

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
