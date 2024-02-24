import JourneyStepWrapper from './JourneyStepWrapper'
import { WALLET_ADDRESSES } from '@/constants'

const DonateManual = (props: { next?: () => void; back?: () => void }) => {
  const { next, back } = props

  return (
    <JourneyStepWrapper back={back} next={next}>
      <h6 className='mb-12 text-xl text-center'>Manual TX</h6>

      <div className='text-center'>
        <p>Please send the NFTs to the following address:</p>

        <div className='my-2 p-2 px-4 text-sm break-all text-yellow-100 rounded-lg border border-yellow-700 bg-yellow-800/50'>
          {WALLET_ADDRESSES['SWAP_APP']}
        </div>

        <p className='text-sm'>
          <u>Note:</u> Fungible Tokens are not supported!
        </p>
      </div>
    </JourneyStepWrapper>
  )
}

export default DonateManual
