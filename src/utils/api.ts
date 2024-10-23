import axios from 'axios';
import type {
  ApiMarket,
  ApiPolicy,
  ApiPolicyMarketDetails,
  ApiPool,
  ApiPoolDelegators,
  ApiPopulatedToken,
  ApiTokenOwners,
  ApiTransaction,
  ApiWallet,
} from '@/@types';
import type { EpochResponse } from '@/pages/api/cardano/epoch';

class Api {
  baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/cardano' : 'https://labs.badfoxmc.com/api/cardano';
  }

  private getQueryStringFromQueryOptions = (options: Record<string, any> = {}): string => {
    const query = Object.entries(options)
      .filter(([key, val]) => key && val)
      .map(([key, cal]) => `&${key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)}=${cal}`)
      .join('');

    return query ? `?${query.slice(1)}` : '';
  };

  private handleError = async (error: any, reject: (reason: string) => void, retry: () => Promise<any>): Promise<any> => {
    console.error(error);

    if ([400, 404, 500, 504].includes(error?.response?.status)) {
      return reject(error?.response?.data || error?.message || 'UNKNOWN ERROR');
    } else {
      return await retry();
    }
  };

  epoch = {
    getData: (): Promise<EpochResponse> => {
      const uri = `${this.baseUrl}/epoch`;

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<EpochResponse>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.epoch.getData());
        }
      });
    },
  };

  wallet = {
    getData: (
      walletId: string,
      queryOptions?: {
        withStakePool?: boolean
        withTokens?: boolean
        populateTokens?: boolean
      }
    ): Promise<ApiWallet> => {
      const uri = `${this.baseUrl}/wallet/${walletId}` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiWallet>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.wallet.getData(walletId, queryOptions));
        }
      });
    },
  };

  policy = {
    getData: (
      policyId: string,
      queryOptions?: {
        allTokens?: boolean
        withBurned?: boolean
        withRanks?: boolean
      }
    ): Promise<ApiPolicy> => {
      const uri = `${this.baseUrl}/policy/${policyId}` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiPolicy>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.policy.getData(policyId, queryOptions));
        }
      });
    },

    market: {
      getData: (policyId: string): Promise<ApiMarket> => {
        const uri = `${this.baseUrl}/policy/${policyId}/market`;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.get<ApiMarket>(uri);

            return resolve(data);
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.policy.market.getData(policyId));
          }
        });
      },
      getActivity: (policyId: string): Promise<ApiMarket> => {
        const uri = `${this.baseUrl}/policy/${policyId}/market/activity`;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.get<ApiMarket>(uri);

            return resolve(data);
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.policy.market.getActivity(policyId));
          }
        });
      },
      getDetails: (policyId: string): Promise<ApiPolicyMarketDetails> => {
        const uri = `${this.baseUrl}/policy/${policyId}/market/details`;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.get<ApiPolicyMarketDetails>(uri);

            return resolve(data);
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.policy.market.getActivity(policyId));
          }
        });
      },
    },
  };

  token = {
    getData: (
      tokenId: string,
      queryOptions?: {
        populateMintTx?: boolean
      }
    ): Promise<ApiPopulatedToken> => {
      const uri = `${this.baseUrl}/token/${tokenId}` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiPopulatedToken>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.token.getData(tokenId, queryOptions));
        }
      });
    },
    getOwners: (
      tokenId: string,
      queryOptions?: {
        page?: number
      }
    ): Promise<ApiTokenOwners> => {
      const uri = `${this.baseUrl}/token/${tokenId}/owners` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiTokenOwners>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.token.getOwners(tokenId, queryOptions));
        }
      });
    },

    market: {
      getData: (tokenId: string): Promise<ApiMarket> => {
        const uri = `${this.baseUrl}/token/${tokenId}/market`;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.get<ApiMarket>(uri);

            return resolve(data);
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.token.market.getData(tokenId));
          }
        });
      },
      getActivity: (tokenId: string): Promise<ApiMarket> => {
        const uri = `${this.baseUrl}/token/${tokenId}/market/activity`;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.get<ApiMarket>(uri);

            return resolve(data);
          } catch (error: any) {
            return await this.handleError(error, reject, async () => await this.token.market.getActivity(tokenId));
          }
        });
      },
    },
  };

  stakePool = {
    getData: (poolId: string): Promise<ApiPool> => {
      const uri = `${this.baseUrl}/pool/${poolId}`;

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiPool>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.stakePool.getData(poolId));
        }
      });
    },
    getDelegators: (
      poolId: string,
      queryOptions?: {
        page?: number
      }
    ): Promise<ApiPoolDelegators> => {
      const uri = `${this.baseUrl}/pool/${poolId}/delegators` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiPoolDelegators>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.stakePool.getDelegators(poolId, queryOptions));
        }
      });
    },
  };

  transaction = {
    getData: (
      transactionId: string,
      queryOptions?: {
        withUtxos?: boolean
      }
    ): Promise<ApiTransaction> => {
      const uri = `${this.baseUrl}/transaction/${transactionId}` + this.getQueryStringFromQueryOptions(queryOptions);

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<ApiTransaction>(uri);

          return resolve(data);
        } catch (error: any) {
          return await this.handleError(error, reject, async () => await this.transaction.getData(transactionId));
        }
      });
    },
  };
}

const api = new Api();

export default api;
