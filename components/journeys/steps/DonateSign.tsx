import { useCallback, useState } from 'react'
import { Transaction } from '@meshsdk/core'
import { useWallet } from '@meshsdk/react'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import txConfirmation from '@/functions/txConfirmation'
import Loader from '@/components/Loader'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { SwapDonateSettings } from '@/@types'
import { WALLET_ADDRESSES } from '@/constants'

const DonateSign = (props: { defaultData: Partial<SwapDonateSettings>; next?: () => void; back?: () => void }) => {
  const { defaultData, next, back } = props
  const { user } = useAuth()
  const { wallet } = useWallet()

  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState({
    msg: `Are you sure you want to add ${defaultData.selectedTokenIds?.length} NFTs to the swap pool?`,
    loading: false,
  })

  const buildTx = useCallback(async () => {
    if (!user || !wallet) return
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Processing...' }))

    try {
      const tx = new Transaction({ initiator: wallet }).sendAssets(
        { address: WALLET_ADDRESSES['SWAP_APP'] },
        (defaultData.selectedTokenIds || []).map((unit) => ({
          unit,
          quantity: '1',
        }))
      )

      console.log('Building TX...')
      setProgress((prev) => ({ ...prev, msg: 'Building TX...' }))
      const unsignedTx = await tx.build()

      console.log('Awaiting signature...', unsignedTx)
      setProgress((prev) => ({ ...prev, msg: 'Awaiting signature...' }))
      const signedTx = await wallet.signTx(unsignedTx)

      console.log('Submitting TX...', signedTx)
      setProgress((prev) => ({ ...prev, msg: 'Submitting TX...' }))
      const txHash = await wallet.submitTx(signedTx)

      console.log('Awaiting network confirmation...', txHash)
      setProgress((prev) => ({ ...prev, msg: 'Awaiting network confirmation...' }))
      await txConfirmation(txHash)

      console.log('TX confirmed!', txHash)
      setProgress((prev) => ({ ...prev, loading: false, msg: 'TX confirmed!' }))
      setDone(true)
    } catch (error: any) {
      console.error(error)
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

      if (errMsg.indexOf('Not enough ADA leftover to include non-ADA assets in a change address') !== -1) {
        setProgress((prev) => ({
          ...prev,
          loading: false,
          msg: 'TX build failed: your UTXOs are clogged, please send all your ADA to yourself, together with the selected tokens.',
        }))
      } else if (error?.message?.indexOf('UTxO Balance Insufficient') !== -1) {
        setProgress((prev) => ({
          ...prev,
          loading: false,
          msg: 'TX build failed: not enough ADA to process TX, please add ADA to your wallet, then try again.',
        }))
      } else {
        setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wallet, txConfirmation])

  return (
    <JourneyStepWrapper
      back={back}
      next={next}
      buttons={[
        {
          label: 'Sign TX',
          disabled: !defaultData.selectedTokenIds?.length || progress.loading || done,
          onClick: buildTx,
        },
      ]}
    >
      <h6 className='mb-6 text-xl text-center'>Confirm TX</h6>

      {progress.loading ? (
        <Loader withLabel label={progress.msg} />
      ) : (
        <div className='flex flex-col items-center justify-center'>
          {done ? <CheckBadgeIcon className='w-24 h-24 text-green-400' /> : null}
          <span>{progress.msg}</span>
        </div>
      )}
    </JourneyStepWrapper>
  )
}

export default DonateSign
