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
  blockHeight: number
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

export interface SnapshotHolder {
  stakeKey: StakeKey
  addresses: Address['address'][]
  assets: {
    [policyId: string]: {
      tokenId: string
      humanAmount: number
    }[]
  }
}

export interface PayoutHolder {
  stakeKey: StakeKey
  address: Address['address']
  payout: number
  txHash?: string
}

export interface FungibleTokenHolderWithPoints {
  stakeKey: StakeKey
  hasEntered: boolean
  points: number
}

export interface HolderSettings {
  holderPolicies: {
    policyId: PolicyId
    hasFungibleTokens?: boolean
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

export interface PollOption {
  serial: number
  answer: string
  isMedia: boolean
  mediaType: MediaType | ''
  mediaUrl: string
}

export interface PollSettings extends HolderSettings {
  endAt: number
  isClassified: boolean

  question: string
  description?: string
  options: PollOption[]
}

export interface Airdrop extends TokenSelectionSettings {
  id?: string
  stakeKey: StakeKey
  timestamp: number
}

export interface GiveawayWinner {
  stakeKey: StakeKey
  address: Address['address']
  amount: number
}

export interface Giveaway extends GiveawaySettings {
  id?: string
  stakeKey: StakeKey
  active: boolean

  // for entry
  fungibleHolders: FungibleTokenHolderWithPoints[]
  nonFungibleUsedUnits: TokenId[]

  // for raffle
  entries: {
    stakeKey: StakeKey
    points: number
  }[]
  winners: GiveawayWinner[]

  // for payout
  // txDeposit?: string
  // txsWithdrawn?: string[]
}

export interface Poll extends PollSettings {
  id?: string
  stakeKey: StakeKey
  active: boolean

  // for entry
  fungibleHolders: FungibleTokenHolderWithPoints[]
  nonFungibleUsedUnits: TokenId[]

  // for poll results
  [vote_serial: string]: any // number >= 0
  topSerial?: number
}
