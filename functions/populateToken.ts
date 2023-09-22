import type { ApiPopulatedToken, TokenId } from '@/@types'
import blockfrost from '@/utils/blockfrost'
import splitTokenId from './resolvers/splitTokenId'
import formatHex from './formatters/formatHex'
import formatTokenAmount from './formatters/formatTokenAmount'
import formatIpfsReference from './formatters/formatIpfsReference'
import resolveTokenRegisteredMetadata from './resolvers/resolveTokenRegisteredMetadata'
import numbersFromString from './formatters/numbersFromString'

const populateToken = async (tokenId: TokenId, options?: { populateMintTx?: boolean }): Promise<ApiPopulatedToken> => {
  const populateMintTx = options?.populateMintTx || false

  console.log('Fetching token with Token ID:', tokenId)

  const {
    policy_id: policyId,
    fingerprint,
    asset_name,
    quantity,
    onchain_metadata_standard,
    onchain_metadata,
    metadata,
    initial_mint_tx_hash,
  } = await blockfrost.assetsById(tokenId)

  console.log('Fetched token:', fingerprint)

  const tokenAmountOnChain = Number(quantity)
  let tokenAmountDecimals = 0

  const tokenNameOnChain = formatHex.fromHex(asset_name || splitTokenId(tokenId, policyId).tokenName)
  const tokenNameDisplay = onchain_metadata?.name?.toString() || metadata?.name?.toString() || ''
  let tokenNameTicker = ''

  const isFungible = tokenAmountOnChain > 1

  if (isFungible) {
    const { decimals, ticker } = await resolveTokenRegisteredMetadata(tokenId, metadata)

    tokenAmountDecimals = decimals
    tokenNameTicker = ticker
  }

  const thumb = onchain_metadata?.image
    ? Array.isArray(onchain_metadata.image)
      ? onchain_metadata.image.join('')
      : onchain_metadata.image.toString()
    : metadata?.logo
    ? `data:image/png;base64,${metadata?.logo}`
    : ''

  const image =
    thumb.indexOf('data:') === 0 || thumb.indexOf('https:') === 0
      ? {
          ipfs: '',
          url: thumb,
        }
      : formatIpfsReference(thumb.replaceAll(',', ''))

  const files = ((onchain_metadata?.files as ApiPopulatedToken['files']) || []).map((file) => ({
    ...file,
    src: formatIpfsReference(Array.isArray(file.src) ? file.src.join('') : file.src.toString()).ipfs,
  }))

  const attributes: ApiPopulatedToken['attributes'] = {}

  Object.entries(onchain_metadata?.attributes || onchain_metadata || metadata || {}).forEach(([key, val]) => {
    if (
      ![
        'project',
        'collection',
        'name',
        'description',
        'logo',
        'image',
        'mediatype',
        'files',
        'decimals',
        'ticker',
        'url',
        'website',
        'twitter',
        'discord',
      ].includes(key.toLowerCase())
    ) {
      if (onchain_metadata_standard === 'CIP68v1') {
        attributes[key] = formatHex.fromHex(val?.toString() || 'X').slice(1)
      } else {
        if (typeof val === 'object' && !Array.isArray(val)) {
          Object.entries(val).forEach(([subKey, subVal]) => {
            attributes[subKey] = subVal?.toString()
          })
        } else {
          attributes[key] = val?.toString()
        }
      }
    }
  })

  const payload: ApiPopulatedToken = {
    tokenId,
    fingerprint,
    isFungible,
    policyId,
    serialNumber: numbersFromString(tokenNameDisplay) || numbersFromString(tokenNameOnChain) || undefined,
    mintTransactionId: initial_mint_tx_hash,
    mintBlockHeight: undefined,
    tokenAmount: {
      onChain: tokenAmountOnChain,
      decimals: tokenAmountDecimals,
      display: formatTokenAmount.fromChain(tokenAmountOnChain, tokenAmountDecimals),
    },
    tokenName: {
      onChain: tokenNameOnChain,
      ticker: tokenNameTicker,
      display: tokenNameDisplay,
    },
    image,
    files,
    attributes,
  }

  if (populateMintTx) {
    console.log('Fetching TX:', payload.mintTransactionId)

    const tx = await blockfrost.txs(payload.mintTransactionId)

    console.log('Fetched TX')

    payload.mintBlockHeight = tx.block_height
  } else {
    payload.mintBlockHeight = undefined
    delete payload.mintBlockHeight
  }

  if (!payload.serialNumber) {
    payload.serialNumber = undefined
    delete payload.serialNumber
  }

  return payload
}

export default populateToken
