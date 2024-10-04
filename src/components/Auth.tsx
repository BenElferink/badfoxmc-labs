import Image from 'next/image'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useWallet, useWalletList } from '@meshsdk/react'
import { toast } from 'react-hot-toast'
import { WalletIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import truncateStringInMiddle from '@/functions/formatters/truncateStringInMiddle'
import Modal from './Modal'
import Button from './form/Button'
import ErrorNoWallets from './journeys/steps/ErrorNoWallets'
import { DECIMALS, LS_KEYS, SYMBOLS } from '@/constants'

const Auth = () => {
  const { openConnectModal, toggleConnectModal, user } = useAuth()
  const { connect, disconnect, connecting, connected, name, error } = useWallet()
  const installedWallets = useWalletList()

  const mountRef = useRef(false)
  const walletAppInfo = useMemo(() => installedWallets.find((x) => x.id === name), [installedWallets, name])

  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true

      const lsValue = localStorage.getItem(LS_KEYS['WALLET_PROVIDER'])
      if (lsValue) connect(lsValue)
    } else {
      if (connected) {
        localStorage.setItem(LS_KEYS['WALLET_PROVIDER'], name)
        toggleConnectModal(false)
      } else {
        localStorage.removeItem(LS_KEYS['WALLET_PROVIDER'])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, name])

  return (
    <Fragment>
      <div className='hidden sm:block p-0.5 rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 cursor-pointer'>
        <button onClick={() => toggleConnectModal(true)} className='py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center'>
          {connected ? (
            <Image src={walletAppInfo?.icon || ''} alt='' width={20} height={20} priority unoptimized />
          ) : (
            <WalletIcon className='w-6 h-6 mr-2 text-zinc-400' />
          )}

          {connected ? (
            <Fragment>
              <span className='mx-2 text-xs'>{truncateStringInMiddle(user?.stakeKey, 7) || '...'}</span>
              <span>{`${SYMBOLS['ADA']} ${formatTokenAmount.fromChain(user?.lovelaces || 0, DECIMALS['ADA']).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}</span>
            </Fragment>
          ) : (
            <span>My Wallet</span>
          )}
        </button>
      </div>

      <Modal open={openConnectModal} onClose={() => toggleConnectModal(false)}>
        {!installedWallets.length ? (
          <ErrorNoWallets />
        ) : (
          <div className='max-w-[1024px] mx-auto text-center'>
            <h2 className='text-lg'>Connect Wallet</h2>

            {/* @ts-ignore */}
            {error ? <p className='text-red-400'>{error?.message || error?.toString()}</p> : null}

            {installedWallets.map((w) => (
              <button
                key={`wallet-${w.id}`}
                onClick={() => connect(w.id)}
                disabled={connected || connecting}
                className='w-full max-w-[420px] my-2 mx-auto p-4 flex items-center justify-between rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:opacity-40'
              >
                <Image src={w.icon} alt='' width={35} height={35} className='drop-shadow-[0_0_1px_rgba(0,0,0,1)]' priority unoptimized />
                {w.name.toUpperCase().replace('WALLET', '').trim()}
                {w.id === 'nufiSnap' ? ' (experimental)' : null}
              </button>
            ))}

            {connected ? (
              <div className='max-w-[calc(420px+0.5rem)] mx-auto'>
                <Button
                  label='Disconnect'
                  disabled={!connected || connecting}
                  onClick={() => {
                    disconnect()
                    toast.success('Disconnected')
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </Fragment>
  )
}

export default Auth
