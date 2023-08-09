import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
import ErrorNotTokenGateHolder from './steps/ErrorNotTokenGateHolder'
import AirdropSnapshotOrFile from './steps/AirdropSnapshotOrFile'
import AirdropSnapshot from './steps/AirdropSnapshot'
import AirdropCustomList from './steps/AirdropCustomList'
import AirdropPayout from './steps/AirdropPayout'
import TokenSelector from './steps/TokenSelector'
import HolderPolicies from './steps/HolderPolicies'
import HolderStakePools from './steps/HolderStakePools'
import HolderBlacklist from './steps/HolderBlacklist'
import type { PayoutHolder, AirdropSettings } from '@/@types'

const defaultSettings: AirdropSettings = {
  tokenId: '',
  tokenName: {
    onChain: '',
    display: '',
    ticker: '',
  },
  tokenAmount: {
    onChain: 0,
    display: 0,
    decimals: 0,
  },
  thumb: '',

  useCustomList: false,
  holderPolicies: [],

  withBlacklist: false,
  blacklistWallets: [],
  blacklistTokens: [],

  withDelegators: false,
  stakePools: [],
}

const AirdropJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Partial<AirdropSettings>>(defaultSettings)
  const [payoutHolders, setPayoutHolders] = useState<PayoutHolder[]>([])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSettings(defaultSettings)
    }
  }, [open])

  if (!user) {
    return (
      <Modal open={open} onClose={onClose}>
        <ErrorNotConnected onClose={onClose} />
      </Modal>
    )
  }

  if (user && !user.isTokenGateHolder) {
    return (
      <Modal open={open} onClose={onClose}>
        <ErrorNotTokenGateHolder />
      </Modal>
    )
  }

  const increment = () => setStep((prev) => prev + 1)
  const decrement = () => setStep((prev) => prev - 1)

  return (
    <Modal open={open} onClose={onClose}>
      {step === 1 ? (
        <AirdropSnapshotOrFile
          defaultData={{
            useCustomList: settings['useCustomList'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
        />
      ) : settings.useCustomList ? (
        step === 2 ? (
          <TokenSelector
            onlyFungible
            withAmount
            defaultData={{
              thumb: settings['thumb'],
              tokenId: settings['tokenId'],
              tokenName: settings['tokenName'],
              tokenAmount: settings['tokenAmount'],
            }}
            callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
            next={increment}
            back={decrement}
          />
        ) : step === 3 ? (
          <AirdropCustomList
            payoutHolders={payoutHolders}
            settings={settings as AirdropSettings}
            callback={(payload) => setPayoutHolders(payload)}
            next={increment}
            back={decrement}
          />
        ) : step === 4 ? (
          <AirdropPayout
            payoutHolders={payoutHolders}
            settings={settings as AirdropSettings}
            callback={(payload) => setPayoutHolders(payload)}
            // next={increment}
            back={decrement}
          />
        ) : null
      ) : step === 2 ? (
        <TokenSelector
          onlyFungible
          withAmount
          defaultData={{
            thumb: settings['thumb'],
            tokenId: settings['tokenId'],
            tokenName: settings['tokenName'],
            tokenAmount: settings['tokenAmount'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 3 ? (
        <HolderPolicies
          isAirdrop
          defaultData={{
            holderPolicies: settings['holderPolicies'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 4 ? (
        <HolderStakePools
          defaultData={{
            withDelegators: settings['withDelegators'],
            stakePools: settings['stakePools'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 5 ? (
        <HolderBlacklist
          defaultData={{
            withBlacklist: settings['withBlacklist'],
            blacklistWallets: settings['blacklistWallets'],
            blacklistTokens: settings['blacklistTokens'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 6 ? (
        <AirdropSnapshot
          payoutHolders={payoutHolders}
          settings={settings as AirdropSettings}
          callback={(payload) => setPayoutHolders(payload)}
          next={increment}
          back={decrement}
        />
      ) : step === 7 ? (
        <AirdropPayout
          payoutHolders={payoutHolders}
          settings={settings as AirdropSettings}
          callback={(payload) => setPayoutHolders(payload)}
          // next={increment}
          back={decrement}
        />
      ) : null}
    </Modal>
  )
}

export default AirdropJourney
