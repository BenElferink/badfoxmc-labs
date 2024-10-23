import { useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const DropDown = (props: {
  label?: string
  items: {
    value: any
    label: string
  }[]
  value: any
  setValue: (_val: any) => void
  disabled?: boolean
  error?: boolean
}) => {
  const { label, items, value, setValue, disabled, error } = props;
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => items.find((item) => item.value === value), [items, value]);

  return (
    <div className='w-[calc(100%-0.5rem)] m-1 relative'>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={
          'w-full p-4 flex items-center justify-center rounded-lg border bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 outline-none disabled:cursor-not-allowed ' +
          (!!selected?.label
            ? 'text-white disabled:text-zinc-600 '
            : 'text-center text-zinc-400 hover:text-white focus:text-white disabled:text-zinc-600 ') +
          (error
            ? 'border-red-400 hover:border-red-400 focus:border-red-400 disabled:border-transparent'
            : 'border-transparent hover:border-zinc-400 focus:border-zinc-400 disabled:border-transparent')
        }
      >
        {selected?.label || label || 'Select'}
        {open ? (
          <ChevronUpIcon className={'w-5 h-5 ml-2 ' + (disabled ? '' : 'text-white')} />
        ) : (
          <ChevronDownIcon className={'w-5 h-5 ml-2 ' + (disabled ? '' : 'text-white')} />
        )}
      </button>

      <div className={(open ? 'flex' : 'hidden') + ' flex-col w-full max-h-60 mt-1 rounded-lg bg-zinc-700 overflow-y-auto absolute top-[100%]'}>
        {items.map((item) => (
          <button
            key={`select-${item.value.toString()}`}
            type='button'
            onClick={() => {
              setValue(item.value);
              setOpen(false);
            }}
            className={
              'w-full p-4 text-center rounded-lg border border-transparent hover:border-zinc-400 hover:bg-zinc-600 ' +
              (selected?.value === item.value ? 'text-white underline' : 'text-zinc-400 hover:text-white')
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DropDown;
