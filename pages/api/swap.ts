import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider, Transaction } from '@meshsdk/core'
import { firestore } from '@/utils/firebase'
import api from '@/utils/api'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import type { Swap } from '@/@types'
import { API_KEYS, DECIMALS, WALLET_ADDRESSES, WALLET_KEYS } from '@/constants'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req

  try {
    switch (method) {
      case 'POST': {
        const { docId } = body

        const collection = firestore.collection('swaps')
        const doc = await collection.doc(docId).get()
        const docData = doc.data()

        if (!docData) return res.status(404).end('doc not found')

        const { stakeKey, withdraw, deposit } = docData as Swap

        if (!!withdraw.txHash) return res.status(400).end('already withdrawn')
        if (!deposit.txHash) return res.status(400).end('no deposit tx hash')

        const txData = await api.transaction.getData(deposit.txHash, { withUtxos: true })

        if (!txData) return res.status(400).end('tx not submitted yet')

        let receivedUnit = ''
        let requestedUnit = withdraw.tokenId
        let isRefunded = false

        for (const { address, tokens } of txData.utxos || []) {
          if (!!receivedUnit) break
          for (const { tokenId } of tokens) {
            if (tokenId === deposit.tokenId && address.to === WALLET_ADDRESSES['SWAP_APP']) {
              receivedUnit = tokenId
              break
            }
          }
        }

        if (!receivedUnit) return res.status(400).end('tx does not have the deposit token')

        const requestingWallet = await api.wallet.getData(stakeKey)
        const toAddress = requestingWallet.addresses[0].address

        const swapWallet = await api.wallet.getData(WALLET_ADDRESSES['SWAP_APP'], { withTokens: true })
        const foundInSwapWallet = swapWallet.tokens?.find(({ tokenId }) => tokenId === requestedUnit)

        if (!foundInSwapWallet) {
          console.warn('swap wallet does not have the withdraw token, returning to sender')
          requestedUnit = receivedUnit
          isRefunded = true
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

        const tx = new Transaction({ initiator: wallet }).sendAssets({ address: toAddress }, [
          {
            unit: requestedUnit,
            quantity: '1',
          },
        ])

        if (requestedUnit === receivedUnit) {
          tx.sendLovelace({ address: toAddress }, formatTokenAmount.toChain(1, DECIMALS['ADA']).toString())
        }

        console.log('building tx')
        const unsignedTx = await tx.build()
        console.log('awaiting signature', unsignedTx)
        const signedTx = await wallet.signTx(unsignedTx)
        console.log('submitting tx', signedTx)
        const txHash = await wallet.submitTx(signedTx)
        console.log('tx submitted', txHash)

        await collection.doc(docId).update({
          isRefunded,
          withdraw: {
            ...docData.withdraw,
            txHash,
          },
        })

        return res.status(200).json({
          txHash,
        })
      }

      default: {
        res.setHeader('Allow', 'POST')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
