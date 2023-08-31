import { PropsWithChildren } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid'
import Button from '@/components/form/Button'

const JourneyStepWrapper = (
  props: PropsWithChildren<{
    disableNext?: boolean
    disableBack?: boolean
    next?: () => void
    back?: () => void
    buttons?: {
      label: string
      disabled: boolean
      onClick: () => void
      type?: 'file'
      acceptFile?: string
      callbackFile?: (_buffer: File) => void
    }[]
    hoverButtons?: boolean
  }>
) => {
  const { children, disableNext, disableBack, next, back, buttons, hoverButtons } = props

  return (
    <div className='min-h-[95vh] sm:min-h-[70vh] mx-auto flex flex-col items-center justify-between'>
      <div className='w-full'>{children}</div>

      <div className={'w-full ' + (hoverButtons ? 'sticky bottom-0' : '')}>
        {buttons ? (
          <div className='w-full flex items-center justify-between'>
            {buttons.map(({ label, disabled, onClick, type, acceptFile, callbackFile }, idx) =>
              type === 'file' ? (
                <button
                  key={`btn-${label}-${idx}`}
                  type='button'
                  onClick={() => {}}
                  disabled={disabled}
                  className='relative w-full m-1 p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
                >
                  <input
                    type='file'
                    accept={acceptFile || '*'}
                    multiple={false}
                    disabled={disabled}
                    onChange={(e) => {
                      // @ts-ignore
                      const file = (e.target.files as FileList)[0]
                      if (callbackFile) callbackFile(file)
                    }}
                    className='absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
                  />
                  <ArrowUpTrayIcon className='w-6 h-6 mr-2' />
                  {label}
                </button>
              ) : (
                <Button key={`btn-${label}-${idx}`} label={label} disabled={disabled} onClick={onClick} />
              )
            )}
          </div>
        ) : null}

        <div className='w-full flex items-center justify-between'>
          {back ? <Button label='Back' disabled={disableBack} onClick={back} /> : null}
          {next ? <Button label='Next' disabled={disableNext} onClick={next} /> : null}
        </div>
      </div>
    </div>
  )
}

export default JourneyStepWrapper
