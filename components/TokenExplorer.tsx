import { useCallback, useEffect, useState } from 'react'
import { BadApiPopulatedToken } from '@/@types'
import { useAuth } from '@/contexts/AuthContext'
import MediaViewer from './MediaViewer'
import TextFrown from './TextFrown'

type Collection = {
  policyId: string
  tokens: BadApiPopulatedToken[]
}[]

const TokenExplorer = (props: {
  callback: (_payload: BadApiPopulatedToken) => void
  showTokenAmounts?: boolean
}) => {
  const { callback, showTokenAmounts } = props
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection>([])

  const getCollections = useCallback(async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      const payload: Collection = []

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

      setCollections(payload)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user])

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
          className='w-[220px] my-2 p-3 text-gray-200 placeholder:text-gray-200 bg-gray-700 rounded-lg border border-gray-500 hover:text-white hover:placeholder:text-white hover:bg-gray-500 hover:border-gray-300'
        />
      ) : null}

      <div className='flex flex-wrap items-start justify-center text-center'>
        {!collections.length ? (
          loading ? (
            'Loading...'
          ) : (
            <TextFrown text='You have no tokens...' />
          )
        ) : (
          collections.map((coll) =>
            coll.tokens.map((t) => {
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
                  onClick={() => callback(t)}
                  className='group w-[170px] m-1.5'
                >
                  <MediaViewer mediaType='IMAGE' src={t.image.url} size='w-[170px] h-[170px]' />

                  {showTokenAmounts ? (
                    <p className='m-0 p-0 px-2 text-xs text-zinc-400 group-hover:text-white truncate'>
                      {t.tokenAmount.display.toLocaleString('en-US')}
                    </p>
                  ) : null}

                  <p className='m-0 p-0 px-2 text-xs text-zinc-400 group-hover:text-white truncate'>
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
