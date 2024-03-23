import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider, ForgeScript, Transaction } from '@meshsdk/core'
import api from '@/utils/api'
import { API_KEYS, POLICY_IDS, WALLET_ADDRESSES, WALLET_KEYS } from '@/constants'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const { tokens } = await api.wallet.getData(WALLET_ADDRESSES['SWAP_APP'], { withTokens: true })
        const refundTokens = tokens?.filter((t) => t.tokenId.indexOf(POLICY_IDS['SWAP_REFUND_TOKEN']) === 0)

        if (!refundTokens?.length) {
          return res.status(204).end()
        }

        const provider = new BlockfrostProvider(API_KEYS['BLOCKFROST_API_KEY'])
        const wallet = new AppWallet({
          networkId: 1,
          fetcher: provider,
          submitter: provider,
          key: {
            type: 'mnemonic',
            words: WALLET_KEYS['SWAP_APP_MNEMONIC'],
          },
        })

        const forgingScript = ForgeScript.withOneSignature(wallet.getPaymentAddress())
        const tx = new Transaction({ initiator: wallet })

        refundTokens.forEach((t) =>
          tx.burnAsset(forgingScript, {
            unit: t.tokenId,
            quantity: t.tokenAmount.onChain.toString(),
          })
        )

        const unsignedTx = await tx.build()
        const signedTx = await wallet.signTx(unsignedTx)
        const txHash = await wallet.submitTx(signedTx)

        console.log('refund tokens burned:', txHash)

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
