import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
import ErrorNotTokenGateHolder from './steps/ErrorNotTokenGateHolder'
import SnapshotOrFile from './steps/SnapshotOrFile'
import FungibleTokenSelector from './steps/FungibleTokenSelector'
import FungibleTokenAmount from './steps/FungibleTokenAmount'
import HolderPolicies from './steps/HolderPolicies'
import StakePools from './steps/StakePools'
import Blacklist from './steps/Blacklist'
import SnapshotForAirdrop from './steps/SnapshotForAirdrop'
import CustomList from './steps/CustomList'
import BatchAndSignTxs from './steps/BatchAndSignTxs'
import type { PayoutHolder, Settings } from '@/@types'

const defaultSettings: Partial<Settings> = {
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
  blacklist: [],

  withDelegators: false,
  stakePools: [],
}

const AirdropJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Partial<Settings>>(defaultSettings)
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
        <SnapshotOrFile
          defaultData={{
            useCustomList: settings['useCustomList'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
        />
      ) : settings.useCustomList ? (
        step === 2 ? (
          <FungibleTokenSelector
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
          <FungibleTokenAmount
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
        ) : step === 4 ? (
          <CustomList
            payoutHolders={payoutHolders}
            settings={settings as Settings}
            callback={(payload) => setPayoutHolders(payload)}
            next={increment}
            back={decrement}
          />
        ) : step === 5 ? (
          <BatchAndSignTxs
            payoutHolders={payoutHolders}
            settings={settings as Settings}
            callback={(payload) => setPayoutHolders(payload)}
            // next={increment}
            back={decrement}
          />
        ) : null
      ) : step === 2 ? (
        <FungibleTokenSelector
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
        <FungibleTokenAmount
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
      ) : step === 4 ? (
        <HolderPolicies
          defaultData={{
            holderPolicies: settings['holderPolicies'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 5 ? (
        <StakePools
          defaultData={{
            withDelegators: settings['withDelegators'],
            stakePools: settings['stakePools'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 6 ? (
        <Blacklist
          defaultData={{
            withBlacklist: settings['withBlacklist'],
            blacklist: settings['blacklist'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 7 ? (
        <SnapshotForAirdrop
          payoutHolders={payoutHolders}
          settings={settings as Settings}
          callback={(payload) => setPayoutHolders(payload)}
          next={increment}
          back={decrement}
        />
      ) : step === 8 ? (
        <BatchAndSignTxs
          payoutHolders={payoutHolders}
          settings={settings as Settings}
          callback={(payload) => setPayoutHolders(payload)}
          // next={increment}
          back={decrement}
        />
      ) : null}
    </Modal>
  )
}

export default AirdropJourney
