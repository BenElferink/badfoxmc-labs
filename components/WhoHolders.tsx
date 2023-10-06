import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import api from '@/utils/api'
import type { Poll } from '@/@types'

const WhoHolders = (props: {
  label?: string
  holderPolicies: Poll['holderPolicies']
  withDelegators: Poll['withDelegators']
  stakePools: Poll['stakePools']
}) => {
  const { label = 'Who can participate?', holderPolicies, withDelegators, stakePools } = props
  const [refinedHolderPolicies, setRefinedHolderPolicies] = useState(holderPolicies)

  useEffect(() => {
    ;(async () => {
      const paylaod = await Promise.all(
        holderPolicies.map(async (item) => ({
          ...item,
          name: (await api.policy.market.getDetails(item.policyId)).name,
        }))
      )

      setRefinedHolderPolicies(paylaod)
    })()
  }, [holderPolicies])

  return (
    <div className='my-2 text-xs text-start flex flex-col items-center justify-center'>
      <h6 className='w-full text-center text-lg'>{label}</h6>

      {refinedHolderPolicies.map((setting) => (
        <div key={`holderPolicies-${setting.policyId}`} className='w-full mt-2'>
          <p className='text-zinc-400'>Policy ID ({setting.weight} points)</p>

          <Link
            href={setting.hasFungibleTokens ? `https://cexplorer.io/policy/${setting.policyId}` : `https://jpg.store/collection/${setting.policyId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center text-blue-400 hover:underline'
          >
            {/* @ts-ignore */}
            {setting.name || setting.policyId}
            <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
          </Link>

          {setting.withRanks && !!setting.rankOptions?.length
            ? setting.rankOptions.map((rankSetting) => (
                <p className='text-zinc-400' key={`rankSetting-${rankSetting.minRange}-${rankSetting.maxRange}`}>
                  Ranks: {rankSetting.minRange}-{rankSetting.maxRange} ({rankSetting.amount} points)
                </p>
              ))
            : null}

          {setting.withTraits && !!setting.traitOptions?.length
            ? setting.traitOptions.map((traitSetting) => (
                <p className='text-zinc-400' key={`traitSetting-${traitSetting.category}-${traitSetting.trait}`}>
                  Attribute: {traitSetting.category} / {traitSetting.trait} ({traitSetting.amount} points)
                </p>
              ))
            : null}

          {setting.withWhales && !!setting.whaleOptions?.length
            ? setting.whaleOptions.map((whaleSetting) => (
                <p className='text-zinc-400' key={`whaleSetting-${whaleSetting.groupSize}`}>
                  Whale: {whaleSetting.groupSize}+ ({whaleSetting.amount} points{whaleSetting.shouldStack ? '' : ', not stackable'})
                </p>
              ))
            : null}
        </div>
      ))}

      {withDelegators && stakePools.length ? (
        <div className='w-full mt-2'>
          <p className='text-zinc-400'>Must be delegting to:</p>

          {stakePools.map((str) => (
            <Link
              key={`stakePools-${str}`}
              href={`https://cexplorer.io/pool/${str}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center text-blue-400 hover:underline'
            >
              {str}
              <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default WhoHolders
