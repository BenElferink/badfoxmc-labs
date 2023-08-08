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

export type MediaType = 'IMAGE' | 'VIDEO' | '360_VIDEO' | 'AUDIO'

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
  lovelaces?: number
  username?: string
  profilePicture?: string
  isTokenGateHolder?: boolean
  tokens?: BadApiPopulatedToken[]
}

export interface HolderSettings {
  holderPolicies: {
    policyId: PolicyId
    weight: number

    withTraits: boolean
    traitOptions: {
      category: string
      trait: string
      amount: number
    }[]

    withRanks: boolean
    rankOptions: {
      minRange: number
      maxRange: number
      amount: number
    }[]
  }[]

  withBlacklist: boolean
  blacklist: StakeKey[]

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
  useCustomList: boolean
}

export interface GiveawaySettings extends HolderSettings, TokenSelectionSettings {
  isToken: boolean

  otherTitle: string
  otherDescription: string
  otherAmount: number

  numOfWinners: number
  endAt: number
}

export interface Airdrop extends TokenSelectionSettings {
  id?: string
  stakeKey: string
  timestamp: number
}

export interface Giveaway extends GiveawaySettings {
  id?: string
  stakeKey: string
  active: boolean

  txDeposit?: string
  txsWithdrawn?: string[]

  entries: {
    stakeKey: string
    points: number
  }[]
  winners: {
    stakeKey: string
    address: string
    amount: number
  }[]
}

export interface SnapshotHolder {
  stakeKey: string
  addresses: string[]
  assets: {
    [policyId: string]: {
      tokenId: string
      amount: number
    }[]
  }
}

export interface PayoutHolder {
  stakeKey: string
  address: string
  payout: number
  txHash?: string
}
