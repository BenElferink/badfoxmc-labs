import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import formatTokenAmount from '@/functions/formatters/formatTokenAmount'
import MediaViewer from './MediaViewer'
import TextFrown from './TextFrown'
import Loader from './Loader'
import Input from './form/Input'
import type { ApiPopulatedToken, TokenId } from '@/@types'
import { DECIMALS, POPULATED_LOVELACE } from '@/constants'

export type TokenExplorerCollections = {
  policyId: string
  tokens: ApiPopulatedToken[]
}[]

const TokenExplorer = (props: {
  callback: (_payload: ApiPopulatedToken) => void
  selectedTokenIds?: TokenId[]
  withAda?: boolean
  onlyFungible?: boolean
  onlyNonFungible?: boolean
  showTokenAmounts?: boolean
  forceCollections?: TokenExplorerCollections
}) => {
  const {
    callback,
    selectedTokenIds = [],
    withAda = false,
    onlyFungible = false,
    onlyNonFungible = false,
    showTokenAmounts = false,
    forceCollections,
  } = props

  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<TokenExplorerCollections>(!!forceCollections ? [...forceCollections] : [])

  const getCollections = useCallback(async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      const payload: TokenExplorerCollections = []

      if (withAda && user?.lovelaces) {
        const adaBalance = {
          ...POPULATED_LOVELACE,
          tokenAmount: {
            onChain: Number(user.lovelaces),
            display: formatTokenAmount.fromChain(user.lovelaces, DECIMALS['ADA']),
            decimals: DECIMALS['ADA'],
          },
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

      setCollections(payload.sort((a, b) => (b.policyId === 'lovelace' ? 1 : a.policyId.localeCompare(b.policyId))))
    } catch (error: any) {
      console.error(error)
      // const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, withAda])

  useEffect(() => {
    if (!forceCollections) getCollections()
  }, [forceCollections, getCollections])

  const [search, setSearch] = useState('')

  return (
    <div className='flex flex-col items-center'>
      <Input placeholder='Search:' value={search} setValue={(v) => setSearch(v)} />

      <div className='flex flex-wrap items-start justify-center text-center'>
        {!collections.filter((coll) => !!coll.tokens.length).length ? (
          loading ? (
            <Loader />
          ) : (
            <div className='mt-10'>
              <TextFrown text='You have no tokens...' />
            </div>
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
                    (!!forceCollections ? 'w-[280px]' : 'w-[160px]') +
                    'group m-2 flex flex-col items-center ' +
                    (selectedTokenIds.includes(t.tokenId) ? 'border rounded-lg' : '')
                  }
                >
                  <MediaViewer
                    mediaType='IMAGE'
                    src={t.image.url}
                    size={!!forceCollections ? 'w-[270px] h-[270px] m-[5px]' : 'w-[150px] h-[150px] m-[5px]'}
                  />

                  {showTokenAmounts ? (
                    <p
                      className={
                        'm-0 p-0 px-2 text-xs ' + (selectedTokenIds.includes(t.tokenId) ? 'text-white' : 'text-zinc-400 group-hover:text-white')
                      }
                    >
                      {t.tokenAmount.display.toLocaleString('en-US')}
                    </p>
                  ) : null}

                  <p
                    className={
                      'm-0 p-0 px-2 text-sm ' + (selectedTokenIds.includes(t.tokenId) ? 'text-white' : 'text-zinc-400 group-hover:text-white')
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
