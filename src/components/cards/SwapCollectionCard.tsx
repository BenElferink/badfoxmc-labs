import { CreditCardIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import MediaViewer from '../MediaViewer'
import type { PolicyId } from '@/@types'
import { ADA_SYMBOL } from '@/constants'

const SwapCollectionCard = (props: {
  id: PolicyId
  onClick?: (id: PolicyId) => void
  name: string
  thumb: string
  floor: number
  tokenCount: number
  userHoldsThisPolicy: boolean
}) => {
  const { id, onClick, name, thumb, floor, tokenCount, userHoldsThisPolicy } = props
  const { user } = useAuth()

  return (
    <div
      onClick={() => (onClick ? onClick(id) : null)}
      className='group w-fit m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
    >
      <div className='w-[calc(220px+2rem)] sm:w-[calc(300px+2rem)] p-4 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex flex-col items-center justify-evenly text-center'>
        <p className='truncate'>
          {tokenCount.toLocaleString()}&times;&nbsp;
          <span className='text-zinc-400'>{name}</span>
        </p>

        <p className={'mb-4 text-xs ' + (userHoldsThisPolicy ? 'text-green-400' : 'text-red-400')}>
          {!user?.stakeKey ? "You're not connected" : userHoldsThisPolicy ? 'You hold this policy' : "You don't hold this policy"}
        </p>

        <MediaViewer mediaType='IMAGE' src={thumb} size='w-[220px] h-[220px] sm:w-[300px] sm:h-[300px]' />

        <div className='mt-4 flex items-center text-sm'>
          <CreditCardIcon className='w-6 h-6 mr-1 text-amber-400' />
          Floor: {ADA_SYMBOL}
          {floor.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default SwapCollectionCard
