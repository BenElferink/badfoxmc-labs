import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import getPolls from '@/functions/storage/polls/getPolls'
import PollEnter from '@/components/PollEnter'
import BackButton from '@/components/sdk/BackButton'
import Loader from '@/components/Loader'
import type { Poll } from '@/@types'

const Page: NextPage = () => {
  const {
    query: { id: docId },
  } = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [item, setItem] = useState<Poll | null>(null)

  useEffect(() => {
    ;(async () => {
      setMessage('')
      setIsLoading(true)

      try {
        const payload = await getPolls(docId as string)

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
      {!item ? <div className='flex items-center justify-center'>Poll does not exist...</div> : <PollEnter poll={item} isSdk />}
    </>
  )
}

export default Page
