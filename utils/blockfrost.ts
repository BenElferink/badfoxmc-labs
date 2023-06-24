import { API_KEYS } from '@/constants'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'

const blockfrost = new BlockFrostAPI({
  projectId: API_KEYS['BLOCKFROST_API_KEY'],
  network: 'mainnet',
})

export default blockfrost
