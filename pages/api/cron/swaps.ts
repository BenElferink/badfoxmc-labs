import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { firestore } from '@/utils/firebase'
import sleep from '@/functions/sleep'
import type { Swap } from '@/@types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const collection = firestore.collection('swaps')
        const { docs } = await collection.get()

        const swaps = (
          docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as Swap[]
        ).filter((doc) => !doc.withdraw.txHash && !!doc.deposit.txHash)

        if (swaps.length) {
          console.warn(`found ${swaps.length} bad swaps`)

          for await (const { id } of swaps) {
            await axios.post('https://labs.badfoxmc.com/api/swap', { docId: id })
            await sleep(5000)
          }
        }
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
