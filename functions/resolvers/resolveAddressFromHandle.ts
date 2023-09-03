import blockfrost from '@/utils/blockfrost'
import formatHex from '../formatters/formatHex'
import { POLICY_IDS } from '@/constants'

export const resolveAddressFromHandle = async (adaHandle: string): Promise<string> => {
  const assetId = `${POLICY_IDS['ADA_HANDLE']}${formatHex.fromHex(adaHandle.replace('$', ''))}`

  const data = await blockfrost.assetsAddresses(assetId)
  const walletAddress = data[0]?.address || ''

  return walletAddress
}
