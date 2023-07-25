import { firestore } from '@/utils/firebase'
import type { Airdrop } from '@/@types'

const setAirdrop = async (payload: Airdrop) => {
  const collection = firestore.collection('airdrops')
  const { id } = await collection.add(payload)

  return id
}

export default setAirdrop
