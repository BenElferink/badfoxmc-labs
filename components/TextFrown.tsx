import { FaceFrownIcon } from '@heroicons/react/24/solid'

const TextFrown = (props: { text: string; className?: string }) => {
  const { text, className } = props

  return (
    <p className={'text-center ' + (className ? className : '')}>
      {text} <FaceFrownIcon className='inline w-8 h-8' />
    </p>
  )
}

export default TextFrown
