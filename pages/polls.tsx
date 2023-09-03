import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import getPolls from '@/functions/storage/polls/getPolls'
import DropDown from '@/components/form/DropDown'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import PollCard from '@/components/cards/PollCard'
import PollJourney from '@/components/journeys/PollJourney'
import PollEnter from '@/components/PollEnter'
import type { Poll } from '@/@types'

const Page = () => {
  const { query } = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [openJourney, setOpenJourney] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedId, setSelectedId] = useState(query.id)

  useEffect(() => {
    if (query.id) setSelectedId(query.id)
  }, [query])

  const getAndSetPolls = useCallback(() => {
    setLoading(true)
    getPolls()
      .then((data) => setPolls(data))
      .catch((error) => console.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getAndSetPolls()
  }, [getAndSetPolls])

  const [filters, setFilters] = useState<{
    who: 'everyone' | 'me'
    status: 'allstatus' | 'active' | 'ended'
  }>({
    who: 'everyone',
    status: 'allstatus',
  })

  return (
    <div className='w-full flex flex-col items-center sm:items-start'>
      <div className='w-full mb-2 flex flex-wrap'>
        <p className='w-full m-1'>
          The governance tool is responsible for running weighted polls, it weighs the holder&apos;s assets and influences their voting power.
        </p>

        <button
          className='w-full m-1 p-4 flex items-center justify-center text-center rounded-lg border border-transparent hover:border-green-600 bg-green-900 hover:bg-green-800'
          onClick={() => setOpenJourney(true)}
        >
          <PlusIcon className='w-6 h-6 mr-2' /> Create a Poll
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
        {polls.length ? (
          polls.map(
            ({
              id,
              active,
              endAt,
              isClassified,
              question,
              options,
              topSerial,

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

              const statusOK =
                filters['status'] === 'allstatus' || (filters['status'] === 'active' && active) || (filters['status'] === 'ended' && !active)

              if (!whoOK || !statusOK) return null

              return (
                <PollCard
                  key={`poll-${id}`}
                  onClick={(_id) => setSelectedId(_id)}
                  id={id}
                  active={active}
                  endAt={endAt}
                  isClassified={isClassified}
                  question={question}
                  topOption={active ? undefined : options.find(({ serial }) => serial === topSerial)}
                />
              )
            }
          )
        ) : loading ? (
          <Loader />
        ) : null}
      </div>

      <PollJourney
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          getAndSetPolls()
        }}
      />

      <Modal
        open={!!selectedId && !!polls.length}
        onClose={() => {
          setSelectedId('')
          getAndSetPolls()
        }}
      >
        <PollEnter poll={polls.find(({ id }) => id === selectedId) as Poll} />
      </Modal>
    </div>
  )
}

export default Page
