import { useRef } from 'react'

const TextArea: (props: {
  value?: string
  setValue?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  error?: boolean
}) => JSX.Element = (props) => {
  const { value, setValue, placeholder, disabled, readOnly, error } = props
  const ref = useRef<HTMLTextAreaElement>(null)

  return (
    <div className='w-[calc(100%-0.5rem)] m-1'>
      <textarea
        ref={ref}
        value={value ?? ''}
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
        className={
          'w-full p-4 flex items-center text-center placeholder:text-zinc-400 hover:placeholder:text-white focus:placeholder:text-white disabled:placeholder:text-zinc-600 disabled:text-zinc-600 rounded-lg border bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none disabled:cursor-not-allowed ' +
          (error
            ? 'border-red-400 hover:border-red-400 focus:border-red-400 disabled:border-transparent'
            : 'border-transparent hover:border-zinc-400 focus:border-zinc-400 disabled:border-transparent')
        }
      />
    </div>
  )
}

export default TextArea
