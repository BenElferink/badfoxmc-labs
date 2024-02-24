import { firestore } from '@/utils/firebase'
import type { Airdrop } from '@/@types'

const getAirdrops = async () => {
  console.log('fetching airdrop(s) from db')

  const collection = firestore.collection('airdrops')
  const collectionQuery = await collection.get()

  const docs = collectionQuery.docs
    .map((doc) => {
      const data = doc.data() as Airdrop

      return {
        id: doc.id,
        ...data,
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  console.log(`succesfully fetched ${docs.length} airdrop(s) from db`)

  return docs
}

export default getAirdrops
