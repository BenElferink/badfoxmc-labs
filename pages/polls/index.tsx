import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import DropDown from '@/components/form/DropDown'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
// import ErrorNotConnected from '@/components/journeys/steps/ErrorNotConnected'
import PollCard from '@/components/cards/PollCard'
import PollJourney from '@/components/journeys/PollJourney'
import PollEnter from '@/components/PollEnter'
import type { Poll } from '@/@types'

export const POLL_DESCRIPTION =
  "The governance tool is responsible for running weighted polls, it weighs the holder's assets and influences their voting power."

const Page = () => {
  const { query } = useRouter()
  const { user } = useAuth()
  const { polls, fetchPolls } = useData()

  useEffect(() => {
    if (!polls.length) fetchPolls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [openJourney, setOpenJourney] = useState(false)
  const [selectedId, setSelectedId] = useState(query.id)

  useEffect(() => {
    if (query.id) setSelectedId(query.id)
  }, [query])

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
        <p className='w-full m-1'>{POLL_DESCRIPTION}</p>

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
        {!polls.length ? (
          <Loader />
        ) : (
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
        )}
      </div>

      <PollJourney
        open={openJourney}
        onClose={() => {
          setOpenJourney(false)
          fetchPolls()
        }}
      />

      <Modal
        open={!!selectedId && !!polls.length}
        onClose={() => {
          setSelectedId('')
          fetchPolls()
        }}
      >
        {/* {!user ? <ErrorNotConnected onClose={() => setSelectedId('')} /> : <PollEnter poll={polls.find(({ id }) => id === selectedId) as Poll} />} */}
        <PollEnter poll={polls.find(({ id }) => id === selectedId) as Poll} />
      </Modal>
    </div>
  )
}

export default Page
