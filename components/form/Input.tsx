const Input: (props: {
  value?: string | number
  setValue?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  error?: boolean
}) => JSX.Element = (props) => {
  const { value, setValue, placeholder, disabled, readOnly, error } = props

  return (
    <input
      value={value || ''}
      onChange={(e) => !!setValue && setValue(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={
        'w-[calc(100%-0.5rem)] m-1 p-4 flex items-center text-center placeholder:text-zinc-400 hover:placeholder:text-white focus:placeholder:text-white disabled:placeholder:text-zinc-600 disabled:text-zinc-600 rounded-lg border bg-zinc-700/70 hover:bg-zinc-600/70 focus:bg-zinc-600/70 disabled:bg-zinc-800/70 disabled:hover:bg-zinc-800/70 outline-none disabled:cursor-not-allowed ' +
        (error
          ? 'border-red-400 hover:border-red-400 focus:border-red-400 disabled:border-transparent'
          : 'border-transparent hover:border-white focus:border-white disabled:border-transparent')
      }
    />
  )
}

export default Input
