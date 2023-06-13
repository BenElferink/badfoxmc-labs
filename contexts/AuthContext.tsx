import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@meshsdk/react'
import { BrowserWallet } from '@meshsdk/core'
import { badApi } from '@/utils/badApi'
import type { User } from '@/@types'
import { POLICY_IDS } from '@/constants'

interface AuthContext {
  user: User | null
}

const initContext: AuthContext = {
  user: null,
}

const AuthContext = createContext(initContext)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = (props: PropsWithChildren) => {
  const { children } = props
  const { connecting, connected, name, wallet, disconnect } = useWallet()

  const [user, setUser] = useState<AuthContext['user']>(null)

  const getUser = useCallback(async (_wallet: BrowserWallet): Promise<User> => {
    const stakeKeys = await _wallet.getRewardAddresses()
    const stakeKey = stakeKeys[0]

    const { addresses, poolId, tokens } = await badApi.wallet.getData(stakeKey, {
      withStakePool: true,
      withTokens: true,
    })

    const populatedTokens = await Promise.all(tokens?.map((token) => badApi.token.getData(token.tokenId)) || [])
    const isTokenGateHolder = !!tokens?.find(({ tokenId }) => tokenId.indexOf(POLICY_IDS['BAD_KEY']) == 0)

    return {
      stakeKey,
      addresses,
      poolId,
      tokens: populatedTokens,
      isTokenGateHolder,
      username: '',
      profilePicture: '',
    }
  }, [])

  useEffect(() => {
    if (connecting) {
      toast.loading('Connecting Wallet')
    }

    if (connected) {
      getUser(wallet)
        .then((data) => {
          setUser(data)

          toast.dismiss()
          toast.success(`Connected ${name}`)
        })
        .catch((error) => {
          disconnect()

          toast.dismiss()
          toast.error(error.message || error.toString())
        })
    } else {
      setUser(null)
    }
  }, [connecting, connected, name, wallet, getUser])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
