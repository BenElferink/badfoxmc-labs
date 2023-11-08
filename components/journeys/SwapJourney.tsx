import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
import TokenSelector from './steps/TokenSelector'
import SwapSelection from './steps/SwapSelection'
import type { SwapSettings, TokenSelectionSettings } from '@/@types'
import type { TokenExplorerCollections } from '../TokenExplorer'

const defaultSettings: SwapSettings = {
  withdraw: {
    tokenId: '',
    thumb: '',
    tokenName: {
      onChain: '',
      display: '',
      ticker: '',
    },
  },
  deposit: {
    tokenId: '',
    thumb: '',
    tokenName: {
      onChain: '',
      display: '',
      ticker: '',
    },
  },
}

const SwapJourney = (props: { collections: TokenExplorerCollections; open: boolean; onClose: (options?: { withRefetch?: boolean }) => void }) => {
  const { collections, open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<SwapSettings>(defaultSettings)

  const handleClose = () => {
    setStep(1)
    setSettings(defaultSettings)
    onClose({ withRefetch: step === 5 })
  }

  if (!user) {
    return (
      <Modal open={open} onClose={handleClose}>
        <ErrorNotConnected onClose={handleClose} />
      </Modal>
    )
  }

  const increment = () => setStep((prev) => prev + 1)
  const decrement = () => setStep((prev) => prev - 1)

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 1 ? (
        <SwapSelection defaultData={settings} next={increment} />
      ) : step === 2 ? (
        <TokenSelector
          forceTitle='Select a Token to Withdraw'
          forceCollections={collections}
          defaultData={{
            tokenId: settings['withdraw']['tokenId'],
            thumb: settings['withdraw']['thumb'],
            tokenName: settings['withdraw']['tokenName'],
          }}
          callback={(payload) =>
            setSettings((prev) => ({
              ...prev,
              withdraw: {
                ...(payload as TokenSelectionSettings),
              },
            }))
          }
          next={increment}
        />
      ) : step === 3 ? (
        <SwapSelection defaultData={settings} back={decrement} next={increment} />
      ) : step === 4 ? (
        <TokenSelector
          forceTitle='Select a Token to Deposit'
          forceCollections={collections.map((c) => ({
            policyId: c.policyId,
            tokens: user.tokens?.filter((t) => t.tokenId.indexOf(c.policyId) === 0) || [],
          }))}
          defaultData={{
            tokenId: settings['deposit']['tokenId'],
            thumb: settings['deposit']['thumb'],
            tokenName: settings['deposit']['tokenName'],
          }}
          callback={(payload) =>
            setSettings((prev) => ({
              ...prev,
              deposit: {
                ...(payload as TokenSelectionSettings),
              },
            }))
          }
          back={decrement}
          next={increment}
        />
      ) : step === 5 ? (
        <SwapSelection defaultData={settings} back={decrement} />
      ) : null}
    </Modal>
  )
}

export default SwapJourney
