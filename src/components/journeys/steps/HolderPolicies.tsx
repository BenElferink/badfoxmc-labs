import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import api from '@/utils/api';
import JourneyStepWrapper from './JourneyStepWrapper';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import TrashButton from '@/components/form/TrashButton';
import type { HolderSettings } from '@/@types';

const INIT_TRAIT_POINTS = {
  category: '',
  trait: '',
  amount: 0,
};
const INIT_RANK_POINTS = {
  minRange: 0,
  maxRange: 0,
  amount: 0,
};
const INIT_WHALE_POINTS = {
  shouldStack: false,
  groupSize: 0,
  amount: 0,
};
const INIT_HOLDER_SETTINGS = {
  policyId: '',
  weight: 1,
  withTraits: false,
  traitOptions: [{ ...INIT_TRAIT_POINTS }],
  withRanks: false,
  rankOptions: [{ ...INIT_RANK_POINTS }],
  withWhales: false,
  whaleOptions: [{ ...INIT_WHALE_POINTS }],
};

const HolderPolicies = (props: {
  defaultData: Partial<HolderSettings>
  callback: (payload: Partial<HolderSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props;
  const [formData, setFormData] = useState({
    holderPolicies: defaultData['holderPolicies']?.length ? defaultData['holderPolicies'] : [{ ...INIT_HOLDER_SETTINGS }],
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [value: string]: boolean }>({});

  return (
    <JourneyStepWrapper
      disableNext={loading || !formData['holderPolicies']?.filter(({ policyId }) => !!policyId).length}
      disableBack={loading}
      next={async () => {
        setLoading(true);
        let allowNext = true;

        if (formData['holderPolicies'].length) {
          toast.loading('Validating');

          for await (const { policyId } of formData['holderPolicies']) {
            try {
              if (!!policyId) await api.policy.getData(policyId);

              setFormErrors((prev) => ({ ...prev, [policyId]: false }));
            } catch (error) {
              allowNext = false;

              setFormErrors((prev) => ({ ...prev, [policyId]: true }));
            }
          }

          toast.dismiss();
          if (!allowNext) toast.error('Bad Value(s)');
        }

        const filtered = formData['holderPolicies']
          .filter((obj) => !!obj.policyId)
          .map((obj) => {
            const traitOptions =
              obj.withTraits && obj.traitOptions?.length ? obj.traitOptions.filter((obj) => !!obj.category && !!obj.trait && !!obj.amount) : [];

            const rankOptions =
              obj.withRanks && obj.rankOptions?.length ? obj.rankOptions.filter((obj) => !!obj.minRange && !!obj.maxRange && !!obj.amount) : [];

            const whaleOptions = obj.withWhales && obj.whaleOptions?.length ? obj.whaleOptions.filter((obj) => !!obj.groupSize && !!obj.amount) : [];

            return {
              ...obj,
              withTraits: !!traitOptions.length,
              traitOptions,
              withRanks: !!rankOptions.length,
              rankOptions,
              withWhales: !!whaleOptions.length,
              whaleOptions,
            };
          });

        callback({
          holderPolicies: filtered,
        });

        setLoading(false);
        if (allowNext && next) setTimeout(() => next(), 0);
      }}
      back={back}
    >
      <h6 className='text-xl text-center'>Who are the holders?</h6>
      <p className='my-6 text-xs text-center'>
        * Weight is the multiplier of that Policy ID (default 1)
        <br />
        (For example: you may want to give pass holders 2x points than pfp holders)
        <br />
        <br />* Trait, Rank, and Whale points are non-inclusive (additional to the base amount)
        <br />
        <br />* Trait, Rank, and Whale points do not apply to Fungible Tokens of that Policy ID
        <br />
        <br />* Ranks are obtained from
        <Link href='https://cnft.tools' target='_blank' rel='noopener noreferrer' className='group'>
          <Image src='/media/logo/cnfttools.png' alt='' width={20} height={20} className='inline ml-1 mr-0.5' priority unoptimized />
          <span className='text-blue-200 group-hover:underline'>cnft.tools</span>
        </Link>
      </p>

      {formData['holderPolicies']?.map(
        ({ policyId, weight, withTraits, traitOptions, withRanks, rankOptions, withWhales, whaleOptions }, policyIdx) => (
          <div key={`pid-${policyIdx}-${formData['holderPolicies'].length}`}>
            <div>
              <div className='flex items-center'>
                <Input
                  placeholder='Policy ID:'
                  error={formErrors[policyId]}
                  value={policyId}
                  setValue={(v) =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                      // @ts-ignore
                      payload['holderPolicies'][policyIdx] = {
                        // @ts-ignore
                        ...payload['holderPolicies'][policyIdx],
                        policyId: v,
                      };

                      return payload;
                    })
                  }
                />

                {/* @ts-ignore */}
                {formData['holderPolicies'].length > 1 ? (
                  <TrashButton
                    onClick={() => {
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                        payload['holderPolicies'].splice(policyIdx, 1);

                        return payload;
                      });
                    }}
                  />
                ) : null}
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <label
                    className={
                      'mx-2 flex items-center ' + (!policyId ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                    }
                  >
                    <input
                      type='checkbox'
                      disabled={!policyId}
                      checked={withTraits}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                          payload['holderPolicies'][policyIdx] = {
                            ...payload['holderPolicies'][policyIdx],
                            withTraits: !withTraits,
                            traitOptions: [{ ...INIT_TRAIT_POINTS }],
                          };

                          return payload;
                        })
                      }
                      className='disabled:opacity-50'
                    />
                    <span className='ml-2 text-sm'>Trait Points</span>
                  </label>

                  <label
                    className={
                      'mx-2 flex items-center ' + (!policyId ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                    }
                  >
                    <input
                      type='checkbox'
                      disabled={!policyId}
                      checked={withRanks}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                          payload['holderPolicies'][policyIdx] = {
                            ...payload['holderPolicies'][policyIdx],
                            withRanks: !withRanks,
                            rankOptions: [{ ...INIT_RANK_POINTS }],
                          };

                          return payload;
                        })
                      }
                      className='disabled:opacity-50'
                    />
                    <span className='ml-2 text-sm'>Rank Points</span>
                  </label>

                  <label
                    className={
                      'mx-2 flex items-center ' + (!policyId ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                    }
                  >
                    <input
                      type='checkbox'
                      disabled={!policyId}
                      checked={withWhales}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                          payload['holderPolicies'][policyIdx] = {
                            ...payload['holderPolicies'][policyIdx],
                            withWhales: !withWhales,
                            whaleOptions: [{ ...INIT_WHALE_POINTS }],
                          };

                          return payload;
                        })
                      }
                      className='disabled:opacity-50'
                    />
                    <span className='ml-2 text-sm'>Whale Points</span>
                  </label>
                </div>

                <div className='flex items-center'>
                  <label className={'mr-2 whitespace-nowrap ' + (!policyId ? 'text-zinc-600' : 'text-zinc-400')}>Weight:</label>
                  <Input
                    disabled={!policyId}
                    value={weight}
                    setValue={(v) =>
                      setFormData((prev) => {
                        const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                        const n = Number(v);

                        if (isNaN(n) || n < 0) return payload;

                        // @ts-ignore
                        payload['holderPolicies'][policyIdx] = {
                          // @ts-ignore
                          ...payload['holderPolicies'][policyIdx],
                          weight: n,
                        };

                        return payload;
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {withTraits ? (
              <div className='w-full'>
                {traitOptions?.map(({ category, trait, amount }, rewardingTraitsIdx) => (
                  <div
                    key={`pid-${policyIdx}-${formData['holderPolicies'].length}-trait-${rewardingTraitsIdx}-${traitOptions.length}`}
                    className='my-1'
                  >
                    <div className='flex items-center justify-between'>
                      <Input
                        placeholder='Category: (ex. Eyewear)'
                        disabled={!policyId || !withTraits}
                        value={category || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...traitOptions];

                            arr[rewardingTraitsIdx].category = v;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />
                      <Input
                        placeholder='Value: (ex. 3D Glasses)'
                        disabled={!policyId || !withTraits}
                        value={trait || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...traitOptions];

                            arr[rewardingTraitsIdx].trait = v;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />
                      <Input
                        placeholder='Amount: (ex. 10)'
                        disabled={!policyId || !withTraits}
                        value={amount || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...traitOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingTraitsIdx].amount = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              traitOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />

                      {traitOptions?.length > 1 ? (
                        <TrashButton
                          onClick={() =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                traitOptions: traitOptions.filter((_item, _idx) => _idx !== rewardingTraitsIdx),
                              };

                              return payload;
                            })
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                ))}

                <Button
                  label='Add another Attribute'
                  icon={PlusCircleIcon}
                  disabled={!!formData['holderPolicies'][policyIdx].traitOptions?.filter((obj) => !obj.category || !obj.trait || !obj.amount).length}
                  onClick={() =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                      payload['holderPolicies'][policyIdx].traitOptions?.push({ ...INIT_TRAIT_POINTS });

                      return payload;
                    })
                  }
                />
              </div>
            ) : null}

            {withRanks ? (
              <div className='w-full'>
                {rankOptions?.map(({ minRange, maxRange, amount }, rewardingRanksIdx) => (
                  <div key={`pid-${policyIdx}-${formData['holderPolicies'].length}-rank-${rewardingRanksIdx}-${rankOptions.length}`} className='my-1'>
                    <div className='flex items-center justify-between'>
                      <Input
                        placeholder='Min. Range: (ex. 1)'
                        disabled={!policyId || !withRanks}
                        value={minRange || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...rankOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingRanksIdx].minRange = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />
                      <Input
                        placeholder='Max. Range: (ex. 1000)'
                        disabled={!policyId || !withRanks}
                        value={maxRange || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...rankOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingRanksIdx].maxRange = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />
                      <Input
                        placeholder='Amount: (ex. 10)'
                        disabled={!policyId || !withRanks}
                        value={amount || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...rankOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingRanksIdx].amount = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              rankOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />

                      {rankOptions.length > 1 ? (
                        <TrashButton
                          onClick={() =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                rankOptions: rankOptions.filter((_item, _idx) => _idx !== rewardingRanksIdx),
                              };

                              return payload;
                            })
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                ))}

                <Button
                  label='Add another Range'
                  icon={PlusCircleIcon}
                  disabled={
                    !!formData['holderPolicies'][policyIdx].rankOptions?.filter((obj) => !obj.minRange || !obj.maxRange || !obj.amount).length
                  }
                  onClick={() =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                      payload['holderPolicies'][policyIdx].rankOptions?.push({ ...INIT_RANK_POINTS });

                      return payload;
                    })
                  }
                />
              </div>
            ) : null}

            {withWhales ? (
              <div className='w-full'>
                {whaleOptions?.map(({ shouldStack, groupSize, amount }, rewardingWhalesIdx) => (
                  <div
                    key={`pid-${policyIdx}-${formData['holderPolicies'].length}-rank-${rewardingWhalesIdx}-${whaleOptions.length}`}
                    className='my-1'
                  >
                    <div className='flex items-center justify-between'>
                      <label
                        className={
                          'mx-2 flex items-center ' +
                          (!policyId || !withWhales ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white cursor-pointer')
                        }
                      >
                        <input
                          type='checkbox'
                          disabled={!policyId || !withWhales}
                          checked={shouldStack}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                              const arr = [...whaleOptions];

                              arr[rewardingWhalesIdx].shouldStack = !shouldStack;

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                whaleOptions: arr,
                              };

                              return payload;
                            })
                          }
                          className='disabled:opacity-50'
                        />
                        <span className='ml-2 text-sm whitespace-nowrap'>Should Stack</span>
                      </label>

                      <Input
                        placeholder='Group Size: (ex. 50+)'
                        disabled={!policyId || !withWhales}
                        value={groupSize || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...whaleOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingWhalesIdx].groupSize = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              whaleOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />
                      <Input
                        placeholder='Amount: (ex. 10)'
                        disabled={!policyId || !withWhales}
                        value={amount || ''}
                        setValue={(v) =>
                          setFormData((prev) => {
                            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));
                            const arr = [...whaleOptions];

                            const n = Number(v);
                            if (isNaN(n) || n < 0) return payload;

                            arr[rewardingWhalesIdx].amount = n;

                            payload['holderPolicies'][policyIdx] = {
                              ...payload['holderPolicies'][policyIdx],
                              whaleOptions: arr,
                            };

                            return payload;
                          })
                        }
                      />

                      {whaleOptions.length > 1 ? (
                        <TrashButton
                          onClick={() =>
                            setFormData((prev) => {
                              const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                              payload['holderPolicies'][policyIdx] = {
                                ...payload['holderPolicies'][policyIdx],
                                whaleOptions: whaleOptions.filter((_item, _idx) => _idx !== rewardingWhalesIdx),
                              };

                              return payload;
                            })
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                ))}

                <Button
                  label='Add another Group'
                  icon={PlusCircleIcon}
                  disabled={!!formData['holderPolicies'][policyIdx].whaleOptions?.filter((obj) => !obj.groupSize || !obj.amount).length}
                  onClick={() =>
                    setFormData((prev) => {
                      const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

                      payload['holderPolicies'][policyIdx].whaleOptions?.push({ ...INIT_WHALE_POINTS });

                      return payload;
                    })
                  }
                />
              </div>
            ) : null}

            <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />
          </div>
        )
      )}

      <Button
        label='Add another Policy ID'
        icon={PlusCircleIcon}
        disabled={!formData.holderPolicies?.filter((obj) => !!obj.policyId).length}
        onClick={() =>
          setFormData((prev) => {
            const payload: HolderSettings = JSON.parse(JSON.stringify(prev));

            payload['holderPolicies'].push({ ...INIT_HOLDER_SETTINGS });

            return payload;
          })
        }
      />
    </JourneyStepWrapper>
  );
};

export default HolderPolicies;
