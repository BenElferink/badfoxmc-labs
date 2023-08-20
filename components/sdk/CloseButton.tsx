import { XMarkIcon } from '@heroicons/react/24/solid'

const CloseButton = () => {
  return (
    <button
      onClick={() => window.parent?.postMessage('close-bad-labs-sdk', '*')}
      className='w-6 h-6 p-0.5 rounded-full bg-zinc-400 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center absolute top-4 right-4'
    >
      <XMarkIcon />
    </button>
  )
}

export default CloseButton
