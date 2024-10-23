import { useState } from 'react';
import { read, utils } from 'xlsx';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import formatTokenAmount from '@/functions/formatters/formatTokenAmount';
import Loader from '@/components/Loader';
import ProgressBar from '@/components/ProgressBar';
import JourneyStepWrapper from './JourneyStepWrapper';
import type { PayoutHolder, AirdropSettings } from '@/@types';

const AirdropCustomList = (props: {
  payoutHolders: PayoutHolder[]
  settings: AirdropSettings
  callback: (payload: PayoutHolder[]) => void
  next?: () => void
  back?: () => void
}) => {
  const { payoutHolders, settings, callback, next, back } = props;
  const { user } = useAuth();

  const [ended, setEnded] = useState(!!payoutHolders.length);
  const [progress, setProgress] = useState({
    msg: !!payoutHolders.length ? 'File Processed' : '',
    loading: false,
    row: {
      current: 0,
      max: 0,
    },
  });

  const loadFile = async (buffer: ArrayBuffer) => {
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Processing File' }));

    const wb = read(buffer, { type: 'buffer' });
    const rows: Record<string, any>[] = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const payload: PayoutHolder[] = [];
    let totalAmountOnChain = 0;

    for (const rowObj of rows) {
      const payoutWallet: Record<string, any> = {};
      const goodKeyCount = 2;
      let keyCount = 0;

      for await (const [objKey, keyVal] of Object.entries(rowObj)) {
        const key = objKey.trim().toLowerCase();

        if (['wallet', 'amount'].includes(key)) {
          if (key === 'amount') {
            const v = Number(keyVal);
            if (isNaN(v)) {
              setProgress((prev) => ({
                ...prev,
                loading: false,
                msg: `Bad file! Detected invalid value(s) for "amount" field.\n\nValue was: ${keyVal}`,
              }));
              return;
            }

            const amountOnChain = formatTokenAmount.toChain(v, settings.tokenAmount.decimals);
            payoutWallet['payout'] = amountOnChain;
            keyCount++;
            totalAmountOnChain += amountOnChain;
          }

          if (key === 'wallet') {
            try {
              const { stakeKey, addresses } = await api.wallet.getData(keyVal);

              if (addresses[0].address.indexOf('addr1') !== 0) {
                setProgress((prev) => ({
                  ...prev,
                  loading: false,
                  msg: `Bad file! Address is not on Cardano.\n\nValue was: ${addresses[0].address}`,
                }));
                return;
              } else if (addresses[0].isScript) {
                setProgress((prev) => ({
                  ...prev,
                  loading: false,
                  msg: `Bad file! Address is a Script or Contract.\n\nValue was: ${addresses[0].address}`,
                }));
                return;
              } else if (!stakeKey) {
                setProgress((prev) => ({
                  ...prev,
                  loading: false,
                  msg: `Bad file! Address has no registered Stake Key.\n\nValue was: ${addresses[0].address}`,
                }));
                return;
              } else {
                payoutWallet['address'] = addresses[0].address;
                payoutWallet['stakeKey'] = stakeKey;
                payoutWallet['txHash'] = '';
                keyCount++;
              }
            } catch (error: any) {
              console.error(error);
              const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR';

              setProgress((prev) => ({
                ...prev,
                loading: false,
                msg: errMsg,
              }));
              return;
            }
          }
        }
      }

      if (keyCount < goodKeyCount) {
        setProgress((prev) => ({
          ...prev,
          loading: false,
          msg: 'Bad file! Detected row(s) with missing value(s).',
        }));
        return;
      }

      payload.push(payoutWallet as PayoutHolder);

      setProgress((prev) => ({
        ...prev,
        row: { ...prev.row, current: prev.row.current + 1, max: rows.length },
      }));
    }

    const userOwnedOnChain =
      settings.tokenId === 'lovelace'
        ? Number(user?.lovelaces || '0')
        : user?.tokens.find((t) => t.tokenId === settings.tokenId)?.tokenAmount.onChain || 0;

    if (totalAmountOnChain > userOwnedOnChain) {
      setProgress((prev) => ({
        ...prev,
        loading: false,
        msg: `Woopsies! The total amount on-file (${formatTokenAmount.fromChain(
          totalAmountOnChain,
          settings.tokenAmount.decimals
        )}), is greater than the amount you own (${formatTokenAmount.fromChain(userOwnedOnChain, settings.tokenAmount.decimals)}).`,
      }));
      return;
    }

    callback(payload.sort((a, b) => b.payout - a.payout));

    if (payload.length) {
      setProgress((prev) => ({ ...prev, loading: false, msg: 'File Processed' }));
      setEnded(true);
    } else {
      setProgress((prev) => ({ ...prev, loading: false, msg: '' }));
      setEnded(false);
    }
  };

  return (
    <JourneyStepWrapper
      disableNext={progress.loading || !ended}
      disableBack={progress.loading || ended}
      next={next}
      back={back}
      buttons={[
        {
          label: 'Select File',
          disabled: progress.loading || ended,
          onClick: () => {},
          type: 'file',
          acceptFile: '.xlsx',
          callbackFile: async (file) => loadFile(await file.arrayBuffer()),
        },
      ]}
    >
      <h6 className='text-xl text-center'>Load an Excel Spreadsheet</h6>
      <p className='my-6 text-xs text-center'>Table columns must be as following:</p>

      <table className='my-2 mx-auto'>
        <thead>
          <tr>
            <th className='pb-1 px-4 text-start text-sm font-normal border-r border-b border-zinc-600'>Amount</th>
            <th className='pb-1 px-4 text-start text-sm font-normal border-l border-b border-zinc-600'>Wallet</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='pt-1 px-4 text-start text-xs text-zinc-400 border-r border-t border-zinc-600'>11.5</td>
            <td className='pt-1 px-4 text-start text-xs text-zinc-400 border-l border-t border-zinc-600'>addr1 / stake1 / $handle</td>
          </tr>
          <tr>
            <td className='px-4 text-start text-zinc-400 text-xs border-r border-zinc-600'>69</td>
            <td className='px-4 text-start text-zinc-400 text-xs border-l border-zinc-600'>addr1 / stake1 / $handle</td>
          </tr>
          <tr>
            <td className='px-4 text-start text-zinc-400 text-xs border-r border-zinc-600'>420</td>
            <td className='px-4 text-start text-zinc-400 text-xs border-l border-zinc-600'>addr1 / stake1 / $handle</td>
          </tr>
        </tbody>
      </table>

      {!ended && progress.row.max ? <ProgressBar label='Table Rows' max={progress.row.max} current={progress.row.current} /> : null}

      {progress.loading ? (
        <Loader withLabel label={progress.msg} />
      ) : (
        <div className='flex flex-col items-center justify-center'>
          {ended ? <CheckBadgeIcon className='w-24 h-24 text-green-400' /> : null}
          <span>{progress.msg}</span>
        </div>
      )}
    </JourneyStepWrapper>
  );
};

export default AirdropCustomList;
