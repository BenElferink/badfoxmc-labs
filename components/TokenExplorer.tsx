import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import MediaViewer from './MediaViewer'
import TextFrown from './TextFrown'
import Loader from './Loader'
import type { BadApiPopulatedToken } from '@/@types'

type Collection = {
  policyId: string
  tokens: BadApiPopulatedToken[]
}[]

const TokenExplorer = (props: {
  callback: (_payload: BadApiPopulatedToken) => void
  selectedTokenId?: string
  showTokenAmounts?: boolean
  withAda?: boolean
  onlyFungible?: boolean
  onlyNonFungible?: boolean
}) => {
  const { callback, selectedTokenId, showTokenAmounts, withAda, onlyFungible, onlyNonFungible } = props
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection>([])

  const getCollections = useCallback(async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      const payload: Collection = []

      if (withAda) {
        const lovelaces = user.lovelaces || 0
        const lovelaceDecimals = 6

        const adaBalance = {
          tokenId: 'lovelace',
          fingerprint: 'lovelace',
          policyId: 'lovelace',
          isFungible: true,
          tokenName: {
            onChain: 'lovelace',
            ticker: 'ADA',
            display: 'ADA',
          },
          tokenAmount: {
            onChain: lovelaces,
            display: formatTokenAmount.fromChain(lovelaces, lovelaceDecimals),
            decimals: lovelaceDecimals,
          },
          image: {
            ipfs: '',
            url: 'https://labs.badfoxmc.com/media/ada.png',
          },
          files: [],
          attributes: {},
        }

        payload.push({
          policyId: adaBalance.policyId,
          tokens: [adaBalance],
        })
      }

      user.tokens?.forEach((t) => {
        const idx = payload.findIndex((item) => item.policyId === t.policyId)

        if (idx !== -1) {
          payload[idx].tokens.push(t)
        } else {
          payload.push({
            policyId: t.policyId,
            tokens: [t],
          })
        }
      })

      setCollections(
        payload.sort((a, b) => (b.policyId === 'lovelace' ? 1 : a.policyId.localeCompare(b.policyId)))
      )
    } catch (error: any) {
      console.error(error)
      // const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
    } finally {
      setLoading(false)
    }
  }, [user, withAda])

  useEffect(() => {
    if (!collections.length) getCollections()
  }, [collections, getCollections])

  const [search, setSearch] = useState('')

  return (
    <div className='flex flex-col items-center'>
      {collections.length ? (
        <input
          placeholder='Search:'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full m-2 p-4 flex items-center text-center placeholder:text-gray-400 hover:placeholder:text-white rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:bg-zinc-800 outline-none'
        />
      ) : null}

      <div className='flex flex-wrap items-start justify-center text-center'>
        {!collections.length ? (
          loading ? (
            <Loader />
          ) : (
            <TextFrown text='You have no tokens...' />
          )
        ) : (
          collections.map((coll) =>
            coll.tokens.map((t) => {
              // if (onlyFungible && (!t.isFungible || t.tokenAmount.onChain <= 1)) {
              if (onlyFungible && !t.isFungible) {
                return null
              }

              if (onlyNonFungible && t.isFungible) {
                return null
              }

              const s = search.toLowerCase()
              const thisTokenIsInSearch =
                coll.policyId.indexOf(s) !== -1 ||
                t.tokenId.indexOf(s) !== -1 ||
                t.tokenName?.ticker.toLowerCase().indexOf(s) !== -1 ||
                t.tokenName?.display.toLowerCase().indexOf(s) !== -1 ||
                t.tokenName?.onChain.toLowerCase().indexOf(s) !== -1

              if (!thisTokenIsInSearch) {
                return null
              }

              return (
                <button
                  key={`policy-${coll.policyId}-token-${t.tokenId}`}
                  type='button'
                  disabled={loading}
                  onClick={() => callback(t)}
                  className={
                    'group w-[160px] m-2 flex flex-col items-center ' +
                    (selectedTokenId === t.tokenId ? 'border rounded-lg' : '')
                  }
                >
                  <MediaViewer mediaType='IMAGE' src={t.image.url} size='w-[150px] h-[150px] m-[5px]' />

                  {showTokenAmounts ? (
                    <p
                      className={
                        'm-0 p-0 px-2 text-xs ' +
                        (selectedTokenId === t.tokenId ? 'text-white' : 'text-zinc-400 group-hover:text-white')
                      }
                    >
                      {t.tokenAmount.display.toLocaleString('en-US')}
                    </p>
                  ) : null}

                  <p
                    className={
                      'm-0 p-0 px-2 text-sm ' +
                      (selectedTokenId === t.tokenId ? 'text-white' : 'text-zinc-400 group-hover:text-white')
                    }
                  >
                    {t.tokenName?.ticker ? '$' : ''}
                    {t.tokenName?.ticker || t.tokenName?.display || t.tokenName?.onChain}
                  </p>
                </button>
              )
            })
          )
        )}
      </div>
    </div>
  )
}

export default TokenExplorer
