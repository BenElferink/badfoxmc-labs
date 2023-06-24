export type StakeKey = string
export type Address = {
  address: string
  isScript: boolean
}

export type PolicyId = string
export type TokenId = string
export type PoolId = string
export type TransactionId = string

export type Marketplace = 'jpg.store'
export type ActivityType = 'LIST' | 'DELIST' | 'BUY' | 'SELL' | 'UPDATE'
export type ListingType = 'SINGLE' | 'BUNDLE' | 'UNKNOWN'

export type MediaType = 'IMAGE' | 'GIF' | 'VIDEO' | '360_VIDEO' | 'AUDIO'

type TokenAmount = {
  onChain: number
  decimals: number
  display: number
}

type TokenName = {
  onChain: string
  ticker: string
  display: string
}

export interface BadApiBaseToken {
  tokenId: TokenId
  isFungible: boolean
  tokenAmount: TokenAmount
  tokenName?: TokenName
}

export interface BadApiMarketToken {
  tokenId: string
  signingAddress?: string
  price: number
  date: Date
  marketplace: Marketplace
  activityType: ActivityType
  listingType: ListingType
  bundledTokens?: string[]
}

export interface BadApiRankedToken extends BadApiBaseToken {
  rarityRank?: number
}

export interface BadApiPopulatedToken extends BadApiRankedToken {
  fingerprint: string
  policyId: PolicyId
  serialNumber?: number
  image: {
    ipfs: string
    url: string
  }
  files: {
    src: string
    mediaType: string
    name: string
  }[]
  attributes: {
    [key: string]: any
  }
}

export interface BadApiPolicy {
  policyId: PolicyId
  tokens: BadApiBaseToken[] | BadApiRankedToken[]
}

export interface BadApiMarket {
  tokenId: string
  items: BadApiMarketToken[]
}

export interface BadApiTokenOwners {
  tokenId: string
  page: number
  owners: {
    quantity: number
    stakeKey: string
    addresses: Address[]
  }[]
}

export interface BadApiPool {
  poolId: PoolId
  ticker: string
  delegators?: StakeKey[]
}

export interface BadApiUtxo {
  address: {
    from: string
    to: string
  }
  tokens: {
    tokenId: string
    tokenAmount: {
      onChain: number
    }
  }[]
}

export interface BadApiTransaction {
  transactionId: TransactionId
  block: string
  utxos?: BadApiUtxo[]
}

export interface BadApiWallet {
  stakeKey: StakeKey
  addresses: Address[]
  poolId?: PoolId
  tokens?: BadApiBaseToken[]
}

export interface User extends BadApiWallet {
  tokens?: BadApiPopulatedToken[]
  username?: string
  profilePicture?: string
  isTokenGateHolder?: boolean
}

export interface Airdrop {
  id?: string
  stakeKey: string
  timestamp: number
  thumb: string
  tokenName: TokenName
  tokenAmount: TokenAmount
}
