import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'
import { useWallet } from '@meshsdk/react'
import { Transaction } from '@meshsdk/core'
import { ArrowPathIcon, CheckBadgeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import { firestore } from '@/utils/firebase'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import txConfirmation from '@/functions/txConfirmation'
import Loader from '@/components/Loader'
import ProgressBar from '@/components/ProgressBar'
import MediaViewer from '@/components/MediaViewer'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { StakeKey, Swap, SwapSettings, TokenId } from '@/@types'
import type { FetchedTimestampResponse } from '@/pages/api/timestamp'
import { DECIMALS, WALLET_ADDRESSES } from '@/constants'

const SwapSelection = (props: { defaultData: Partial<SwapSettings>; next?: () => void; back?: () => void }) => {
  const { defaultData, next, back } = props
  const { user, getAndSetUser } = useAuth()
  const { wallet } = useWallet()

  const selectedBoth = useMemo(() => !!defaultData.withdraw?.tokenId && !!defaultData.deposit?.tokenId, [defaultData])

  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState({
    msg: '',
    loading: false,
    steps: {
      current: 0,
      max: 0,
    },
  })

  const buildTx = useCallback(async () => {
    if (!wallet) return
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Processing...', steps: { ...prev.steps, current: 1, max: 3 } }))

    try {
      const {
        data: { now },
      } = await axios.get<FetchedTimestampResponse>('/api/timestamp')

      const payload: Swap = {
        stakeKey: user?.stakeKey as StakeKey,
        timestamp: now,
        withdraw: {
          txHash: '',
          tokenId: defaultData.withdraw?.tokenId as TokenId,
          thumb: defaultData.withdraw?.thumb as Swap['withdraw']['thumb'],
          displayName: defaultData.withdraw?.tokenName.display || defaultData.withdraw?.tokenName.onChain || '',
        },
        deposit: {
          txHash: '',
          tokenId: defaultData.deposit?.tokenId as TokenId,
          thumb: defaultData.deposit?.thumb as Swap['deposit']['thumb'],
          displayName: defaultData.deposit?.tokenName.display || defaultData.deposit?.tokenName.onChain || '',
        },
      }

      const collection = firestore.collection('swaps')
      const { id: docId } = await collection.add(payload)

      const tx = new Transaction({ initiator: wallet })
        .sendAssets({ address: WALLET_ADDRESSES['SWAP_APP'] }, [
          {
            unit: defaultData.deposit?.tokenId,
            quantity: '1',
          },
        ])
        .sendLovelace({ address: WALLET_ADDRESSES['SWAP_APP'] }, formatTokenAmount.toChain(1, DECIMALS['ADA']).toString())

      console.log('Building TX...')
      setProgress((prev) => ({ ...prev, msg: 'Building TX...', steps: { ...prev.steps, current: 2, max: 3 } }))
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

      await collection.doc(docId).update({
        deposit: {
          ...payload.deposit,
          txHash,
        },
      })

      setProgress((prev) => ({ ...prev, msg: 'Swapping NFTs...', steps: { ...prev.steps, current: 3, max: 3 } }))

      await axios.post('/api/swap', { docId })

      setProgress((prev) => ({ ...prev, loading: false, msg: 'Swap Complete!' }))
      setDone(true)

      await getAndSetUser()
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
      disableBack={progress.loading || done}
      next={next}
      disableNext={progress.loading || done}
      buttons={
        selectedBoth
          ? [
              {
                label: 'Swap',
                disabled: !selectedBoth || progress.loading || done,
                onClick: buildTx,
              },
            ]
          : []
      }
    >
      <h6 className='text-xl text-center'>{selectedBoth ? 'Confirm ' : ''}Swap Selection</h6>

      <div className='mt-20 mb-10 mx-auto flex items-center justify-center'>
        <div className='mr-2 flex flex-col items-center justify-center'>
          {defaultData.withdraw?.thumb ? (
            <MediaViewer mediaType='IMAGE' src={defaultData.withdraw.thumb || ''} size='w-[280px] h-[280px]' withBorder />
          ) : (
            <div className='w-[280px] h-[280px] flex items-center justify-center'>
              <QuestionMarkCircleIcon className='w-20 h-20' />
            </div>
          )}
          <span className='mt-[5px] text-zinc-400'>
            {defaultData.withdraw?.tokenName.display ? `Withdraw: ${defaultData.withdraw?.tokenName.display}` : 'Select a "Withdraw" Asset'}
          </span>
        </div>

        {selectedBoth ? <ArrowPathIcon className='w-8 h-8 m-4' /> : null}

        <div className='ml-2 flex flex-col items-center justify-center'>
          {defaultData.deposit?.thumb ? (
            <MediaViewer mediaType='IMAGE' src={defaultData.deposit.thumb || ''} size='w-[280px] h-[280px]' withBorder />
          ) : (
            <div className='w-[280px] h-[280px] flex items-center justify-center'>
              <QuestionMarkCircleIcon className='w-20 h-20' />
            </div>
          )}
          <span className='mt-[5px] text-zinc-400'>
            {defaultData.deposit?.tokenName.display ? `Deposit: ${defaultData.deposit?.tokenName.display}` : 'Select a "Deposit" Asset'}
          </span>
        </div>
      </div>

      <div>
        {!done && progress.steps.max ? <ProgressBar label='Steps' max={progress.steps.max} current={progress.steps.current} /> : null}

        {progress.loading ? (
          <Loader withLabel label={progress.msg} />
        ) : (
          <div className='flex flex-col items-center justify-center'>
            {done ? <CheckBadgeIcon className='w-24 h-24 text-green-400' /> : null}
            <span>{progress.msg}</span>
          </div>
        )}
      </div>
    </JourneyStepWrapper>
  )
}

export default SwapSelection
