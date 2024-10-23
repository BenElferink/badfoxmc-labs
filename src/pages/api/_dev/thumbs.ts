import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/utils/firebase';
import type { Airdrop } from '@/@types';
import populateToken from '@/functions/populateToken';

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const airdropCollection = firestore.collection('airdrops');
        const airdropDocs = await airdropCollection.get();

        const airdropBatch = firestore.batch();

        for await (const doc of airdropDocs.docs) {
          const data = doc.data() as Airdrop;

          // if (data.thumb.indexOf('https://') === 0) {
          //   const split = data.thumb.split('/')
          //   data.thumb = split[split.length - 1].split('?')[0]
          // }

          if (data.thumb === 'ada.png') {
            data.thumb = 'https://labs.badfoxmc.com/media/ada.png';
          }

          if (
            data.thumb.indexOf('https://') === -1 &&
            data.thumb.indexOf('ipfs://') === -1 &&
            data.thumb.indexOf('data:') === -1 &&
            data.thumb !== 'ada.png' &&
            data.thumb !== 'https://labs.badfoxmc.com/media/ada.png'
          ) {
            const { image } = await populateToken(data.tokenId);
            data.thumb = image.ipfs;
          }

          airdropBatch.update(airdropCollection.doc(doc.id), data);
        }

        await airdropBatch.commit();

        const giveawayCollection = firestore.collection('giveaways');
        const giveawayDocs = await giveawayCollection.get();

        const giveawayBatch = firestore.batch();

        for await (const doc of giveawayDocs.docs) {
          const data = doc.data(); // as Giveaway

          // if (data.thumb.indexOf('https://') === 0) {
          //   const split = data.thumb.split('/')
          //   data.thumb = split[split.length - 1].split('?')[0]
          // }

          if (data.thumb === 'ada.png') {
            data.thumb = 'https://labs.badfoxmc.com/media/ada.png';
          }

          // if (!data.isToken) {
          //   const split = data.thumb.split('labs%2F')
          //   const fileId = split[split.length - 1].split('?')[0]
          //   const fileUrl = await storage.ref(`/labs/${fileId}`).getDownloadURL()
          //   data.thumb = fileUrl
          // }

          if (
            data.thumb.indexOf('https://') === -1 &&
            data.thumb.indexOf('ipfs://') === -1 &&
            data.thumb.indexOf('data:') === -1 &&
            data.thumb !== 'ada.png' &&
            data.thumb !== 'https://labs.badfoxmc.com/media/ada.png'
          ) {
            const { image } = await populateToken(data.tokenId);
            data.thumb = image.ipfs;
          }

          giveawayBatch.update(giveawayCollection.doc(doc.id), data);
        }

        await giveawayBatch.commit();

        const swapCollection = firestore.collection('swaps');
        const swapDocs = await swapCollection.get();

        const swapBatch = firestore.batch();

        for await (const doc of swapDocs.docs) {
          const data = doc.data(); // as Swap

          // if (data.withdraw.thumb.indexOf('https://') === 0) {
          //   const split = data.withdraw.thumb.split('/')
          //   data.withdraw.thumb = split[split.length - 1].split('?')[0]
          // }

          if (
            data.withdraw.thumb.indexOf('https://') === -1 &&
            data.withdraw.thumb.indexOf('ipfs://') === -1 &&
            data.withdraw.thumb.indexOf('data:') === -1 &&
            data.withdraw.thumb !== 'ada.png' &&
            data.withdraw.thumb !== 'https://labs.badfoxmc.com/media/ada.png'
          ) {
            const { image } = await populateToken(data.withdraw.tokenId);
            data.withdraw.thumb = image.ipfs;
          }

          // if (data.deposit.thumb.indexOf('https://') === 0) {
          //   const split = data.deposit.thumb.split('/')
          //   data.deposit.thumb = split[split.length - 1].split('?')[0]
          // }

          if (
            data.deposit.thumb.indexOf('https://') === -1 &&
            data.deposit.thumb.indexOf('ipfs://') === -1 &&
            data.deposit.thumb.indexOf('data:') === -1 &&
            data.deposit.thumb !== 'ada.png' &&
            data.deposit.thumb !== 'https://labs.badfoxmc.com/media/ada.png'
          ) {
            const { image } = await populateToken(data.deposit.tokenId);
            data.deposit.thumb = image.ipfs;
          }

          swapBatch.update(swapCollection.doc(doc.id), data);
        }

        await swapBatch.commit();

        return res.status(200).json({});
      }

      default: {
        res.setHeader('Allow', 'POST');
        return res.status(405).end();
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
