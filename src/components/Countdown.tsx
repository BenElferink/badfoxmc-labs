import { useTimer } from 'react-timer-hook'

const Countdown = ({ timestamp, callbackTimeExpired }: { timestamp: number; callbackTimeExpired?: () => void }) => {
  const timer = useTimer({
    expiryTimestamp: new Date(timestamp),
    onExpire: () => (callbackTimeExpired ? callbackTimeExpired() : null),
  })

  return (
    <table className='mx-auto'>
      <tbody>
        <tr className='text-xl'>
          <td>{`${timer.days < 10 ? '0' : ''}${timer.days}`}</td>
          <td>:</td>
          <td>{`${timer.hours < 10 ? '0' : ''}${timer.hours}`}</td>
          <td>:</td>
          <td>{`${timer.minutes < 10 ? '0' : ''}${timer.minutes}`}</td>
          <td>:</td>
          <td>{`${timer.seconds < 10 ? '0' : ''}${timer.seconds}`}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default Countdown
