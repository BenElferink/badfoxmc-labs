import type { NextApiRequest, NextApiResponse } from 'next'
import jpgStore from '@/utils/jpgStore'
import type { ApiMarketToken } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

export interface PolicyMarketActivityResponse {
  policyId: string
  items: ApiMarketToken[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<PolicyMarketActivityResponse>) => {
  const { method, query } = req

  const policyId = query.policy_id?.toString()

  if (!policyId) {
    return res.status(400).end()
  }

  try {
    switch (method) {
      case 'GET': {
        const recentSales = await jpgStore.getRecents(policyId, { sold: true })
        const recentListings = await jpgStore.getRecents(policyId, { sold: false })

        const sorted = recentSales
          .concat(recentListings)
          .sort((a, b) => a.tokenId.localeCompare(b.tokenId))
          .sort((a, b) => b.date.getTime() - a.date.getTime())

        const payload: typeof sorted = []

        const checkIsObjectDuplicate = (obj1: Record<string, any>, obj2?: Record<string, any>) => {
          if (!obj2) return false

          const entries = Object.entries(obj1)
          const sameValues = entries.filter(([key, val]) => obj2[key]?.toString() === val.toString())
          const isDuplicate = entries.length === sameValues.length

          return isDuplicate
        }

        for (const item of sorted) {
          const endIdx = payload.length - 1
          const isDuplicate = checkIsObjectDuplicate(item, payload[endIdx])

          if (!isDuplicate) payload.push(item)
        }

        return res.status(200).json({
          policyId,
          items: payload,
        })
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
