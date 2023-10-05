import axios from 'axios'
import { firebase, firestore } from '@/utils/firebase'
import { FetchedTimestampResponse } from '@/pages/api/timestamp'
import type { Poll, StakeKey } from '@/@types'

const getPolls = async (id?: string, stakeKey?: StakeKey) => {
  console.log('fetching polls(s) from db')

  const collection = firestore.collection('polls')
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
      const data = doc.data() as Poll
      const active = now < data.endAt

      const top = {
        serial: 0,
        amount: 0,
      }

      if (!active) {
        data['options'].forEach(({ serial }) => {
          if (data[`vote_${serial}`] > top.amount) {
            top.serial = serial
            top.amount = data[`vote_${serial}`]
          }
        })
      }

      return {
        ...data,
        id: doc.id,
        active,
        topSerial: top.serial,
      }
    })
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
    .sort((a, b) => (!a.active ? b.endAt - a.endAt : a.endAt - b.endAt))

  console.log(`succesfully fetched ${docs.length} polls(s) from db`)

  return payload
}

export default getPolls
