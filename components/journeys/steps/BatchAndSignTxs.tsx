import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useWallet } from '@meshsdk/react'
import { Transaction } from '@meshsdk/core'
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { utils, writeFileXLSX } from 'xlsx'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import Loader from '@/components/Loader'
import ProgressBar from '@/components/ProgressBar'
import txConfirmation from '@/functions/txConfirmation'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { Airdrop, PayoutHolder, Settings } from '@/@types'
import { ONE_MILLION } from '@/constants'
import setAirdrop from '@/functions/storage/airdrops/setAirdrop'
import { useAuth } from '@/contexts/AuthContext'

const BatchAndSignTxs = (props: {
  payoutHolders: PayoutHolder[]
  settings: Settings
  callback: (payload: PayoutHolder[]) => void
  next?: () => void
  back?: () => void
}) => {
  const { payoutHolders, settings, callback, next, back } = props
  const { wallet } = useWallet()
  const { user } = useAuth()

  const [payoutEnded, setPayoutEnded] = useState(false)
  const [progress, setProgress] = useState({
    msg: '',
    loading: false,
    batch: {
      current: 0,
      max: 0,
    },
  })

  const runPayout = useCallback(
    async (difference?: number): Promise<any> => {
      setProgress((prev) => ({ ...prev, loading: true }))

      if (!difference) {
        setProgress((prev) => ({ ...prev, loading: true, msg: 'Batching TXs...' }))
      }

      if (settings.tokenId !== 'lovelace') {
        const minAdaPerHolder = 1.2
        const adaNeeded = Math.ceil(payoutHolders.length / minAdaPerHolder)
        const adaInWallet = Number(await wallet.getLovelace()) / ONE_MILLION

        if (adaInWallet < adaNeeded) {
          setProgress((prev) => ({
            ...prev,
            loading: false,
            msg: `Insufficient ADA! Please acquire at least ${adaNeeded} ADA (not including UTXOs) and try again`,
          }))
          return
        }
      }

      const unpayedWallets = payoutHolders.filter(({ txHash }) => !txHash)

      const batchSize = difference ? Math.floor(difference * unpayedWallets.length) : unpayedWallets.length
      const batches: PayoutHolder[][] = []

      for (let i = 0; i < unpayedWallets.length; i += batchSize) {
        batches.push(unpayedWallets.slice(i, (i / batchSize + 1) * batchSize))
      }

      try {
        setProgress((prev) => ({
          ...prev,
          batch: { ...prev.batch, current: 0, max: batches.length },
        }))

        for await (const batch of batches) {
          setProgress((prev) => ({
            ...prev,
            msg: 'Building TX...',
          }))

          const tx = new Transaction({ initiator: wallet })

          for (const { address, payout } of batch) {
            if (settings.tokenId === 'lovelace') {
              if (payout < ONE_MILLION) {
                const str1 = 'Cardano requires at least 1 ADA per TX.'
                const str2 = `This wallet has only ${(payout / ONE_MILLION).toFixed(
                  2
                )} ADA assigned to it:\n${address}`
                const str3 = 'Click OK if you want to increase the payout for this wallet to 1 ADA.'
                const str4 = 'Click cancel to exclude this wallet from the airdrop.'
                const str5 = 'Note: accepting will increase the total pool size.'

                if (window.confirm(`${str1}\n\n${str2}\n\n${str3}\n${str4}\n\n${str5}`)) {
                  tx.sendLovelace({ address }, String(ONE_MILLION))
                }
              } else {
                tx.sendLovelace({ address }, String(payout))
              }
            } else {
              tx.sendAssets({ address }, [
                {
                  unit: settings.tokenId,
                  quantity: String(payout),
                },
              ])
            }
          }

          // this may throw an error if TX size is over the limit
          const unsignedTx = await tx.build()
          const signedTx = await wallet.signTx(unsignedTx)
          const txHash = await wallet.submitTx(signedTx)

          setProgress((prev) => ({
            ...prev,
            batch: { ...prev.batch, current: prev.batch.current + 1, max: batches.length },
            msg: 'Awaiting Network Confirmation...',
          }))

          await txConfirmation(txHash)

          callback(
            payoutHolders.map((item) =>
              batch.some(({ stakeKey }) => stakeKey === item.stakeKey)
                ? {
                    ...item,
                    txHash,
                  }
                : item
            )
          )
        }

        const airdrop: Airdrop = {
          stakeKey: user?.stakeKey || (await wallet.getRewardAddresses())[0],
          timestamp: Date.now(),

          tokenId: settings.tokenId,
          tokenName: settings.tokenName,
          tokenAmount: settings.tokenAmount,
          thumb: settings.thumb,
        }

        await setAirdrop(airdrop)

        setProgress((prev) => ({ ...prev, loading: false, msg: 'Airdrop Done' }))
        setPayoutEnded(true)
      } catch (error: any) {
        console.error(error)
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

        if (!!errMsg && errMsg.indexOf('Maximum transaction size') !== -1) {
          // [Transaction] An error occurred during build: Maximum transaction size of 16384 exceeded. Found: 21861.
          const splitMessage: string[] = errMsg.split(' ')
          const [max, curr] = splitMessage.filter((str) => !isNaN(Number(str))).map((str) => Number(str))
          // [16384, 21861]

          const newDifference = (difference || 1) * (max / curr)

          setProgress((prev) => ({ ...prev, loading: true, msg: `Trying Batch Size ${String(newDifference)}` }))
          return await runPayout(newDifference)
        } else {
          setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
        }
      }
    },
    [payoutHolders, settings, wallet]
  )

  const downloadReceipt = useCallback(async () => {
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Downloading...' }))

    try {
      const ws = utils.json_to_sheet(
        payoutHolders.map((item) => ({
          ...item,
          payout: formatTokenAmount.fromChain(item.payout, settings.tokenAmount.decimals),
          tokenName: settings.tokenName.ticker || settings.tokenName.display || settings.tokenName.onChain,
        })),
        { header: ['payout', 'tokenName', 'address', 'stakeKey', 'txHash'] }
      )

      ws['!cols'] = [{ width: 20 }, { width: 15 }, { width: 100 }, { width: 70 }, { width: 70 }]

      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'airdrop')

      writeFileXLSX(wb, `Bad Labs Airdrop (${new Date().toLocaleDateString()}).xlsx`)

      setProgress((prev) => ({ ...prev, loading: false, msg: '' }))
    } catch (error: any) {
      console.error(error)
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

      setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
    }
  }, [payoutHolders, settings])

  return (
    <JourneyStepWrapper disableBack={progress.loading || payoutEnded} back={back}>
      <h6 className='mb-6 text-xl text-center'>Payout</h6>

      <div className='w-full my-2 flex items-center justify-between'>
        <button
          onClick={() => runPayout()}
          disabled={progress.loading || payoutEnded}
          className={
            'w-full mr-1 p-4 rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
          }
        >
          Batch & Sign TXs
        </button>
        <button
          onClick={() => downloadReceipt()}
          disabled={progress.loading || !payoutEnded}
          className={
            'w-full ml-1 p-4 rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
          }
        >
          Download Receipt
        </button>
      </div>

      {!payoutEnded && progress.batch.max ? (
        <ProgressBar label='TX Batches' max={progress.batch.max} current={progress.batch.current} />
      ) : null}

      {progress.loading ? (
        <Loader withLabel label={progress.msg} />
      ) : (
        <div className='flex flex-col items-center justify-center'>
          {payoutEnded ? <CheckBadgeIcon className='w-24 h-24 text-green-400' /> : null}
          <span>{progress.msg}</span>
        </div>
      )}

      <div className='w-2/3 h-0.5 my-8 mx-auto rounded-full bg-zinc-400' />

      {payoutHolders.map((item) => (
        <div
          key={`wallet-${item.stakeKey || item.address}`}
          className='w-full my-2 py-2 px-1 rounded-lg border border-zinc-600 flex flex-col items-center justify-evenly'
        >
          <div>
            <span className='text-center truncate'>
              {formatTokenAmount.fromChain(item.payout, settings.tokenAmount.decimals).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className='text-center text-xs'>
              &nbsp;{settings.tokenName.ticker || settings.tokenName.display || settings.tokenName.onChain}
            </span>
          </div>

          <Link
            href={`https://cexplorer.io/${item.stakeKey ? `stake/${item.stakeKey}` : `address/${item.address}`}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-blue-200 flex items-center hover:underline'
          >
            {item.stakeKey || item.address}
            <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
          </Link>

          {item.txHash ? (
            <Link
              href={`https://cexplorer.io/tx/${item.txHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-blue-200 flex items-center hover:underline'
            >
              {item.txHash}
              <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
            </Link>
          ) : null}
        </div>
      ))}
    </JourneyStepWrapper>
  )
}

export default BatchAndSignTxs
