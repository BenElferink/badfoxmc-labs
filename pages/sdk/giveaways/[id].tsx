import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import getGiveaways from '@/functions/storage/giveaways/getGiveaways'
import GiveawayEnter from '@/components/GiveawayEnter'
import BackButton from '@/components/sdk/BackButton'
import Loader from '@/components/Loader'
import type { Giveaway } from '@/@types'

const Page: NextPage = () => {
  const {
    query: { id: docId },
  } = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [item, setItem] = useState<Giveaway | null>(null)

  useEffect(() => {
    ;(async () => {
      setMessage('')
      setIsLoading(true)

      try {
        const payload = await getGiveaways(docId as string)

        setItem(payload[0])
      } catch (error: any) {
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
        setMessage(errMsg)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [docId])

  if (isLoading || message) {
    return (
      <div>
        <BackButton />
        {isLoading ? <Loader /> : null}
        {message ? <p className='text-sm text-center'>{message}</p> : null}
      </div>
    )
  }

  return (
    <>
      <BackButton />
      {!item ? <div className='flex items-center justify-center'>Giveaway does not exist...</div> : <GiveawayEnter giveaway={item} isSdk />}
    </>
  )
}

export default Page
