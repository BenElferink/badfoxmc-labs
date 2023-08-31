import { TrashIcon } from '@heroicons/react/24/solid'

const TrashButton: (props: { onClick?: () => void; disabled?: boolean }) => JSX.Element = (props) => {
  const { onClick, disabled } = props

  return (
    <button
      disabled={disabled}
      onClick={() => !!onClick && onClick()}
      className='p-2 m-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200'
    >
      <TrashIcon className='w-4 h-4' />
    </button>
  )
}

export default TrashButton
