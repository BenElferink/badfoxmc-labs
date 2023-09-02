import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import TextFrown from '@/components/TextFrown'
import DropDown from '@/components/form/DropDown'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import GiveawayCard from '@/components/cards/GiveawayCard'
import GiveawayJourney from '@/components/journeys/GiveawayJourney'
import GiveawayEnter from '@/components/GiveawayEnter'
import type { Giveaway } from '@/@types'

const Page = () => {
  const { query } = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [openJourney, setOpenJourney] = useState(false)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [selectedId, setSelectedId] = useState(query.id)

  useEffect(() => {
    if (query.id) setSelectedId(query.id)
  }, [query])

  const getAndSetGiveaways = useCallback(() => {
    setLoading(true)
    getGiveaways()
      .then((data) => setGiveaways(data))
      .catch((error) => console.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getAndSetGiveaways()
  }, [getAndSetGiveaways])

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
      <div className='w-full mb-4 flex flex-wrap'>
        <p className='w-full m-1'>
          The giveaway tool is responsible for running weighted giveaways, it weighs the holder&apos;s assets and influences their entry points.
        </p>

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
        {giveaways.length ? (
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
        ) : loading ? (
          <Loader />
        ) : (
          <TextFrown text='Nothing to see here...' />
        )}
      </div>

      <GiveawayJourney
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          getAndSetGiveaways()
        }}
      />

      <Modal
        open={!!selectedId && !!giveaways.length}
        onClose={() => {
          setSelectedId('')
          getAndSetGiveaways()
        }}
      >
        <GiveawayEnter giveaway={giveaways.find(({ id }) => id === selectedId) as Giveaway} />
      </Modal>
    </div>
  )
}

export default Page
