import api from '@/utils/api';
import type { ApiTransaction } from '@/@types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(() => resolve(true), ms));

const txConfirmation = async (_txHash: string): Promise<ApiTransaction> => {
  try {
    const data = await api.transaction.getData(_txHash);

    if (data.block) {
      return data;
    } else {
      await sleep(1000);
      return await txConfirmation(_txHash);
    }
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR';

    if (errMsg === `The requested component has not been found. ${_txHash}`) {
      await sleep(1000);
      return await txConfirmation(_txHash);
    } else {
      throw new Error(errMsg);
    }
  }
};

export default txConfirmation;
