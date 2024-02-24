import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider, ForgeScript, Mint, Transaction } from '@meshsdk/core'
import { firestore } from '@/utils/firebase'
import api from '@/utils/api'
import type { PolicyDoc, SwapProvider, TokenId } from '@/@types'
import { API_KEYS, WALLET_ADDRESSES, WALLET_KEYS } from '@/constants'
import blockfrost from '@/utils/blockfrost'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const policiesColl = firestore.collection('policies')
        const swapProvidersColl = firestore.collection('swap-providers')
        const { docs } = await swapProvidersColl.where('mintTxHash', '==', '').get()

        const docsThatNeedToMint = docs
          .map((doc) => ({
            ...(doc.data() as SwapProvider),
            id: doc.id,
          }))
          .filter((doc) => !!doc.depositTxHash)

        if (!docsThatNeedToMint.length) {
          return res.status(204).end()
        }

        // Note : only process one at a time until scaling solution has been provided
        const { id, stakeKey, depositTokens, depositTxHash } = docsThatNeedToMint[0]

        const txData = await api.transaction.getData(depositTxHash, { withUtxos: true })

        if (!txData) return res.status(500).end('tx not submitted yet')

        const receivedUnits: TokenId[] = []

        for (const { address, tokens } of txData.utxos || []) {
          if (receivedUnits.length === depositTokens.length) break

          for (const { tokenId } of tokens) {
            if (depositTokens.find((t) => t.unit === tokenId) && address.to === WALLET_ADDRESSES['SWAP_APP']) {
              receivedUnits.push(tokenId)
            }
          }
        }

        if (receivedUnits.length !== depositTokens.length) return res.status(500).end('tx does not have all the deposit tokens')

        const recipientWallet = await api.wallet.getData(stakeKey)
        const recipientAddress = recipientWallet.addresses[0].address

        const assetsToMint: Mint[] = []

        for await (const { unit, quantity } of depositTokens) {
          const { policy_id: policyId } = await blockfrost.assetsById(unit)

          let dbSerialNumber: number
          const policyDoc = await policiesColl.doc(policyId).get()

          if (policyDoc.exists) {
            dbSerialNumber = (policyDoc.data() as PolicyDoc).dbSerialNumber
          } else {
            const { docs: policyDocs } = await policiesColl.get()

            dbSerialNumber = policyDocs.length + 1

            const newDocData: PolicyDoc = {
              dbSerialNumber,
              policyId,
            }

            await policiesColl.doc(policyId).set(newDocData)
          }

          const splitPolicy = []

          for (let i = 0; true; i += 64) {
            const str = policyId.substring(i, i + 64)

            if (!str) break
            splitPolicy.push(str)
          }

          const asset: Mint = {
            recipient: recipientAddress,
            label: '721',
            assetName: `RefundToken${dbSerialNumber}`,
            assetQuantity: quantity,
            metadata: {
              name: 'Refund Token',
              image: 'ipfs://QmPNGhopX7xmoyxx5AM2fHw6X3jrDBWfkRCzJFnQuRLSLM',
              mediaType: 'image/jpg',
              description: 'Serves as a refund token for given Policy IDs on Bad Labs.',
              website: 'https://labs.badfoxmc.com/',
              forPolicy: splitPolicy,
            },
          }

          const foundIndex = assetsToMint.findIndex(({ assetName }) => assetName === asset.assetName)

          if (foundIndex === -1) {
            assetsToMint.push(asset)
          } else {
            assetsToMint[foundIndex].assetQuantity = (Number(assetsToMint[foundIndex].assetQuantity) + Number(asset.assetQuantity)).toString()
          }
        }

        if (!assetsToMint.length) {
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

        assetsToMint.forEach((asset) => tx.mintAsset(forgingScript, asset))

        const unsignedTx = await tx.build()
        const signedTx = await wallet.signTx(unsignedTx)
        const txHash = await wallet.submitTx(signedTx)

        await swapProvidersColl.doc(id).update({
          mintTxHash: txHash,
        })

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
