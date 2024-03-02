import type { ApiPopulatedToken, MediaType } from '@/@types'

export const API_KEYS = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  BLOCKFROST_API_KEY: process.env.BLOCKFROST_API_KEY || '',
}

export const WALLET_KEYS = {
  GIVEAWAY_APP_MNEMONIC: Array.isArray(process.env.GIVEAWAY_APP_MNEMONIC)
    ? process.env.GIVEAWAY_APP_MNEMONIC
    : process.env.GIVEAWAY_APP_MNEMONIC?.split(',') || [],

  SWAP_APP_MNEMONIC: Array.isArray(process.env.SWAP_APP_MNEMONIC) ? process.env.SWAP_APP_MNEMONIC : process.env.SWAP_APP_MNEMONIC?.split(',') || [],
}

export const WALLET_ADDRESSES = {
  TREASURY: 'addr1q9p9yq4lz834729chxsdwa7utfp5wr754zkn6hltxz42m594guty04nldwlxnhw8xcgd5pndaaqzzu5qzyvnc8tlgdsqtazkyh',
  ROYALTY: 'addr1qyv7wgxd4fjvp9jxr2v6tdpygmjxwatesaemvassemq6jq2rqhw6rvndlmdnp0y7mwvaux4v2wpz5rusyy8c636az70sjxtwe6',

  MINT_BAD_FOX_2D: 'addr1vytm0f6n564th94cld4xgzr0g8xp4s2j07ww33qn4x2ss6gmmdzlm',
  MINT_BAD_MOTORCYCLE_2D: 'addr1v8l4qgz688jxgerq788kp3xv7qdjymchddrv3dxyug5e3pg83anxd',
  MINT_BAD_KEY: 'addr1v9tce86r8v9larevjr7el7d5ua3eruz2cn4d93mqmt8w4agmy2leh',

  GIVEAWAY_APP: 'addr1v9qxndxhkl2g5qsz5mdv0w07zau5gpp5vttw0perr2py9ugrr25fs',
  SWAP_APP: 'addr1v8sle94z2pyxvza9aj9rd0wln4rctc390y5us700vs4h88qphhn2x',
}

export const POLICY_IDS = {
  ADA_HANDLE: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
  BAD_KEY: '80e3ccc66f4dfeff6bc7d906eb166a984a1fc6d314e33721ad6add14',
  BAD_FOX_2D: 'fa669150ad134964e86b2fa7275a12072f61b438d0d44204d3a2f967',
  BAD_FOX_3D: '8804474d85430846883b804375b26b17c563df2338ea9b46652c3164',
  BAD_MOTORCYCLE_2D: 'ab662f7402af587e64d217995e20f95ac3ae3ff8417d9158b04fbba8',
  BAD_MOTORCYCLE_3D: '',
  SWAP_REFUND_TOKEN: '3fb5127f78910b74a4a6cd5035e62e971a5ca4d69d26be3289087182',
}

export const BFMC_BANKER_CARD_TOKEN_IDS = [
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303733',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303534',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303633',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303638',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303533',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303532',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303636',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303535',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303531',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303631',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303630',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303539',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303632',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303730',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303637',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303732',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303536',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303537',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303639',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303731',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303635',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303634',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303530',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303538',
  '1d52a061c0b6daea2cb248d32790fbf32d21b78723fcfde75177f17642616e6b4361726432303734',
]

// local storage keys
export const LS_KEYS = {
  WALLET_PROVIDER: 'WALLET_PROVIDER',
}

export const ADA_SYMBOL = '₳'
export const ONE_MILLION = 1000000
export const DECIMALS = {
  ADA: 6,
}

export const TIME_LABELS = {
  MINUTES: 'Minutes',
  HOURS: 'Hours',
  DAYS: 'Days',
  WEEKS: 'Weeks',
  MONTHS: 'Months',
}

export const MEDIA_TYPES: Record<MediaType, MediaType> = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
}

export const ERROR_TYPES = {
  INVALID_WALLET_IDENTIFIER: 'INVALID_WALLET_IDENTIFIER',
}

export const POPULATED_LOVELACE: ApiPopulatedToken = {
  tokenId: 'lovelace',
  fingerprint: 'lovelace',
  policyId: 'lovelace',
  isFungible: true,
  mintTransactionId: '',
  tokenName: {
    onChain: 'lovelace',
    ticker: 'ADA',
    display: 'ADA',
  },
  tokenAmount: {
    onChain: 0,
    display: 0,
    decimals: DECIMALS['ADA'],
  },
  image: {
    ipfs: '',
    url: 'https://labs.badfoxmc.com/media/ada.png',
  },
  files: [],
  attributes: {},
}