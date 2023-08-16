import { ArrowUpTrayIcon } from '@heroicons/react/24/solid'
import { PropsWithChildren } from 'react'

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
                  className={
                    (idx === 0 && buttons.length > 1
                      ? 'mr-1'
                      : idx === buttons.length - 1 && buttons.length > 1
                      ? 'ml-1'
                      : buttons.length > 1
                      ? 'mx-1'
                      : '') +
                    ' relative w-full my-1 p-4 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
                  }
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
                <button
                  key={`btn-${label}-${idx}`}
                  type='button'
                  onClick={onClick}
                  disabled={disabled}
                  className={
                    (idx === 0 && buttons.length > 1
                      ? 'mr-1'
                      : idx === buttons.length - 1 && buttons.length > 1
                      ? 'ml-1'
                      : buttons.length > 1
                      ? 'mx-1'
                      : '') +
                    ' w-full my-1 p-4 rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        ) : null}

        <div className='w-full flex items-center justify-between'>
          {back ? (
            <button
              onClick={back}
              disabled={disableBack}
              className={
                (!!next ? 'mr-1' : '') +
                ' w-full my-1 p-4 rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
              }
            >
              Back
            </button>
          ) : null}

          {next ? (
            <button
              onClick={next}
              disabled={disableNext}
              className={
                (!!back ? 'ml-1' : '') +
                ' w-full my-1 p-4 rounded-lg bg-zinc-600 hover:bg-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
              }
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default JourneyStepWrapper
