import axios from 'axios'
import { firebase, firestore } from '@/utils/firebase'
import { FetchedTimestampResponse } from '@/pages/api/timestamp'
import type { Giveaway, StakeKey } from '@/@types'

const getGiveaways = async (id?: string, stakeKey?: StakeKey) => {
  console.log('fetching giveaway(s) from db')

  const collection = firestore.collection('giveaways')
  const docs: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>[] = []

  if (!!id) {
    const doc = await collection.doc(id).get()
    docs.push(doc)
  } else if (!!stakeKey) {
    const collectionQuery = await collection.where('stakeKey', '==', stakeKey).get()
    docs.push(...collectionQuery.docs)
  } else {
    const collectionQuery = await collection.get()
    docs.push(...collectionQuery.docs)
  }

  const {
    data: { now },
  } = await axios.get<FetchedTimestampResponse>('/api/timestamp')

  const payload = docs
    .map((doc) => {
      const data = doc.data() as Giveaway

      return {
        ...data,
        active: now < data.endAt,
        id: doc.id,
      }
    })
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
    .sort((a, b) => (!a.active ? b.endAt - a.endAt : a.endAt - b.endAt))

  console.log(`succesfully fetched ${docs.length} giveaway(s) from db`)

  return payload
}

export default getGiveaways
