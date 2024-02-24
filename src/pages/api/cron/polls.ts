import type { NextApiRequest, NextApiResponse } from 'next'
import { firestore } from '@/utils/firebase'
import type { Poll } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const now = Date.now()

        const collection = firestore.collection('polls')
        const collectionQuery = await collection.where('active', '==', true).get()

        const docsThatNeedToUpdate = collectionQuery.docs
          .map((doc) => {
            const data = doc.data() as Poll

            return {
              ...data,
              active: now < data.endAt,
              id: doc.id,
            }
          })
          .filter((item) => !item.active)

        const batch = firestore.batch()

        for await (const doc of docsThatNeedToUpdate) {
          const { id, entries } = doc

          const updateBody: Partial<Poll> = {
            active: false,
            fungibleHolders: [],
            nonFungibleUsedUnits: [],
            entries: [],
            totalEntries: entries.length,
          }

          batch.update(collection.doc(id), updateBody)
        }

        await batch.commit()

        return res.status(204).end()
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
