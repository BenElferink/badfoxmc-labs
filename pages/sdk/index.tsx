import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { badApi } from '@/utils/badApi'
import { useAuth } from '@/contexts/AuthContext'
import getPolls from '@/functions/storage/polls/getPolls'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
// import PollCard from '@/components/PollCard'
import GiveawayCard from '@/components/GiveawayCard'
import Loader from '@/components/Loader'
import type { Giveaway, Poll } from '@/@types'

const Page = () => {
  const router = useRouter()
  const { product, creator_stake_key: creatorStakeKey, user_stake_key: userStakeKey } = router.query

  const [polls, setPolls] = useState<Poll[]>([])
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [cKey, setCKey] = useState('')

  const { user, getAndSetUser } = useAuth()

  useEffect(() => {
    if (!product || !creatorStakeKey || !userStakeKey) {
      setMessage('Error: missing query params')
    } else {
      ;(async () => {
        setMessage('')
        setIsLoading(true)

        let creatorKey = cKey

        if (!creatorKey) {
          try {
            const { stakeKey } = await badApi.wallet.getData(creatorStakeKey as string)
            setCKey(stakeKey)
            creatorKey = stakeKey
          } catch (error: any) {
            const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
            setMessage(errMsg)
            setIsLoading(false)
            return
          }
        }

        if (!user) {
          try {
            const { stakeKey } = await badApi.wallet.getData(userStakeKey as string)
            if (!user) await getAndSetUser(stakeKey)
          } catch (error: any) {
            const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
            setMessage(errMsg)
            setIsLoading(false)
            return
          }
        }

        try {
          switch (product) {
            case 'polls': {
              const payload = await getPolls('', creatorKey)
              setPolls(payload)
              break
            }

            case 'giveaways': {
              const payload = await getGiveaways('', creatorKey)
              setGiveaways(payload)
              break
            }

            default: {
              break
            }
          }

          setMessage('')
          setIsLoading(false)
        } catch (error: any) {
          const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
          setMessage(errMsg)
          setIsLoading(false)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, creatorStakeKey, userStakeKey])

  if (isLoading || message) {
    return (
      <div>
        {isLoading ? <Loader /> : null}
        {message ? <p className='text-sm text-center'>{message}</p> : null}
      </div>
    )
  }

  return (
    <div className='flex flex-wrap justify-center'>
      {product === 'polls' ? (
        !polls.length ? (
          <p className='text-sm text-center'>
            No polls created yet from this stake key:
            <br />
            {cKey}
          </p>
        ) : // polls.map((poll) => (
        //   <PollCard
        //     key={`poll-${poll.id}`}
        //     navToPage={`/sdk/${poll.id}?voter_stake_key=${uKey}`}
        //     active={poll.active}
        //     endAt={poll.endAt}
        //     question={poll.question}
        //     allowPublicView={poll.allowPublicView}
        //     className='m-1 p-4 text-sm hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-xl border hover:border border-gray-700 hover:border-gray-500 select-none cursor-pointer'
        //   />
        // ))
        null
      ) : product === 'giveaways' ? (
        !giveaways.length ? (
          <p className='text-sm text-center'>
            No giveaways created yet from this stake key:
            <br />
            {cKey}
          </p>
        ) : (
          giveaways.map(({ id, active, endAt, thumb, isToken, tokenName, tokenAmount, otherTitle, otherAmount }) => (
            <GiveawayCard
              key={`giveaway-${id}`}
              onClick={(_id) => router.push(`/sdk/${product}/${id}`)}
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
          ))
        )
      ) : null}
    </div>
  )
}

export default Page
