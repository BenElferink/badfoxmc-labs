const ProgressBar = (props: { max: number; current: number; label?: string }) => {
  const { max = 100, current = 0, label = '' } = props

  const percent = (100 / max) * current
  const isFull = current === max

  return (
    <div
      className={
        'w-full h-fit my-2 bg-transparent rounded-full border ' + (isFull ? 'border-green-600' : 'border-blue-600')
      }
    >
      <div
        className={'py-0.5 px-2 rounded-full ' + (isFull ? 'bg-green-600/50' : 'bg-blue-600/50')}
        style={{ width: `${percent}%` }}
      >
        <span className={'whitespace-nowrap text-xs ' + (isFull ? 'text-green-200' : 'text-blue-200')}>
          {current}&nbsp;/&nbsp;{max}&nbsp;&nbsp;&nbsp;{label}
        </span>
      </div>
    </div>
  )
}

export default ProgressBar
