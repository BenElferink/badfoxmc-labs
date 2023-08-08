import axios from 'axios'
import { firestore } from '@/utils/firebase'
import { FetchedTimestampResponse } from '@/pages/api/timestamp'
import type { Giveaway } from '@/@types'

const getGiveaways = async () => {
  const collection = firestore.collection('giveaways')
  const collectionQuery = await collection.get()

  const {
    data: { now },
  } = await axios.get<FetchedTimestampResponse>('/api/timestamp')

  const docs = collectionQuery.docs
    .map((doc) => {
      const data = doc.data() as Giveaway

      return {
        ...data,
        active: now < data.endAt,
        id: doc.id,
      }
    })
    .filter((item) => !item.isToken || (item.isToken && !!item.txDeposit))
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
    .sort((a, b) => (!a.active ? b.endAt - a.endAt : a.endAt - b.endAt))

  return docs
}

export default getGiveaways
