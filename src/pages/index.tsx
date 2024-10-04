import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LoaderIcon } from 'react-hot-toast'
import api from '@/utils/api'
import poolPm from '@/utils/poolPm'
import { useData } from '@/contexts/DataContext'
import Countdown from '@/components/Countdown'
import { AIRDROP_DESCRIPTION } from './airdrops'

const ChainLoadBar = ({ label, percent }: { label: string; percent: number }) => {
  const borderColor =
    percent === 0
      ? 'border-zinc-800'
      : percent <= 25
      ? 'border-green-600'
      : percent <= 50
      ? 'border-yellow-600'
      : percent <= 75
      ? 'border-orange-600'
      : 'border-red-600'
  const bgColor =
    percent === 0
      ? 'bg-zinc-600/50'
      : percent <= 25
      ? 'bg-green-600/50'
      : percent <= 50
      ? 'bg-yellow-600/50'
      : percent <= 75
      ? 'bg-orange-600/50'
      : 'bg-red-600/50'
  const txtColor =
    percent === 0
      ? 'text-zinc-200'
      : percent <= 25
      ? 'text-green-200'
      : percent <= 50
      ? 'text-yellow-200'
      : percent <= 75
      ? 'text-orange-200'
      : 'text-red-200'

  return (
    <div className='mt-2'>
      <div className='px-1 flex justify-between'>
        <div className='text-zinc-400'>Chain load {label}</div>
      </div>

      <div className={'w-full h-fit my-1 bg-transparent rounded-full border ' + borderColor}>
        <div className={'px-2 rounded-full ' + bgColor} style={{ width: `${percent}%` }}>
          <span className={'whitespace-nowrap text-xs ' + txtColor}>{percent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

const Page = () => {
  const { airdrops, fetchAirdrops } = useData()
  const [epochInfo, setEpochInfo] = useState({ epoch: 0, percent: 0, startTime: 0, endTime: 0, nowTime: 0 })

  useEffect(() => {
    ;(async () => {
      setEpochInfo(await api.epoch.getData())
      if (!airdrops.length) await fetchAirdrops()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [chainLoad, setChainLoad] = useState({ load5m: 0, load1h: 0, load24h: 0 })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setChainLoad(await poolPm.getChainLoad())
      } catch (error) {}
    }, 10 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700'>
        <div className='w-full h-full p-8 rounded-lg bg-zinc-800'>
          <div className='px-4 flex justify-between'>
            <div className='my-2 text-2xl'>{`Epoch ${epochInfo.epoch}`}</div>
            <div className='text-sm text-center'>
              Ends in
              <br />
              {epochInfo.endTime ? <Countdown timestamp={epochInfo.endTime} /> : null}
            </div>
          </div>

          <div className='h-fit mb-4 bg-transparent rounded-full border border-blue-600'>
            <div className='py-1 px-4 rounded-full bg-blue-600/50' style={{ width: `${epochInfo.percent}%` }}>
              <span className='whitespace-nowrap text-xs text-blue-200'>{epochInfo.percent.toFixed(2)}%</span>
            </div>
          </div>

          <ChainLoadBar label='5m' percent={chainLoad.load5m} />
          <ChainLoadBar label='1h' percent={chainLoad.load1h} />
          <ChainLoadBar label='24h' percent={chainLoad.load24h} />
        </div>
      </div>

      <Link
        href='/airdrops'
        className='w-full m-1 p-0.5 rounded-lg bg-gradient-to-b from-purple-700 via-blue-700 to-green-700 hover:from-purple-500 hover:via-blue-500 hover:to-green-500 hover:cursor-pointer'
      >
        <div className='w-full h-full p-8 rounded-lg bg-zinc-800'>
          <div className='mb-4 uppercase text-xl flex items-center'>
            <div className='mr-4 h-10 px-4 text-yellow-100 rounded-lg border border-yellow-700 bg-yellow-800/50 flex items-center justify-center'>
              {!airdrops.length ? <LoaderIcon /> : airdrops.length.toLocaleString()}
            </div>
            &nbsp;Airdrops
          </div>
          <p className='text-xs'>{AIRDROP_DESCRIPTION}</p>
        </div>
      </Link>
    </div>
  )
}

export default Page
