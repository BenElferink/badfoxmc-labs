import { firestore } from '@/utils/firebase'
import getUser from './getUser'
import type { User } from '@/@types'

const setUser = async (payload: User) => {
  const user = await getUser(payload.stakeKey)
  const collection = firestore.collection('users')

  if (!user) {
    if (payload.username) {
      const found = await collection.where('username', '==', payload.username).get()
      if (found.docs.length) throw new Error('Username already taken')
    }

    const { id } = await collection.add(payload)
    return id
  } else {
    collection.doc(user.id).update(payload)
    return user.id
  }
}

export default setUser
