import type { NextApiRequest, NextApiResponse } from 'next'
import { TIME_LABELS } from '../../constants'

export interface FetchedTimestampResponse {
  now: number
  endAt: number
}

const handler = async (req: NextApiRequest, res: NextApiResponse<FetchedTimestampResponse>) => {
  const { method, query } = req

  const endPeriod = query.endPeriod
  const endAmount = Number(query.endAmount)

  try {
    switch (method) {
      case 'GET': {
        const now = Date.now()
        let endAt = 0

        switch (endPeriod) {
          case TIME_LABELS['MINUTES']: {
            endAt = new Date(now + 60000 * endAmount).getTime()
            break
          }

          case TIME_LABELS['HOURS']: {
            endAt = new Date(now + 60000 * 60 * endAmount).getTime()
            break
          }

          case TIME_LABELS['DAYS']: {
            endAt = new Date(now + 60000 * 60 * 24 * endAmount).getTime()
            break
          }

          case TIME_LABELS['WEEKS']: {
            endAt = new Date(now + 60000 * 60 * 24 * 7 * endAmount).getTime()
            break
          }

          case TIME_LABELS['MONTHS']: {
            endAt = new Date(now + 60000 * 60 * 24 * 7 * 4 * endAmount).getTime()
            break
          }

          default: {
            endAt = 0
            break
          }
        }

        return res.status(200).json({
          now,
          endAt,
        })
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
