import type { ApiPopulatedToken, MediaType } from '@/@types';

export const SYMBOLS = {
  ADA: '₳',
};
export const DECIMALS = {
  ADA: 6,
};

export const API_KEYS = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  BLOCKFROST_API_KEY: process.env.BLOCKFROST_API_KEY || '',
};

export const WALLETS = {
  STAKE_KEYS: {
    DEV: 'stake1u80fcwkvn0cdy2zn8hlw7vf4v4sq4q23khj4z39wtvflr5cmyn8n7',
  },
  ADDRESSES: {
    DEV: 'addr1q9knw3lmvlpsvemjpgmkqkwtkzv8wueggf9aavvzyt2akpw7nsavexls6g59x007aucn2etqp2q4rd0929z2ukcn78fslm56p9',
  },
  KEYS: {
    // MNEMONIC: Array.isArray(process.env.MNEMONIC) ? process.env.MNEMONIC : process.env.MNEMONIC?.split(',') || [],
  },
};

export const POLICY_IDS = {
  ADA_HANDLE: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
  BAD_KEY: '80e3ccc66f4dfeff6bc7d906eb166a984a1fc6d314e33721ad6add14',
};

export const LS_KEYS = {
  WALLET_PROVIDER: 'WALLET_PROVIDER',
};
export const ERROR_TYPES = {
  INVALID_WALLET_IDENTIFIER: 'INVALID_WALLET_IDENTIFIER',
};

export const TIME_LABELS = {
  MINUTES: 'Minutes',
  HOURS: 'Hours',
  DAYS: 'Days',
  WEEKS: 'Weeks',
  MONTHS: 'Months',
};

export const MEDIA_TYPES: Record<MediaType, MediaType> = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
};

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
};
