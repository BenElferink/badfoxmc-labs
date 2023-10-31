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
        const now = new Date().getTime()
        const waitTime = 900000

        const collection = firestore.collection('swaps')
        const { docs } = await collection.get()

        const swaps = docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as (Swap & { id: string })[]

        const swapsThatNeedToWithdraw = swaps.filter((doc) => !doc.withdraw.txHash && !!doc.deposit.txHash && now - doc.timestamp >= waitTime)
        const swapsThatNeedToDelete = swaps.filter((doc) => !doc.withdraw.txHash && !doc.deposit.txHash && now - doc.timestamp >= waitTime)

        if (swapsThatNeedToWithdraw.length) {
          console.warn(`found ${swapsThatNeedToWithdraw.length} swaps that need to withdraw`)

          for await (const { id } of swapsThatNeedToWithdraw) {
            await axios.post('https://labs.badfoxmc.com/api/swap', { docId: id })
            await sleep(2000)
          }
        }

        if (swapsThatNeedToDelete.length) {
          console.warn(`found ${swapsThatNeedToDelete.length} swaps that need to delete`)

          for await (const { id } of swapsThatNeedToDelete) {
            await collection.doc(id).delete()
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
