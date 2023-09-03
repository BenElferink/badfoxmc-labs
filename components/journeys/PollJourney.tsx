import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
// import ErrorNotTokenGateHolder from './steps/ErrorNotTokenGateHolder'
import HolderPolicies from './steps/HolderPolicies'
import HolderStakePools from './steps/HolderStakePools'
import HolderBlacklist from './steps/HolderBlacklist'
import EndTime from './steps/EndTime'
import PollClassification from './steps/PollClassification'
import PollContent from './steps/PollContent'
import PollPublish from './steps/PollPublish'
import type { PollSettings } from '@/@types'

const defaultSettings: PollSettings = {
  isClassified: false,
  endAt: 0,

  question: '',
  description: '',
  options: [],

  holderPolicies: [],

  withDelegators: false,
  stakePools: [],

  withBlacklist: false,
  blacklistWallets: [],
  blacklistTokens: [],
}

const PollJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Partial<PollSettings>>(defaultSettings)

  const handleClose = () => {
    setStep(1)
    setSettings(defaultSettings)
    onClose()
  }

  if (!user) {
    return (
      <Modal open={open} onClose={handleClose}>
        <ErrorNotConnected onClose={handleClose} />
      </Modal>
    )
  }

  // if (user && !user.isTokenGateHolder) {
  //   return (
  //     <Modal open={open} onClose={handleClose}>
  //       <ErrorNotTokenGateHolder />
  //     </Modal>
  //   )
  // }

  const increment = () => setStep((prev) => prev + 1)
  const decrement = () => setStep((prev) => prev - 1)

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 1 ? (
        <PollClassification
          defaultData={{
            isClassified: settings['isClassified'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 2 ? (
        <PollContent
          defaultData={{
            question: settings['question'],
            description: settings['description'],
            options: settings['options'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
        />
      ) : step === 3 ? (
        <EndTime callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))} next={increment} back={decrement} />
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
        <HolderStakePools
          defaultData={{
            withDelegators: settings['withDelegators'],
            stakePools: settings['stakePools'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 6 ? (
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
      ) : step === 7 ? (
        <PollPublish
          settings={settings as PollSettings}
          // next={increment}
          back={decrement}
        />
      ) : null}
    </Modal>
  )
}

export default PollJourney
