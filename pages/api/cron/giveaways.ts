import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider, Transaction } from '@meshsdk/core'
import { firebase, firestore } from '@/utils/firebase'
import { badApi } from '@/utils/badApi'
import { API_KEYS, WALLET_KEYS } from '@/constants'
import type { Address, Giveaway, StakeKey, TokenId, TransactionId } from '@/@types'
// import txConfirmation from '@/functions/txConfirmation'

interface Winner {
  stakeKey: StakeKey
  address: Address['address']
  amount: number
}

interface PayTo extends Winner {
  tokenId: TokenId
  transactionId?: TransactionId
}

const sendToWallets = async (payTo: PayTo[], difference?: number): Promise<PayTo[]> => {
  console.log('Batching TXs')

  const unpayedWallets = payTo.filter(({ transactionId }) => !transactionId)
  const batchSize = difference ? Math.floor(difference * unpayedWallets.length) : unpayedWallets.length
  const batches: PayTo[][] = []

  for (let i = 0; i < unpayedWallets.length; i += batchSize) {
    batches.push(unpayedWallets.slice(i, (i / batchSize + 1) * batchSize))
  }

  try {
    const provider = new BlockfrostProvider(API_KEYS['BLOCKFROST_API_KEY'])
    const wallet = new AppWallet({
      networkId: 1,
      fetcher: provider,
      submitter: provider,
      key: {
        type: 'mnemonic',
        words: WALLET_KEYS['GIVEAWAY_APP_MNEMONIC'],
      },
    })

    for await (const [idx, batch] of batches.entries()) {
      const tx = new Transaction({ initiator: wallet })

      for (const { address, amount, tokenId } of batch) {
        tx.sendAssets({ address }, [
          {
            unit: tokenId,
            quantity: amount.toString(),
          },
        ])
      }

      // this may throw an error if TX size is over the limit
      const unsignedTx = await tx.build()
      console.log(`Building TX ${idx + 1} of ${batches.length}`)

      console.log('Awaiting signature...', unsignedTx)
      const signedTx = await wallet.signTx(unsignedTx)

      console.log('Submitting TX...', signedTx)
      const txHash = await wallet.submitTx(signedTx)

      console.log('TX submitted!', txHash)

      // console.log('Awaiting network confirmation...')
      // await txConfirmation(txHash)
      // console.log('Confirmed!', txHash)

      payTo = payTo.map((item) =>
        batch.some(({ stakeKey }) => stakeKey === item.stakeKey)
          ? {
              ...item,
              transactionId: txHash,
            }
          : item
      )
    }

    return payTo
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || ''
    console.error(errMsg)

    if (!!errMsg && errMsg.indexOf('Maximum transaction size') !== -1) {
      // [Transaction] An error occurred during build: Maximum transaction size of 16384 exceeded. Found: 21861.
      const splitMessage: string[] = errMsg.split(' ')
      const [max, curr] = splitMessage.filter((str) => !isNaN(Number(str))).map((str) => Number(str))
      // [16384, 21861]

      const newDifference = (difference || 1) * (max / curr)

      return await sendToWallets(payTo, newDifference)
    }

    throw new Error(errMsg)
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const now = Date.now()

        const { FieldValue } = firebase.firestore
        const collection = firestore.collection('giveaways')
        const collectionQuery = await collection.where('active', '==', true).get()

        const docsThatNeedToRaffleWinners = collectionQuery.docs
          .map((doc) => {
            const data = doc.data() as Giveaway

            return {
              ...data,
              active: now < data.endAt,
              id: doc.id,
            }
          })
          .filter((item) => !item.active)

        const payTo: PayTo[] = []

        for await (const doc of docsThatNeedToRaffleWinners) {
          const { id, stakeKey, isToken, tokenId, tokenAmount, otherAmount, numOfWinners, entries } = doc

          const winners: Winner[] = []
          const enteredStakeKeys: string[] = entries.map((entry) => new Array(entry.points).fill(entry.stakeKey)).flat()

          let finalNumOfWinners = Math.min(numOfWinners, enteredStakeKeys.length)

          if (!finalNumOfWinners) {
            // basically returns prize to the owner
            enteredStakeKeys.push(stakeKey)
            finalNumOfWinners = 1
          }

          const amountPerWinner = Math.floor((isToken ? tokenAmount.onChain : otherAmount) / finalNumOfWinners)

          for (let i = 1; i <= finalNumOfWinners; i++) {
            const randomIdx = Math.floor(Math.random() * enteredStakeKeys.length)
            const thisStakeKey = enteredStakeKeys[randomIdx]

            const alreadyWon = winners.find((obj) => obj.stakeKey === thisStakeKey)

            if (alreadyWon) {
              i--
            } else {
              const wallet = await badApi.wallet.getData(thisStakeKey)
              const { address } = wallet.addresses[0]

              winners.push({
                stakeKey: thisStakeKey,
                address,
                amount: amountPerWinner,
              })
            }

            enteredStakeKeys.splice(randomIdx, 1)
          }

          const updateBody: {
            active: boolean
            winners: firebase.firestore.FieldValue
            txsWithdrawn?: firebase.firestore.FieldValue
          } = {
            active: false,
            winners: FieldValue.arrayUnion(...winners),
          }

          if (isToken) {
            payTo.push(
              ...winners.map((item) => ({
                ...item,
                tokenId,
              }))
            )
          }

          await collection.doc(id).update(updateBody)
        }

        if (payTo.length) {
          const payedOut = await sendToWallets(payTo)

          console.log('payout done', payedOut)
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
