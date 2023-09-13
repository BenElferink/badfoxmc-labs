import * as cardanoSerialization from '@emurgo/cardano-serialization-lib-nodejs'
import blockfrost from '@/utils/blockfrost'
import formatHex from '../formatters/formatHex'
import type { Address, StakeKey } from '@/@types'
import { ERROR_TYPES, POLICY_IDS } from '@/constants'

const resolveAddressFromHandle = async (adaHandle: string): Promise<Address['address']> => {
  const assetId = `${POLICY_IDS['ADA_HANDLE']}${formatHex.fromHex(adaHandle.replace('$', ''))}`

  const data = await blockfrost.assetsAddresses(assetId)
  const walletAddress = data[0]?.address || ''

  return walletAddress
}

const resolveWalletIdentifiersFromCborString = async (
  walletIdentifier: string
): Promise<{
  stakeKey: StakeKey
  addresses: Address['address'][]
} | null> => {
  let stringFromCbor = ''

  try {
    stringFromCbor = cardanoSerialization.Address.from_bytes(
      walletIdentifier.length % 2 === 0 && /^[0-9A-F]*$/i.test(walletIdentifier)
        ? Buffer.from(walletIdentifier, 'hex')
        : Buffer.from(walletIdentifier, 'utf-8')
    ).to_bech32()
  } catch (error) {
    return null
  }

  let stakeKey = stringFromCbor.indexOf('stake1') === 0 ? stringFromCbor : ''
  let walletAddress = stringFromCbor.indexOf('addr1') === 0 ? stringFromCbor : ''

  if (!stakeKey && !walletAddress) {
    return null
  }

  if (!stakeKey) {
    const data = await blockfrost.addresses(walletAddress)
    stakeKey = data?.stake_address || ''
  }

  const addresses = stakeKey ? (await blockfrost.accountsAddressesAll(stakeKey)).map((obj) => obj.address) : [walletAddress]

  return {
    stakeKey,
    addresses,
  }
}

const resolveWalletIdentifiers = async (
  walletIdentifier: string
): Promise<{
  stakeKey: StakeKey
  addresses: Address['address'][]
}> => {
  let stakeKey = walletIdentifier.indexOf('stake1') === 0 ? walletIdentifier : ''
  let walletAddress = walletIdentifier.indexOf('addr1') === 0 ? walletIdentifier : ''
  const adaHandle = walletIdentifier.indexOf('$') === 0 ? walletIdentifier : ''

  if (!stakeKey && !walletAddress && !adaHandle) {
    const result = await resolveWalletIdentifiersFromCborString(walletIdentifier)

    if (!result) {
      throw new Error(ERROR_TYPES['INVALID_WALLET_IDENTIFIER'])
    }

    return result
  }

  if (!stakeKey) {
    if (!walletAddress) {
      walletAddress = await resolveAddressFromHandle(adaHandle)
    }

    const data = await blockfrost.addresses(walletAddress)
    stakeKey = data?.stake_address || ''
  }

  const addresses = stakeKey ? (await blockfrost.accountsAddressesAll(stakeKey)).map((obj) => obj.address) : [walletAddress]

  return {
    stakeKey,
    addresses,
  }
}

export default resolveWalletIdentifiers
