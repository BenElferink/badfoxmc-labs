import axios from 'axios'
import type { BadApiMarket, BadApiPolicy, BadApiPool, BadApiPopulatedToken, BadApiTokenOwners, BadApiTransaction, BadApiWallet } from '@/@types'

export class BadApi {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://api.badfoxmc.com/api'
  }

  private getQueryStringFromQueryOptions = (options: Record<string, any> = {}): string => {
    const query = Object.entries(options)
      .filter(([key, val]) => key && val)
      .map(([key, cal]) => `&${key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)}=${cal}`)
      .join('')

    return query ? `?${query.slice(1)}` : ''
  }

  private handleError = async (error: any, reject: (reason: string) => void, retry: () => Promise<any>): Promise<any> => {
    console.error(error)

    if ([400, 404, 500, 504].includes(error?.response?.status)) {
      return reject(error?.response?.data || error?.message || 'UNKNOWN ERROR')
    } else {
      return await retry()
    }
  }

  wallet = {
    getData: (
      walletId: string,
      queryOptions?: {
        withStakePool?: boolean
        withTokens?: boolean
      }
    ): Promise<BadApiWallet> => {
      const uri = `${this.baseUrl}/wallet/${walletId}` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching wallet:', walletId)

          const { data } = await axios.get<BadApiWallet>(uri)

          console.log('Fetched wallet:', data.stakeKey)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.wallet.getData(walletId, queryOptions))
        }
      })
    },
  }

  policy = {
    getData: (
      policyId: string,
      queryOptions?: {
        allTokens?: boolean
        withBurned?: boolean
        withRanks?: boolean
      }
    ): Promise<BadApiPolicy> => {
      const uri = `${this.baseUrl}/policy/${policyId}` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching policy tokens:', policyId)

          const { data } = await axios.get<BadApiPolicy>(uri)

          console.log('Fetched policy tokens:', data.tokens.length)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.policy.getData(policyId, queryOptions))
        }
      })
    },

    market: {
      getData: (policyId: string): Promise<BadApiMarket> => {
        const uri = `${this.baseUrl}/policy/${policyId}/market`

        return new Promise(async (resolve, reject) => {
          try {
            console.log('Fetching policy market data:', policyId)

            const { data } = await axios.get<BadApiMarket>(uri)

            console.log('Fetched policy market data:', data.items.length)

            return resolve(data)
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.policy.market.getData(policyId))
          }
        })
      },
      getActivity: (policyId: string): Promise<BadApiMarket> => {
        const uri = `${this.baseUrl}/policy/${policyId}/market/activity`

        return new Promise(async (resolve, reject) => {
          try {
            console.log('Fetching policy market activity:', policyId)

            const { data } = await axios.get<BadApiMarket>(uri)

            console.log('Fetched policy market activity:', data.items.length)

            return resolve(data)
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.policy.market.getActivity(policyId))
          }
        })
      },
    },
  }

  token = {
    getData: (
      tokenId: string,
      queryOptions?: {
        populateMintTx?: boolean
      }
    ): Promise<BadApiPopulatedToken> => {
      const uri = `${this.baseUrl}/token/${tokenId}` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching token:', tokenId)

          const { data } = await axios.get<BadApiPopulatedToken>(uri)

          console.log('Fetched token:', data.fingerprint)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.token.getData(tokenId))
        }
      })
    },
    getOwners: (
      tokenId: string,
      queryOptions?: {
        page?: number
      }
    ): Promise<BadApiTokenOwners> => {
      const uri = `${this.baseUrl}/token/${tokenId}/owners` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching token owners:', tokenId)

          const { data } = await axios.get<BadApiTokenOwners>(uri)

          console.log('Fetched token owners:', data.owners.length)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.token.getOwners(tokenId, queryOptions))
        }
      })
    },

    market: {
      getData: (tokenId: string): Promise<BadApiMarket> => {
        const uri = `${this.baseUrl}/token/${tokenId}/market`

        return new Promise(async (resolve, reject) => {
          try {
            console.log('Fetching token market data:', tokenId)

            const { data } = await axios.get<BadApiMarket>(uri)

            console.log('Fetched token market data:', data.items.length)

            return resolve(data)
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.token.market.getData(tokenId))
          }
        })
      },
      getActivity: (tokenId: string): Promise<BadApiMarket> => {
        const uri = `${this.baseUrl}/token/${tokenId}/market/activity`

        return new Promise(async (resolve, reject) => {
          try {
            console.log('Fetching token market activity:', tokenId)

            const { data } = await axios.get<BadApiMarket>(uri)

            console.log('Fetched token market activity:', data.items.length)

            return resolve(data)
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.token.market.getActivity(tokenId))
          }
        })
      },
    },
  }

  stakePool = {
    getData: (
      poolId: string,
      queryOptions?: {
        withDelegators?: boolean
      }
    ): Promise<BadApiPool> => {
      const uri = `${this.baseUrl}/pool/${poolId}` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching stake pool:', poolId)

          const { data } = await axios.get<BadApiPool>(uri)

          console.log('Fetched stake pool:', data.ticker)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.stakePool.getData(poolId, queryOptions))
        }
      })
    },
  }

  transaction = {
    getData: (
      transactionId: string,
      queryOptions?: {
        withUtxos?: boolean
      }
    ): Promise<BadApiTransaction> => {
      const uri = `${this.baseUrl}/transaction/${transactionId}` + this.getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          console.log('Fetching transaction:', transactionId)

          const { data } = await axios.get<BadApiTransaction>(uri)

          console.log('Fetched transaction:', data.block)

          return resolve(data)
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.transaction.getData(transactionId))
        }
      })
    },
  }
}

export const badApi = new BadApi()
