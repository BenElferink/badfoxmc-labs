import { useRef } from 'react'

const TextArea: (props: {
  value?: string
  setValue?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}) => JSX.Element = (props) => {
  const { value, setValue, placeholder, disabled, readOnly } = props
  const ref = useRef<HTMLTextAreaElement>(null)

  return (
    <textarea
      ref={ref}
      value={value || ''}
      onChange={(e) => {
        if (!!setValue) {
          setValue(e.target.value)
        }

        if (ref.current) {
          // The following auto-resizes the textarea to the number of rows typed
          ref.current.style.height = 'auto'
          ref.current.style.height = `${ref.current.scrollHeight}px`
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className='w-[calc(100%-0.5rem)] m-1 p-4 flex items-center text-center placeholder:text-zinc-400 hover:placeholder:text-white focus:placeholder:text-white rounded-lg border border-transparent hover:border-white focus:border-white bg-zinc-700/70 hover:bg-zinc-600/70 focus:bg-zinc-600/70 outline-none read-only:cursor-not-allowed'
    />
  )
}

export default TextArea
