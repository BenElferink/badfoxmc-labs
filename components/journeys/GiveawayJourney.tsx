import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
import ErrorNotTokenGateHolder from './steps/ErrorNotTokenGateHolder'
import TokenSelector from './steps/TokenSelector'
import HolderPolicies from './steps/HolderPolicies'
import HolderStakePools from './steps/HolderStakePools'
import HolderBlacklist from './steps/HolderBlacklist'
import GiveawayTokenOrOther from './steps/GiveawayTokenOrOther'
import GiveawayOtherPost from './steps/GiveawayOtherPost'
import EndTime from './steps/EndTime'
import GiveawayNumOfWinners from './steps/GiveawayNumOfWinners'
import GiveawayPublish from './steps/GiveawayPublish'
import type { GiveawaySettings } from '@/@types'

const defaultSettings: GiveawaySettings = {
  isToken: true,
  thumb: '',

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

  otherTitle: '',
  otherDescription: '',
  otherAmount: 0,

  numOfWinners: 0,
  endAt: 0,

  holderPolicies: [],

  withBlacklist: false,
  blacklist: [],

  withDelegators: false,
  stakePools: [],
}

const GiveawayJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Partial<GiveawaySettings>>(defaultSettings)

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
        <GiveawayTokenOrOther
          defaultData={{
            isToken: settings['isToken'],
          }}
          callback={(payload) =>
            setSettings((prev) => ({
              ...prev,
              thumb:
                (prev['isToken'] && !payload['isToken']) || (!prev['isToken'] && payload['isToken'])
                  ? defaultSettings['thumb']
                  : prev['thumb'],

              tokenId: prev['isToken'] && !payload['isToken'] ? defaultSettings['tokenId'] : prev['tokenId'],
              tokenName: prev['isToken'] && !payload['isToken'] ? defaultSettings['tokenName'] : prev['tokenName'],
              tokenAmount:
                prev['isToken'] && !payload['isToken'] ? defaultSettings['tokenAmount'] : prev['tokenAmount'],

              otherAmount:
                !prev['isToken'] && payload['isToken'] ? defaultSettings['otherAmount'] : prev['otherAmount'],
              otherTitle:
                !prev['isToken'] && payload['isToken'] ? defaultSettings['otherTitle'] : prev['otherTitle'],
              otherDescription:
                !prev['isToken'] && payload['isToken']
                  ? defaultSettings['otherDescription']
                  : prev['otherDescription'],

              ...payload,
            }))
          }
          next={increment}
        />
      ) : step === 2 ? (
        settings.isToken ? (
          <TokenSelector
            withAmount
            defaultData={{
              thumb: settings['thumb'],
              tokenId: settings['tokenId'],
              tokenName: settings['tokenName'],
              tokenAmount: settings['tokenAmount'],
            }}
            callback={(payload) =>
              setSettings((prev) => ({
                ...prev,
                ...payload,
                numOfWinners:
                  payload['tokenAmount']?.onChain === 1 && payload['tokenAmount']?.decimals === 0
                    ? 1
                    : prev['numOfWinners'],
              }))
            }
            next={increment}
            back={decrement}
          />
        ) : (
          <GiveawayOtherPost
            defaultData={{
              thumb: settings['thumb'],
              otherAmount: settings['otherAmount'],
              otherTitle: settings['otherTitle'],
              otherDescription: settings['otherDescription'],
            }}
            callback={(payload) =>
              setSettings((prev) => ({
                ...prev,
                ...payload,
                numOfWinners: payload['otherAmount'],
              }))
            }
            next={increment}
            back={decrement}
          />
        )
      ) : step === 3 ? (
        <GiveawayNumOfWinners
          defaultData={{
            isToken: settings['isToken'],
            tokenAmount: settings['tokenAmount'],
            otherAmount: settings['otherAmount'],
            numOfWinners: settings['numOfWinners'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 4 ? (
        <EndTime
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 5 ? (
        <HolderPolicies
          defaultData={{
            holderPolicies: settings['holderPolicies'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 6 ? (
        <HolderStakePools
          defaultData={{
            withDelegators: settings['withDelegators'],
            stakePools: settings['stakePools'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 7 ? (
        <HolderBlacklist
          defaultData={{
            withBlacklist: settings['withBlacklist'],
            blacklist: settings['blacklist'],
          }}
          callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
          next={increment}
          back={decrement}
        />
      ) : step === 8 ? (
        <GiveawayPublish
          settings={settings as GiveawaySettings}
          // next={increment}
          back={decrement}
        />
      ) : null}
    </Modal>
  )
}

export default GiveawayJourney
