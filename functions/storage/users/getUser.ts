import { firestore } from '@/utils/firebase'
import type { StakeKey, User } from '@/@types'

const getUser = async (stakeKey: StakeKey): Promise<(User & { id: string }) | undefined> => {
  console.log('fetching user from db')

  const collection = firestore.collection('users')
  const collectionQuery = await collection.where('stakeKey', '==', stakeKey).get()

  const doc = collectionQuery.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as User),
  }))[0]

  console.log('succesfully fetched user from db')

  return doc
}

export default getUser
