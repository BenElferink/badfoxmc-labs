import { firestore } from '@/utils/firebase'
import getUser from './getUser'
import type { User } from '@/@types'

const setUser = async (payload: User) => {
  const user = await getUser(payload.stakeKey)
  const collection = firestore.collection('tools/bad-labs/users')

  if (!user) {
    await collection.add(payload)
  } else {
    collection.doc(user.id).update(payload)
  }
}

export default setUser
