'use client'
import axios from 'axios'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { badApi } from '@/utils/badApi'
import { firebase, firestore } from '@/utils/firebase'
import { useAuth } from '@/contexts/AuthContext'
import PollViewer from './PollViewer'
import Loader from './Loader'
import Button from './form/Button'
import type { BadApiRankedToken, Poll, PollOption, User } from '@/@types'
import type { FetchedTimestampResponse } from '@/pages/api/timestamp'

const PollEnter = (props: { poll: Poll; isSdk?: boolean }) => {
  const { poll, isSdk } = props
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [pollActive, setPollActive] = useState(poll.active || false)
  const [holderEligible, setHolderEligible] = useState(false)
  const [holderPoints, setHolderPoints] = useState<{
    stakeKey: string
    points: number
    withFungible: boolean
    units: string[]
  }>({
    stakeKey: '',
    points: 0,
    withFungible: false,
    units: [],
  })
  const [selectedSerial, setSelectedSerial] = useState<PollOption['serial']>(0)

  const processPoints = useCallback(
    async (u: User) => {
      const { stakeKey, poolId, tokens } = u
      const { holderPolicies, withDelegators, stakePools, withBlacklist, blacklistWallets, blacklistTokens, entries } = poll

      try {
        if (withBlacklist && blacklistWallets.includes(stakeKey)) {
          throw new Error('Your wallet is blacklisted from this giveaway')
        }

        if (withDelegators && !stakePools.includes(poolId as string)) {
          throw new Error("You aren't delegating to a required stake pool")
        }

        const eligiblePolicySettings: typeof holderPolicies = []

        for await (const { tokenId } of tokens || []) {
          const foundSetting = holderPolicies.find((s) => tokenId.indexOf(s.policyId) === 0)

          if (foundSetting && !eligiblePolicySettings.find((s) => s.policyId === foundSetting.policyId)) {
            eligiblePolicySettings.push(foundSetting)
          }
        }

        const _elibile = !!eligiblePolicySettings.length
        setHolderEligible(_elibile)

        if (!_elibile) {
          throw new Error("You don't hold any of the required Policy IDs")
        }

        setMessage('Processing your points...')

        let votePoints = 0
        const usedUnits: string[] = []
        const rankedAssets: Record<string, BadApiRankedToken[]> = {}
        const foundFungibleHolder = poll.fungibleHolders?.find((obj) => obj.stakeKey === stakeKey)

        // this is because points across all policies are counted collectively once, so we don't want the program to keep adding more points on each loop
        let countedFungiblePoints = false

        for await (const setting of eligiblePolicySettings) {
          const { policyId, hasFungibleTokens, weight, withTraits, traitOptions, withRanks, rankOptions, withWhales, whaleOptions } = setting

          if (hasFungibleTokens) {
            if (foundFungibleHolder && !foundFungibleHolder.hasEntered && !countedFungiblePoints) {
              const p = foundFungibleHolder.points
              votePoints += p
              countedFungiblePoints = true
            }
          } else {
            let basePoints = 0
            let rankPoints = 0
            let traitPoints = 0
            let whalePoints = 0

            const heldTokensOfThisPolicy = tokens?.filter((token) => token.tokenId.indexOf(policyId) === 0) || []

            for await (const { tokenId, tokenAmount, attributes } of heldTokensOfThisPolicy) {
              if (!withBlacklist || (withBlacklist && !blacklistTokens.includes(tokenId))) {
                const isUnitUsed = !!poll?.nonFungibleUsedUnits.find((str) => str === tokenId)

                if (!isUnitUsed) {
                  basePoints += tokenAmount.display * weight
                  usedUnits.push(tokenId)

                  if (withRanks) {
                    if (!rankedAssets[policyId] || !rankedAssets[policyId].length) {
                      const { tokens } = await badApi.policy.getData(policyId, { withRanks: true })
                      rankedAssets[policyId] = tokens
                    }

                    const rankedAsset = rankedAssets[policyId].find((rankedItem) => rankedItem.tokenId === tokenId)

                    if (rankedAsset && !!rankOptions?.length) {
                      rankOptions.forEach((rankSetting) => {
                        if ((rankedAsset.rarityRank || 0) >= rankSetting.minRange && (rankedAsset.rarityRank || 0) <= rankSetting.maxRange) {
                          rankPoints += rankSetting.amount
                        }
                      })
                    }
                  }

                  if (withTraits && !!traitOptions?.length) {
                    traitOptions.forEach((traitSetting) => {
                      if (
                        attributes[traitSetting.category]?.toLowerCase() === traitSetting.trait.toLowerCase() ||
                        attributes[traitSetting.category.toLowerCase()]?.toLowerCase() === traitSetting.trait.toLowerCase()
                      ) {
                        traitPoints += traitSetting.amount
                      }
                    })
                  }
                }
              }
            }

            if (withWhales && !!whaleOptions?.length) {
              whaleOptions
                .sort((a, b) => b.groupSize - a.groupSize)
                .forEach((whaleSetting) => {
                  if (!whalePoints && heldTokensOfThisPolicy.length >= whaleSetting.groupSize) {
                    whalePoints += whaleSetting.shouldStack
                      ? Math.floor(heldTokensOfThisPolicy.length / whaleSetting.groupSize) * whaleSetting.amount
                      : whaleSetting.amount
                  }
                })
            }

            votePoints += basePoints
            votePoints += rankPoints
            votePoints += traitPoints
            votePoints += whalePoints
          }
        }

        if (votePoints) {
          setMessage(`You have ${votePoints} entry points`)
        } else {
          const foundEntry = entries?.find((item) => item.stakeKey === stakeKey)
          setMessage(`You entered with ${foundEntry?.points || 0} points`)
        }

        setHolderPoints({
          stakeKey,
          points: votePoints,
          withFungible: countedFungiblePoints,
          units: usedUnits,
        })
      } catch (error: any) {
        console.error(error)
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

        setMessage(errMsg)
      }
    },
    [poll]
  )

  const castVote = useCallback(
    async (serialNumber: number) => {
      if (
        window.confirm(
          `Are you sure you want to cast ${holderPoints.points} points to option #${serialNumber}?\n\nVotes are permanent, and cannot be changed.`
        )
      ) {
        if (poll && holderPoints.points) {
          try {
            setLoading(true)
            setMessage('This may take a moment...')

            const {
              data: { now },
            } = await axios.get<FetchedTimestampResponse>(`/api/timestamp`)

            if (now >= poll.endAt) {
              setPollActive(false)
              return
            }

            const collection = firestore.collection('polls')
            const { FieldValue } = firebase.firestore

            const foundEntry = poll.entries?.find((obj) => obj.stakeKey === holderPoints.stakeKey)

            let usedPoints = holderPoints.points

            if (foundEntry) {
              await collection.doc(poll?.id).update({
                entries: FieldValue.arrayRemove(foundEntry),
              })

              usedPoints += foundEntry.points
            }

            const updateParams: Partial<Poll> = {
              [`vote_${serialNumber}`]: FieldValue.increment(holderPoints.points),
              nonFungibleUsedUnits: FieldValue.arrayUnion(...holderPoints.units) as unknown as Poll['nonFungibleUsedUnits'],
              entries: FieldValue.arrayUnion({ stakeKey: holderPoints.stakeKey, points: usedPoints }) as unknown as Poll['entries'],
            }

            if (holderPoints.withFungible) {
              const foundItem = poll.fungibleHolders?.find((obj) => obj.stakeKey === holderPoints.stakeKey)

              await collection.doc(poll?.id).update({ fungibleHolders: FieldValue.arrayRemove(foundItem) })

              updateParams.fungibleHolders = FieldValue.arrayUnion({ ...foundItem, hasVoted: true }) as unknown as Poll['fungibleHolders']
            }

            await collection.doc(poll?.id).update(updateParams)

            setMessage(`Voted with ${holderPoints.points} points`)
            setHolderPoints({
              stakeKey: '',
              points: 0,
              withFungible: false,
              units: [],
            })
          } catch (error: any) {
            console.error(error)
            const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

            setMessage(errMsg)
          } finally {
            setLoading(false)
          }
        }
      }
    },
    [poll, holderPoints]
  )

  useEffect(() => {
    if (pollActive && !!user?.stakeKey) processPoints(user)
  }, [pollActive, user, processPoints])

  return (
    <div className='w-[80vw] md:w-[555px] mx-auto'>
      <PollViewer
        poll={{ ...poll, active: pollActive }}
        showClassified={holderEligible}
        callbackTimeExpired={() => setPollActive(false)}
        serial={selectedSerial}
        setSerial={(val) => setSelectedSerial(val)}
      />

      {pollActive ? (
        <Fragment>
          {loading ? <Loader withLabel label={message} /> : <p className='mb-2 text-center'>{message}</p>}
          <Button
            label={selectedSerial ? `Cast Vote to #${selectedSerial}` : 'Cast Vote'}
            disabled={!user?.stakeKey || !pollActive || !holderPoints.points || !holderEligible || !selectedSerial || loading}
            onClick={() => castVote(selectedSerial)}
          />
        </Fragment>
      ) : null}

      {isSdk ? null : (
        <Button
          label='Copy URL'
          disabled={loading}
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/polls?id=${poll.id}`)
            toast.success('Copied')
          }}
        />
      )}
    </div>
  )
}

export default PollEnter
