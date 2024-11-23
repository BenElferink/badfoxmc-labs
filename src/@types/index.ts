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

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO'

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

export interface ApiBaseToken {
  tokenId: TokenId
  isFungible: boolean
  tokenAmount: TokenAmount
  tokenName?: TokenName
}

export interface ApiMarketToken {
  tokenId: string
  signingAddress?: string
  price: number
  date: Date
  marketplace: Marketplace
  activityType: ActivityType
  listingType: ListingType
  bundledTokens?: string[]
}

export interface ApiRankedToken extends ApiBaseToken {
  rarityRank?: number
}

export interface ApiPopulatedToken extends ApiRankedToken {
  fingerprint: string
  policyId: PolicyId
  serialNumber?: number
  mintTransactionId: string
  mintBlockHeight?: number
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

export interface ApiPolicy {
  policyId: PolicyId
  tokens: ApiBaseToken[] | ApiRankedToken[]
}

export interface ApiPolicyMarketDetails {
  policyId: PolicyId
  name: string
  description: string
  pfpUrl: string
  bannerUrl: string
  floorPrice: number
}

export interface ApiMarket {
  tokenId: string
  items: ApiMarketToken[]
}

export interface TokenOwner {
  quantity: number // on-chain value (if using decimals)
  stakeKey: StakeKey
  addresses: Address[]
}

export interface ApiTokenOwners {
  tokenId: TokenId
  page: number
  owners: TokenOwner[]
}

export interface ApiPool {
  poolId: PoolId
  ticker: string
}

export interface ApiPoolDelegators {
  poolId: PoolId
  page: number
  delegators: {
    stakeKey: StakeKey
    delegatedLovelaces: number
  }[]
}

export interface ApiUtxo {
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

export interface ApiTransaction {
  transactionId: TransactionId
  block: string
  blockHeight: number
  utxos?: ApiUtxo[]
}

export interface ApiWallet {
  stakeKey: StakeKey
  addresses: Address[]
  poolId?: PoolId
  handles?: string[]
  tokens?: ApiBaseToken[] | ApiPopulatedToken[]
}

export interface User {
  stakeKey: StakeKey
  lovelaces: number
  tokens: ApiPopulatedToken[]
  isTokenGateHolder: boolean
}

export interface SnapshotHolder {
  stakeKey: StakeKey
  addresses: Address['address'][]
  assets: {
    [policyId: string]: {
      tokenId: string
      isFungible: boolean
      humanAmount: number
    }[]
  }
}

export interface PayoutHolder {
  stakeKey: StakeKey
  address: Address['address']
  payout: number
  forceLovelace?: boolean
  txHash?: string
}

export interface HolderSettings {
  holderPolicies: {
    policyId: PolicyId
    hasFungibleTokens?: boolean
    weight: number

    withTraits?: boolean
    traitOptions?: {
      category: string
      trait: string
      amount: number
    }[]

    withRanks?: boolean
    rankOptions?: {
      minRange: number
      maxRange: number
      amount: number
    }[]

    withWhales?: boolean
    whaleOptions?: {
      shouldStack: boolean
      groupSize: number
      amount: number
    }[]
  }[]

  withBlacklist: boolean
  blacklistWallets: StakeKey[]
  blacklistTokens: TokenId[]

  withDelegators: boolean
  stakePools: PoolId[]
}

export interface TokenSelectionSettings {
  tokenId: TokenId
  tokenName: TokenName
  tokenAmount: TokenAmount
  thumb: string
}

export interface AirdropSettings extends HolderSettings, TokenSelectionSettings {
  airdropMethod: 'none' | 'holder-snapshot' | 'delegator-snapshot' | 'custom-list'
}

export interface Airdrop extends TokenSelectionSettings {
  id?: string
  stakeKey: StakeKey
  timestamp: number
}
