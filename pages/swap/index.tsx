import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import SwapCollectionCard from '@/components/cards/SwapCollectionCard'
import SwapJourney from '@/components/journeys/SwapJourney'
import type { PolicyId } from '@/@types'

export const SWAP_DESCRIPTION =
  'The NFT swap tool allows users to do 1:1 swaps of the same Policy ID, thereby creating new trading opportunities for collectors.'

const Page = () => {
  const { query } = useRouter()
  const { user } = useAuth()
  const { swapWallet, fetchSwapWallet } = useData()

  useEffect(() => {
    if (!Object.keys(swapWallet).length) fetchSwapWallet()
  }, [])

  const [openJourney, setOpenJourney] = useState(false)
  const [selectedId, setSelectedId] = useState<PolicyId>(query.id?.toString() || '')

  useEffect(() => {
    if (query.id) setSelectedId(query.id?.toString())
  }, [query])

  return (
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='w-full mb-2 flex flex-wrap'>
        <p className='w-full m-1'>{SWAP_DESCRIPTION}</p>

        <button
          className='w-full m-1 p-4 flex items-center justify-center text-center rounded-lg border border-transparent hover:border-green-500 bg-green-900 hover:bg-green-800'
          onClick={() => setOpenJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Add to Swap Pool
        </button>
      </div>

      <div className='w-full flex flex-wrap justify-center sm:justify-start'>
        {!Object.keys(swapWallet).length ? (
          <Loader />
        ) : (
          Object.entries(swapWallet)
            .sort((a, b) => (b[1]?.floor || 0) - (a[1]?.floor || 0))
            .map(([policyId, { name, thumb, floor, tokens }]) => (
              <SwapCollectionCard
                key={`collection-${policyId}`}
                id={policyId}
                onClick={(_id) => setSelectedId(_id)}
                name={name}
                thumb={thumb}
                floor={floor}
                tokenCount={tokens.length}
                userHoldsThisPolicy={!!user?.tokens?.find((t) => t.policyId === policyId)}
              />
            ))
        )}
      </div>

      <Modal
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          // fetchSwapWallet()
        }}
      >
        <h6 className='mb-20 text-xl text-center'>Swap</h6>
        <div className='flex items-center justify-center'>
          <p>By adding assets to the swap pool,</p>
        </div>
      </Modal>

      <SwapJourney
        collections={[
          {
            policyId: selectedId,
            tokens: swapWallet[selectedId]?.tokens || [],
          },
        ]}
        open={!!selectedId && !!swapWallet[selectedId]}
        onClose={() => {
          setSelectedId('')
          fetchSwapWallet()
        }}
      />
    </div>
  )
}

export default Page
