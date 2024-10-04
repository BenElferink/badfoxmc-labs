import { firestore } from '@/utils/firebase'
import type { Airdrop } from '@/@types'

const getAirdrops = async () => {
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
    .filter((x) => x.tokenAmount.onChain)
    .sort((a, b) => b.timestamp - a.timestamp)

  return docs
}

export default getAirdrops
