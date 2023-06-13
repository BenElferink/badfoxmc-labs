import { Fragment, useEffect, useRef, useState } from 'react'
import { useWallet, useWalletList } from '@meshsdk/react'
import Modal from './Modal'
import TextFrown from './TextFrown'
import { UserIcon, WalletIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import LinkList from './LinkList'
import { LS_KEYS } from '@/constants'
import ProfilePicture from './ProfilePicture'

const Auth = () => {
  const installedWallets = useWalletList()
  const { connect, disconnect, connecting, connected, name, error } = useWallet()
  const { user } = useAuth()

  const [openModal, setOpenModal] = useState(false)
  const mountRef = useRef(false)

  const handleOpen = () => setOpenModal(true)
  const handleClose = () => setOpenModal(false)

  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true

      const lsValue = localStorage.getItem(LS_KEYS['WALLET_PROVIDER'])
      if (lsValue) connect(lsValue)
    } else {
      if (connected) {
        localStorage.setItem(LS_KEYS['WALLET_PROVIDER'], name)
        handleClose()
      } else {
        localStorage.removeItem(LS_KEYS['WALLET_PROVIDER'])
      }
    }
  }, [connected, name])

  return (
    <Fragment>
      {connected ? (
        <div className='group relative p-1 flex items-center cursor-pointer'>
          {user?.profilePicture ? (
            <ProfilePicture src={user.profilePicture} size={50} />
          ) : (
            <div className='p-2 rounded-full bg-gradient-to-b from-purple-500 via-blue-500 to-green-500'>
              <UserIcon className='w-8 h-8' />
            </div>
          )}

          {user ? (
            <div className='w-60 p-0.5 rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 hidden group-hover:block absolute top-[100%] right-0'>
              <div className='p-2 rounded-lg bg-zinc-800'>
                <LinkList
                  items={[
                    {
                      label: 'Profile',
                      Icon: (props) => <UserIcon {...props} />,
                      path: '/profile',
                      tags: ['Soon'],
                    },
                    {
                      label: 'Switch Wallet',
                      Icon: (props) => <WalletIcon {...props} />,
                      onClick: () => handleOpen(),
                    },
                  ]}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className='p-0.5 rounded-xl bg-gradient-to-b from-purple-500 via-blue-500 to-green-500'>
          <button
            onClick={handleOpen}
            disabled={openModal}
            className='py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700'
          >
            Connect
          </button>
        </div>
      )}

      <Modal open={openModal} onClose={handleClose}>
        {!installedWallets.length ? (
          <TextFrown text='No wallets installed...' className='mt-[50%]' />
        ) : (
          <div className='max-w-[1024px] mx-auto text-center'>
            <h2 className='text-lg'>Connect Wallet</h2>

            {/* @ts-ignore */}
            {error ? <p className='text-red-400'>{error?.message || error?.toString()}</p> : null}

            {installedWallets.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => connect(name)}
                disabled={connected || connecting}
                className='w-full max-w-[420px] my-2 mx-auto p-2 flex items-center justify-between rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:opacity-40'
              >
                <img src={icon} alt='' width={42} height={42} className='drop-shadow-[0_0_1px_rgba(0,0,0,1)]' />
                {name}
              </button>
            ))}

            {connected ? (
              <button
                onClick={() => disconnect()}
                disabled={!connected || connecting}
                className='w-full max-w-[420px] my-2 mx-auto p-4 flex items-center justify-center rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:opacity-40'
              >
                Disconnect
              </button>
            ) : null}
          </div>
        )}
      </Modal>
    </Fragment>
  )
}

export default Auth
