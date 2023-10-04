import type { NextApiRequest, NextApiResponse } from 'next'
import jpgStore from '@/utils/jpgStore'
import type { ApiPolicyMarketDetails } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

export interface PolicyMarketListingsResponse extends ApiPolicyMarketDetails {}

const handler = async (req: NextApiRequest, res: NextApiResponse<PolicyMarketListingsResponse>) => {
  const { method, query } = req

  const policyId = query.policy_id?.toString()

  if (!policyId) {
    return res.status(400).end()
  }

  try {
    switch (method) {
      case 'GET': {
        const data = await jpgStore.getCollectionDetails(policyId)

        return res.status(200).json(data)
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
