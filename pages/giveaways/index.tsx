import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import DropDown from '@/components/form/DropDown'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import GiveawayCard from '@/components/cards/GiveawayCard'
import GiveawayJourney from '@/components/journeys/GiveawayJourney'
import GiveawayEnter from '@/components/GiveawayEnter'
import type { Giveaway } from '@/@types'

export const GIVEAWAY_DESCRIPTION =
  "The giveaway tool is responsible for running weighted giveaways, it weighs the holder's assets and influences their entry points."

const Page = () => {
  const { query } = useRouter()
  const { user } = useAuth()
  const { giveaways, refetchGiveaways } = useData()

  useEffect(() => {
    if (!giveaways.length) refetchGiveaways()
  }, [giveaways])

  const [openJourney, setOpenJourney] = useState(false)
  const [selectedId, setSelectedId] = useState(query.id)

  useEffect(() => {
    if (query.id) setSelectedId(query.id)
  }, [query])

  const [filters, setFilters] = useState<{
    who: 'everyone' | 'me'
    type: 'alltype' | 'onchain' | 'offchain'
    status: 'allstatus' | 'active' | 'ended'
  }>({
    who: 'everyone',
    type: 'alltype',
    status: 'allstatus',
  })

  return (
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='w-full mb-2 flex flex-wrap'>
        <p className='w-full m-1'>{GIVEAWAY_DESCRIPTION}</p>

        <button
          className='w-full m-1 p-4 flex items-center justify-center text-center rounded-lg border border-transparent hover:border-green-500 bg-green-900 hover:bg-green-800'
          onClick={() => setOpenJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Create a Giveaway
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
          <DropDown
            items={[
              { label: 'All Types', value: 'alltype' as (typeof filters)['type'] },
              { label: 'On Chain', value: 'onchain' as (typeof filters)['type'] },
              { label: 'Off Chain', value: 'offchain' as (typeof filters)['type'] },
            ]}
            value={filters['type']}
            setValue={(_val) => setFilters((prev) => ({ ...prev, type: _val }))}
          />
        </div>
        <div className='grow'>
          <DropDown
            items={[
              { label: 'All Statuses', value: 'allstatus' as (typeof filters)['status'] },
              { label: 'Active', value: 'active' as (typeof filters)['status'] },
              { label: 'Ended', value: 'ended' as (typeof filters)['status'] },
            ]}
            value={filters['status']}
            setValue={(_val) => setFilters((prev) => ({ ...prev, status: _val }))}
          />
        </div>
      </div>

      <div className='w-full flex flex-wrap justify-center sm:justify-start'>
        {!giveaways.length ? (
          <Loader />
        ) : (
          giveaways.map(
            ({
              id,
              active,
              endAt,
              thumb,
              isToken,
              tokenName,
              tokenAmount,
              otherTitle,
              otherAmount,

              holderPolicies,
              fungibleHolders,
              withBlacklist,
              blacklistWallets,
              withDelegators,
              stakePools,
            }) => {
              const whoOK =
                filters['who'] === 'everyone' ||
                (filters['who'] === 'me' &&
                  !!user?.tokens?.find(
                    (item) =>
                      (holderPolicies?.some(({ policyId }) => item.tokenId.indexOf(policyId) === 0) ||
                        fungibleHolders?.some(({ stakeKey }) => stakeKey === user?.stakeKey)) &&
                      (!withDelegators || stakePools.some((poolId) => poolId === user?.poolId)) &&
                      (!withBlacklist || !blacklistWallets?.some((stakeKey) => stakeKey === user?.stakeKey))
                  ))

              const typeOK =
                filters['type'] === 'alltype' || (filters['type'] === 'onchain' && isToken) || (filters['type'] === 'offchain' && !isToken)

              const statusOK =
                filters['status'] === 'allstatus' || (filters['status'] === 'active' && active) || (filters['status'] === 'ended' && !active)

              if (!whoOK || !typeOK || !statusOK) return null

              return (
                <GiveawayCard
                  key={`giveaway-${id}`}
                  onClick={(_id) => setSelectedId(_id)}
                  id={id}
                  active={active}
                  endAt={endAt}
                  thumb={thumb}
                  isToken={isToken}
                  tokenName={tokenName}
                  tokenAmount={tokenAmount}
                  otherTitle={otherTitle}
                  otherAmount={otherAmount}
                />
              )
            }
          )
        )}
      </div>

      <GiveawayJourney
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          refetchGiveaways()
        }}
      />

      <Modal
        open={!!selectedId && !!giveaways.length}
        onClose={() => {
          setSelectedId('')
          refetchGiveaways()
        }}
      >
        <GiveawayEnter giveaway={giveaways.find(({ id }) => id === selectedId) as Giveaway} />
      </Modal>
    </div>
  )
}

export default Page
