import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import Loader from '@/components/Loader'
import SwapJourney from '@/components/journeys/SwapJourney'
import SwapDonateJourney from '@/components/journeys/SwapDonateJourney'
import SwapCollectionCard from '@/components/cards/SwapCollectionCard'
import type { PolicyId } from '@/@types'
import DropDown from '@/components/form/DropDown'
import Button from '@/components/form/Button'
import SwapActivityCard from '@/components/cards/SwapActivityCard'

export const SWAP_DESCRIPTION =
  'The NFT swap tool allows users to do 1:1 swaps of the same Policy ID, thereby creating new trading opportunities for collectors.'

const Page = () => {
  const { query } = useRouter()
  const { user, getAndSetUser } = useAuth()
  const { swapWallet, fetchSwapWallet, swaps, fetchSwaps } = useData()

  useEffect(() => {
    if (!Object.keys(swapWallet).length) fetchSwapWallet()
    if (!swaps.length) fetchSwaps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [openDonateJourney, setOpenDonateJourney] = useState(false)
  const [selectedId, setSelectedId] = useState<PolicyId>(query.id?.toString() || '')

  useEffect(() => {
    if (query.id) setSelectedId(query.id?.toString())
  }, [query])

  const [showHistory, setShowHistory] = useState(false)
  const [filters, setFilters] = useState<{
    who: 'everyone' | 'me'
  }>({
    who: 'everyone',
  })

  return (
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='w-full mb-2 flex flex-wrap'>
        <p className='w-full m-1'>{SWAP_DESCRIPTION}</p>

        <button
          className='w-full m-1 p-4 flex items-center justify-center text-center rounded-lg border border-transparent hover:border-green-500 bg-green-900 hover:bg-green-800'
          onClick={() => setOpenDonateJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Add to Swap Pool
        </button>

        <div className='grow'>
          <DropDown
            items={[
              { label: 'For Anyone', value: 'everyone' as (typeof filters)['who'] },
              { label: 'For Me', value: 'me' as (typeof filters)['who'] },
            ]}
            value={filters['who']}
            setValue={(_val) => setFilters((prev) => ({ ...prev, who: _val }))}
          />
        </div>
        <div className='grow'>
          <Button label={showHistory ? 'Collections' : 'Activity / History'} onClick={() => setShowHistory((prev) => !prev)} />
        </div>
      </div>

      {showHistory ? (
        <div className='w-full flex flex-wrap justify-center sm:justify-start'>
          {!swaps.length ? (
            <Loader />
          ) : (
            swaps.map((item) => {
              return (
                <SwapActivityCard
                  key={`swap-${item.id}`}
                  stakeKey={item.stakeKey}
                  timestamp={item.timestamp}
                  withdraw={item.withdraw}
                  deposit={item.deposit}
                />
              )
            })
          )}
        </div>
      ) : (
        <div className='w-full flex flex-wrap justify-center sm:justify-start'>
          {!Object.keys(swapWallet).length ? (
            <Loader />
          ) : (
            Object.entries(swapWallet)
              .sort((a, b) => (b[1]?.floor || 0) - (a[1]?.floor || 0))
              .map(([policyId, { name, thumb, floor, tokens }]) => {
                const whoOK = filters['who'] === 'everyone' || (filters['who'] === 'me' && !!user?.tokens?.find((item) => item.policyId === policyId))

                if (!whoOK) return null

                return (
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
                )
              })
          )}
        </div>
      )}

      <SwapDonateJourney
        open={openDonateJourney}
        onClose={() => {
          setOpenDonateJourney(false)
          fetchSwapWallet()
          getAndSetUser()
        }}
      />

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
          getAndSetUser()
        }}
      />
    </div>
  )
}

export default Page
