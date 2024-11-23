import { useState } from 'react'
import Modal from '../Modal'
import AirdropMethod from './steps/AirdropMethod'
import AirdropSnapshot from './steps/AirdropSnapshot'
import AirdropCustomList from './steps/AirdropCustomList'
import AirdropPayout from './steps/AirdropPayout'
import TokenSelector from './steps/TokenSelector'
import HolderPolicies from './steps/HolderPolicies'
import StakePools from './steps/StakePools'
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

  airdropMethod: 'none',

  holderPolicies: [],

  withBlacklist: false,
  blacklistWallets: [],
  blacklistTokens: [],

  withDelegators: false,
  stakePools: [],
}

const AirdropJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Partial<AirdropSettings>>(defaultSettings)
  const [payoutHolders, setPayoutHolders] = useState<PayoutHolder[]>([])

  const handleClose = () => {
    setStep(1)
    setSettings(defaultSettings)
    setPayoutHolders([])
    onClose()
  }

  const increment = () => setStep((prev) => prev + 1)
  const decrement = () => setStep((prev) => prev - 1)

  const renderHolderJourney = () => {
    return step === 2 ? (
      <TokenSelector
        onlyFungible
        withAda
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
        defaultData={{
          holderPolicies: settings['holderPolicies'],
        }}
        callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
        next={increment}
        back={decrement}
      />
    ) : step === 4 ? (
      <StakePools
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
          holderPolicies: settings['holderPolicies'],
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
        // next={increment}
        back={decrement}
      />
    ) : null
  }

  const renderDelegatorJourney = () => {
    return step === 2 ? (
      <TokenSelector
        onlyFungible
        withAda
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
      <StakePools
        defaultData={{
          withDelegators: settings['withDelegators'],
          stakePools: settings['stakePools'],
        }}
        callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
        next={increment}
        back={decrement}
        noHolders
      />
    ) : step === 4 ? (
      <AirdropSnapshot
        payoutHolders={payoutHolders}
        settings={settings as AirdropSettings}
        callback={(payload) => setPayoutHolders(payload)}
        next={increment}
        back={decrement}
      />
    ) : step === 5 ? (
      <AirdropPayout
        payoutHolders={payoutHolders}
        settings={settings as AirdropSettings}
        // next={increment}
        back={decrement}
      />
    ) : null
  }

  const renderCustomListJourney = () => {
    return step === 2 ? (
      <TokenSelector
        onlyFungible
        withAda
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
        // next={increment}
        back={decrement}
      />
    ) : null
  }

  return (
    <Modal withConnected open={open} onClose={handleClose}>
      {step === 1 ? (
        <AirdropMethod
          defaultData={{
            airdropMethod: settings['airdropMethod'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
        />
      ) : settings.airdropMethod === 'holder-snapshot' ? (
        renderHolderJourney()
      ) : settings.airdropMethod === 'delegator-snapshot' ? (
        renderDelegatorJourney()
      ) : settings.airdropMethod === 'custom-list' ? (
        renderCustomListJourney()
      ) : null}
    </Modal>
  )
}

export default AirdropJourney
