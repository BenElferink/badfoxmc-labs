import { useMemo, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

const DropDown = (props: {
  items: {
    value: any
    label: string
  }[]
  value: any
  changeValue: (_val: any) => void
}) => {
  const { items, value, changeValue } = props
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => items.find((item) => item.value === value), [items, value])

  return (
    <div className='m-1 relative'>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        className='w-full p-4 flex items-center justify-center text-center placeholder:text-zinc-400 hover:placeholder:text-white rounded-lg bg-zinc-700 hover:bg-zinc-600'
      >
        <span>{selected?.label || 'Select'}</span>
        {open ? <ChevronUpIcon className='w-4 h-4 ml-1' /> : <ChevronDownIcon className='w-4 h-4 ml-1' />}
      </button>

      <div className={(open ? 'flex' : 'hidden') + ' flex-col max-h-60 mt-2 overflow-y-auto absolute top-[100%] w-full rounded-lg bg-zinc-700'}>
        {items.map((item) => (
          <button
            key={`select-${item.value.toString()}`}
            type='button'
            onClick={() => {
              changeValue(item.value)
              setOpen(false)
            }}
            className={
              'w-full p-2 flex items-center justify-center text-center rounded-lg hover:bg-zinc-600 ' +
              (selected?.value === item.value ? 'text-white underline' : 'text-zinc-400 hover:text-white')
            }
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DropDown
