import blockfrost from '@/utils/blockfrost';
import type { NextApiRequest, NextApiResponse } from 'next';
import XLSX from 'xlsx';

const filePath = './Snapshot_10_14_2024.xlsx';
const tokenId = '017af5d958fffdf65f3e5b8b3ff5abefd210a03464a9fc48ea0f4a390014df10574c4b';
const txHashes = ['fc5ce7224e608c0de030bbbda75963ac88ba765a0bb202e086d5fd619c8dd70d'];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const snapshot = XLSX.readFile(filePath);
        const snapshotSheet = snapshot.Sheets[snapshot.SheetNames[0]];

        let rows = XLSX.utils.sheet_to_json(snapshotSheet) as {
          amount: number
          tokenName: string
          address: string
          stakeKey: string
        }[];

        for await (const txHash of txHashes) {
          const { inputs, outputs } = await blockfrost.txsUtxos(txHash);

          outputs.forEach(({ address, amount }) => {
            amount.forEach(({ unit, quantity }) => {
              if (unit === tokenId) rows = rows.filter((r) => r.address !== address);
            });
          });
        }

        const customListSheet = XLSX.utils.json_to_sheet(
          rows.map(({ address, amount }) => ({ amount, wallet: address })),
          { header: ['amount', 'wallet'] }
        );

        customListSheet['!cols'] = [{ width: 20 }, { width: 100 }];

        const workBook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workBook, customListSheet, 'list');
        XLSX.writeFileXLSX(workBook, `./Custom_List.xlsx`);

        return res.status(204).end();
      }

      default: {
        res.setHeader('Allow', 'GET');
        return res.status(405).end();
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
