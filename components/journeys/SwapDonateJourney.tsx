import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Modal from '../Modal'
import ErrorNotConnected from './steps/ErrorNotConnected'
import TokenSelector from './steps/TokenSelector'
import DonateMethod from './steps/DonateMethod'
import DonateManual from './steps/DonateManual'
import DonateSign from './steps/DonateSign'
import type { SwapDonateSettings, TokenId } from '@/@types'

const defaultSettings: SwapDonateSettings = {
  donateMethod: 'BUILD_TX',
  selectedTokenIds: [],
}

const SwapDonateJourney = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<SwapDonateSettings>(defaultSettings)

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

  const increment = () => setStep((prev) => prev + 1)
  const decrement = () => setStep((prev) => prev - 1)

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 1 ? (
        <DonateMethod defaultData={settings} callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))} next={increment} />
      ) : step === 2 ? (
        settings['donateMethod'] === 'BUILD_TX' ? (
          <TokenSelector
            onlyNonFungible
            multiSelect
            defaultData={settings['selectedTokenIds']}
            callback={(payload) => setSettings((prev) => ({ ...prev, selectedTokenIds: payload as TokenId[] }))}
            back={decrement}
            next={increment}
          />
        ) : (
          <DonateManual back={decrement} />
        )
      ) : step === 3 ? (
        <DonateSign defaultData={settings} back={decrement} />
      ) : null}
    </Modal>
  )
}

export default SwapDonateJourney
