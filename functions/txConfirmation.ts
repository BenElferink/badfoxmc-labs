import { badApi } from '@/utils/badApi'
import sleep from './sleep'
import type { BadApiTransaction } from '@/@types'

const txConfirmation = async (_txHash: string): Promise<BadApiTransaction> => {
  try {
    const data = await badApi.transaction.getData(_txHash)

    if (data.block) {
      return data
    } else {
      await sleep(1000)
      return await txConfirmation(_txHash)
    }
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

    if (errMsg === `The requested component has not been found. ${_txHash}`) {
      await sleep(1000)
      return await txConfirmation(_txHash)
    } else {
      throw new Error(errMsg)
    }
  }
}

export default txConfirmation
