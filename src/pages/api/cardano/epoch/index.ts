import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import { firestore } from '@/utils/firebase'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

export interface EpochResponse {
  epoch: number
  percent: number
  startTime: number
  endTime: number
  nowTime: number
}

const handler = async (req: NextApiRequest, res: NextApiResponse<EpochResponse>) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        let epoch = 0
        let startTime: string | number = 0
        let endTime: string | number = 0
        const nowTime = Date.now()

        const collection = firestore.collection('epochs')
        const { empty, docs } = await collection.where('endTime', '>=', nowTime).get()

        if (empty) {
          const { epoch: epochNumber, start_time, end_time } = await blockfrost.epochsLatest()

          epoch = epochNumber

          startTime = String(start_time)
          while (startTime.length < 13) startTime = `${startTime}0`
          startTime = Number(startTime)

          endTime = String(end_time)
          while (endTime.length < 13) endTime = `${endTime}0`
          endTime = Number(endTime)

          await collection.add({
            epoch,
            startTime,
            endTime,
          })
        } else {
          const data = docs[0].data()

          epoch = data.epoch as number
          startTime = data.startTime as number
          endTime = data.endTime as number
        }

        const payload = {
          epoch,
          percent: (100 / (endTime - startTime)) * (nowTime - startTime),
          startTime,
          endTime,
          nowTime,
        }

        return res.status(200).json(payload)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    return res.status(500).end()
  }
}

export default handler