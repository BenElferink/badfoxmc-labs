import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider } from '@meshsdk/core'
import type { Address } from '@/@types'
import { API_KEYS } from '@/constants'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

export interface WalletGeneratwResponse {
  address: Address['address']
  mnemonic: string[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<WalletGeneratwResponse>) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        console.log('Generating new app wallet')

        const mnemonic = AppWallet.brew()

        const provider = new BlockfrostProvider(API_KEYS['BLOCKFROST_API_KEY'])
        const wallet = new AppWallet({
          networkId: 1,
          fetcher: provider,
          submitter: provider,
          key: {
            type: 'mnemonic',
            words: mnemonic,
          },
        })

        const address = wallet.getPaymentAddress()

        console.log('Successfully generated app wallet:', '')

        return res.status(200).json({
          address,
          mnemonic,
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
