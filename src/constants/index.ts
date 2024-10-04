import type { ApiPopulatedToken, MediaType } from '@/@types'

export const SYMBOLS = {
  ADA: '₳',
}
export const DECIMALS = {
  ADA: 6,
}

export const API_KEYS = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  BLOCKFROST_API_KEY: process.env.BLOCKFROST_API_KEY || '',
}

export const WALLETS = {
  STAKE_KEYS: {
    TREASURY: 'stake1ux65w9j86elkh0nfmhrnvyx6qek77sppw2qpzxfur4l5xcqvvc06y',
  },
  ADDRESSES: {
    TREASURY: 'addr1q9p9yq4lz834729chxsdwa7utfp5wr754zkn6hltxz42m594guty04nldwlxnhw8xcgd5pndaaqzzu5qzyvnc8tlgdsqtazkyh',
  },
  KEYS: {
    // MNEMONIC: Array.isArray(process.env.MNEMONIC) ? process.env.MNEMONIC : process.env.MNEMONIC?.split(',') || [],
  },
}

export const POLICY_IDS = {
  ADA_HANDLE: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
  BAD_KEY: '80e3ccc66f4dfeff6bc7d906eb166a984a1fc6d314e33721ad6add14',
}

export const LS_KEYS = {
  WALLET_PROVIDER: 'WALLET_PROVIDER',
}
export const ERROR_TYPES = {
  INVALID_WALLET_IDENTIFIER: 'INVALID_WALLET_IDENTIFIER',
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
