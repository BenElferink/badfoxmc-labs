import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'
import { utils, writeFileXLSX } from 'xlsx'
import { useWallet } from '@meshsdk/react'
import { Transaction } from '@meshsdk/core'
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { firestore } from '@/utils/firebase'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import txConfirmation from '@/functions/txConfirmation'
import getExplorerUrl from '@/functions/formatters/getExplorerUrl'
import Loader from '@/components/Loader'
import Button from '@/components/form/Button'
import ProgressBar from '@/components/ProgressBar'
import JourneyStepWrapper from './JourneyStepWrapper'
import type { Airdrop, PayoutHolder, AirdropSettings, StakeKey } from '@/@types'
import { DECIMALS, SYMBOLS, WALLETS } from '@/constants'

const AirdropPayout = (props: { payoutHolders: PayoutHolder[]; settings: AirdropSettings; next?: () => void; back?: () => void }) => {
  const { payoutHolders, settings, next, back } = props
  const { wallet } = useWallet()

  const ticker = settings.tokenName.ticker || settings.tokenName.display || settings.tokenName.onChain
  const totalAmount = useMemo(() => payoutHolders.reduce((prev, curr) => prev + curr.payout, 0), [])
  const devFee = useMemo(() => formatTokenAmount.toChain(Math.max(1, payoutHolders.length * 0.5), DECIMALS['ADA']), [])
  const devPayed = useRef(false)

  const [processedPayoutHolders, setProcessedPayoutHolders] = useState([...payoutHolders])
  const [progress, setProgress] = useState({
    msg: '',
    loading: false,
    error: false,
    started: false,
    ended: false,
    batch: {
      current: 0,
      max: 0,
    },
  })

  const runPayout = useCallback(
    async (difference?: number): Promise<any> => {
      setProgress((prev) => ({ ...prev, loading: true, error: false }))

      if (!difference) {
        setProgress((prev) => ({ ...prev, loading: true, msg: 'Batching TXs...' }))
      }

      if (settings.tokenId !== 'lovelace') {
        const minAdaPerHolder = 1.2
        const adaNeeded = Math.ceil(processedPayoutHolders.length / minAdaPerHolder)
        const adaInWallet = formatTokenAmount.fromChain((await wallet.getLovelace()) || 0, DECIMALS['ADA'])

        if (adaInWallet < adaNeeded) {
          setProgress((prev) => ({
            ...prev,
            loading: false,
            msg: `Insufficient ADA! Please acquire at least ${adaNeeded} ADA (not including UTXOs) and try again`,
          }))
          return
        }
      }

      const unpayedWallets = processedPayoutHolders.filter(({ txHash }) => !txHash)
      if (!devPayed.current)
        unpayedWallets.unshift({
          stakeKey: WALLETS['STAKE_KEYS']['DEV'],
          address: WALLETS['ADDRESSES']['DEV'],
          payout: devFee,
          forceLovelace: true,
        })

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

        const recipients: {
          stakeKey: StakeKey
          txHash: string
          quantity: number
        }[] = []

        for await (const batch of batches) {
          setProgress((prev) => ({
            ...prev,
            msg: 'Building TX...',
          }))

          const tx = new Transaction({ initiator: wallet })

          for (const { address, payout, forceLovelace } of batch) {
            if (settings.tokenId === 'lovelace' || forceLovelace) {
              const minLovelaces = formatTokenAmount.toChain(1, DECIMALS['ADA'])

              if (payout < minLovelaces) {
                const str1 = 'Cardano requires at least 1 ADA per TX.'
                const str2 = `This wallet has only ${formatTokenAmount.fromChain(payout, DECIMALS['ADA']).toFixed(2)} ADA assigned to it:`
                const str3 = address
                const str4 = 'Click OK if you want to increase the payout for this wallet to 1 ADA.'
                const str5 = 'Click cancel to exclude this wallet from the airdrop.'
                const str6 = 'Note: accepting will increase the total pool size!'

                if (window.confirm(`${str1}\n${str2}\n${str3}\n\n${str4}\n${str5}\n${str6}`)) {
                  tx.sendLovelace({ address }, String(minLovelaces))
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

          if (!devPayed.current) devPayed.current = true

          setProgress((prev) => ({
            ...prev,
            batch: { ...prev.batch, current: prev.batch.current + 1, max: batches.length },
            msg: 'Awaiting Network Confirmation...',
            started: true, // "started" here, because we need 1st batch to succeed
          }))

          await txConfirmation(txHash)

          recipients.push(...batch.map(({ stakeKey, payout }) => ({ stakeKey, txHash, quantity: payout })))

          setProcessedPayoutHolders((prev) =>
            prev.map((item) =>
              batch.some(({ stakeKey }) => stakeKey === item.stakeKey)
                ? {
                    ...item,
                    txHash,
                  }
                : item
            )
          )
        }

        const countPayouts = () =>
          processedPayoutHolders.reduce((prev, curr) => {
            if (!curr.payout) return prev
            else return prev + curr.payout
          }, 0)

        const _dec = settings.tokenAmount.decimals
        const _onch = settings.tokenAmount.onChain // TODO:
        const _disp = settings.tokenAmount.display // TODO:
        const tAmountOnChain = formatTokenAmount.fromChain(_onch, _dec) === 1 ? countPayouts() : _onch
        const tAmountDisplay = _disp === 1 ? formatTokenAmount.fromChain(countPayouts(), _dec) : _disp

        const airdrop: Airdrop = {
          stakeKey: (await wallet.getRewardAddresses())[0],
          timestamp: Date.now(),

          tokenId: settings.tokenId,
          tokenName: settings.tokenName,
          tokenAmount: {
            decimals: _dec,
            onChain: tAmountOnChain,
            display: tAmountDisplay,
          },
          thumb: settings.thumb,

          recipients,
        }

        const collection = firestore.collection('airdrops')
        await collection.add(airdrop)

        setProgress((prev) => ({ ...prev, loading: false, ended: true, msg: 'Airdrop Done' }))
      } catch (error: any) {
        console.error(error)
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

        if (!!errMsg && errMsg.indexOf('Maximum transaction size') !== -1) {
          // OLD: [Transaction] An error occurred during build: Maximum transaction size of 16384 exceeded. Found: 21861.
          // NEW: txBuildResult error: JsValue("Maximum transaction size of 16384 exceeded. Found: 19226")
          const splitMessage: string[] = errMsg.split(' ')
          const [max, curr] = splitMessage.map((str) => Number(str.replace(/[^\d]/g, ''))).filter((num) => num && !isNaN(num))
          // [16384, any_number_higher_than_16384]

          const newDifference = (difference || 1) * (max / curr)

          setProgress((prev) => ({ ...prev, loading: true, msg: `Trying Batch Size ${String(newDifference)}` }))
          return await runPayout(newDifference)
        } else {
          setProgress((prev) => ({ ...prev, loading: false, error: true, msg: errMsg }))
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processedPayoutHolders, settings, wallet]
  )

  const downloadReceipt = useCallback(async () => {
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Downloading...' }))

    try {
      const ws = utils.json_to_sheet(
        processedPayoutHolders.map((item) => ({
          amount: formatTokenAmount.fromChain(item.payout, settings.tokenAmount.decimals),
          tokenName: ticker,
          address: item.address,
          stakeKey: item.stakeKey,
          txHash: item.txHash,
        })),
        { header: ['amount', 'tokenName', 'address', 'stakeKey', 'txHash'] }
      )

      ws['!cols'] = [{ width: 20 }, { width: 15 }, { width: 100 }, { width: 70 }, { width: 70 }]

      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'airdrop')

      writeFileXLSX(wb, `Airdrop_${new Date().toLocaleDateString()}.xlsx`)

      setProgress((prev) => ({ ...prev, loading: false, msg: '' }))
    } catch (error: any) {
      console.error(error)
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

      setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
    }
  }, [processedPayoutHolders, settings])

  return (
    <JourneyStepWrapper disableBack={progress.loading || progress.ended} next={next} back={back}>
      <h6 className='mb-6 text-xl text-center'>Payout</h6>

      <div className='w-full my-2 flex items-center justify-between'>
        <Button label='Batch & Sign TXs' disabled={progress.loading || progress.ended} onClick={() => runPayout()} />
        <Button label='Download Receipt' disabled={progress.loading || !progress.started} onClick={() => downloadReceipt()} />
      </div>

      {!progress.ended && progress.batch.max ? <ProgressBar label='TX Batches' max={progress.batch.max} current={progress.batch.current} /> : null}

      {progress.loading ? (
        <Loader withLabel label={progress.msg} />
      ) : (
        <div className='flex flex-col items-center justify-center'>
          {progress.ended ? <CheckBadgeIcon className='w-24 h-24 text-green-400' /> : null}
          {progress.error ? (
            <div className='flex items-center justify-center'>
              <ExclamationTriangleIcon className='w-6 h-6 mr-1 text-red-400' />
              <span className='text-red-200'>{progress.msg}</span>
            </div>
          ) : (
            <span>{progress.msg}</span>
          )}
        </div>
      )}

      <div className='w-2/3 h-0.5 my-8 mx-auto rounded-full bg-zinc-400' />

      <p className='w-full my-2 text-center'>
        {processedPayoutHolders.length} Wallet{processedPayoutHolders.length > 1 ? 's' : ''}
        <br />
        {ticker === 'ADA' ? SYMBOLS['ADA'] : null}
        {formatTokenAmount.fromChain(totalAmount, settings.tokenAmount.decimals).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        {ticker === 'ADA' ? null : <>&nbsp;{ticker}</>}
        <br />
        <span className='text-xs'>
          (&#43;&nbsp;{SYMBOLS['ADA']}
          {formatTokenAmount.fromChain(devFee, DECIMALS['ADA'])} Service Fee)
        </span>
      </p>

      {processedPayoutHolders.map((item) => (
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
            <span className='text-center text-xs'>&nbsp;{ticker}</span>
          </div>

          <Link
            href={item.stakeKey ? getExplorerUrl('stakeKey', item.stakeKey) : getExplorerUrl('address', item.address)}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-blue-200 flex items-center hover:underline'
          >
            {item.stakeKey || item.address}
            <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
          </Link>

          {item.txHash ? (
            <Link
              href={getExplorerUrl('tx', item.txHash)}
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

export default AirdropPayout
