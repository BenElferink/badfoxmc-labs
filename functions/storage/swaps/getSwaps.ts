import { firestore } from '@/utils/firebase'
import type { Swap } from '@/@types'

const getSwaps = async () => {
  console.log('fetching swaps from db')

  const collection = firestore.collection('swaps')
  const collectionQuery = await collection.get()

  const docs = collectionQuery.docs
    .map((doc) => {
      const data = doc.data() as Swap

      return {
        id: doc.id,
        ...data,
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  console.log(`succesfully fetched ${docs.length} swaps from db`)

  return docs
}

export default getSwaps
