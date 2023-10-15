import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

const Button: (props: {
  label?: string
  icon?: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined
      titleId?: string | undefined
    } & RefAttributes<SVGSVGElement>
  >
  onClick?: () => void
  disabled?: boolean
}) => JSX.Element = (props) => {
  const { label = 'Click', icon: Icon, onClick, disabled } = props

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => !!onClick && onClick()}
      className='w-[calc(100%-0.5rem)] m-1 p-4 flex items-center justify-center rounded-lg border border-transparent hover:border-zinc-400 focus:border-zinc-400 disabled:border-transparent bg-zinc-700 hover:bg-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 disabled:cursor-not-allowed'
    >
      {Icon ? <Icon className='w-8 h-8 mr-2' /> : null}
      {label}
    </button>
  )
}

export default Button
