import { Fragment, useEffect, useState } from 'react'
import { ArrowUpTrayIcon, PlusCircleIcon } from '@heroicons/react/24/solid'
import JourneyStepWrapper from './JourneyStepWrapper'
import uploadFile from '@/functions/storage/bucket/uploadFile'
import deleteFile from '@/functions/storage/bucket/deleteFile'
import Input from '@/components/form/Input'
import TextArea from '@/components/form/TextArea'
import TrashButton from '@/components/form/TrashButton'
import MediaViewer from '@/components/MediaViewer'
import DropDown from '@/components/form/DropDown'
import type { MediaType, PollOption, PollSettings } from '@/@types'
import Button from '@/components/form/Button'
import Loader from '@/components/Loader'

const INIT_OPTION: PollOption = {
  serial: 1,
  answer: '',
  isMedia: false,
  mediaType: '',
  mediaUrl: '',
}

const PollContent = (props: {
  defaultData: Partial<PollSettings>
  callback: (payload: Partial<PollSettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [data, setData] = useState<Partial<PollSettings>>({
    ...defaultData,
    options: defaultData['options']?.length ? defaultData['options'] : [{ ...INIT_OPTION }],
  })

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const [progress, setProgress] = useState({
    msg: '',
    loading: false,
  })

  const upload = async (file: File) => {
    setProgress((prev) => ({ ...prev, loading: true, msg: 'Uploading...' }))

    const sizeLimit = 5000000 // 5mb
    if (file.size > sizeLimit) {
      setProgress((prev) => ({ ...prev, loading: false, msg: 'File size is limited to 5mb' }))
      return ''
    }

    try {
      const { fileUrl } = await uploadFile(file)
      setProgress((prev) => ({ ...prev, loading: false, msg: '' }))
      return fileUrl
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      setProgress((prev) => ({ ...prev, loading: false, msg: errMsg }))
      return ''
    }
  }

  return (
    <JourneyStepWrapper
      disableNext={
        progress.loading ||
        !data['question'] ||
        !!data['options']?.filter(({ isMedia, answer, mediaUrl }) => (isMedia && !mediaUrl) || (!isMedia && !answer)).length
      }
      next={next}
      back={back}
    >
      <h6 className='mb-6 text-xl text-center'>Poll Content</h6>

      <Input
        placeholder='Question'
        value={data['question']}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }
            payload['question'] = v
            return payload
          })
        }
      />

      <TextArea
        placeholder='Description (optional)'
        value={data['description']}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }
            payload['description'] = v
            return payload
          })
        }
      />

      <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />

      {data['options']?.map(({ serial, answer, isMedia, mediaType, mediaUrl }, idx) => (
        <div key={`option-${serial}`}>
          <div className='flex items-center justify-center'>
            <div
              onChange={async (e) => {
                if (progress.loading) return
                if (mediaUrl) await deleteFile(mediaUrl)

                setData((prev) => {
                  const arr = [...(prev.options || [])]
                  arr[idx].isMedia = false

                  return {
                    ...prev,
                    options: arr,
                  }
                })
              }}
              className={'group cursor-pointer my-2 p-4 border rounded-lg ' + (!isMedia ? 'text-white' : 'text-zinc-400 border-transparent')}
            >
              <label className='flex items-center group-hover:text-white cursor-pointer'>
                <input type='radio' name='amountType' value='FIXED' onChange={() => {}} checked={!isMedia} />
                <span className='ml-2'>Text Option</span>
              </label>
            </div>

            <div
              onChange={(e) => {
                if (progress.loading) return

                setData((prev) => {
                  const arr = [...(prev.options || [])]
                  arr[idx].isMedia = true

                  return {
                    ...prev,
                    options: arr,
                  }
                })
              }}
              className={'group cursor-pointer my-2 p-4 border rounded-lg ' + (isMedia ? 'text-white' : 'text-zinc-400 border-transparent')}
            >
              <label className='flex items-center group-hover:text-white cursor-pointer'>
                <input type='radio' name='amountType' value='PERCENT' onChange={() => {}} checked={isMedia} />
                <span className='ml-2'>Media Option</span>
              </label>
            </div>
          </div>

          <div className='flex items-center'>
            {isMedia ? (
              <div className='w-full my-0.5 flex items-center justify-between'>
                {mediaType && mediaUrl ? (
                  <div className='max-w-[300px] mx-auto'>
                    <MediaViewer mediaType={mediaType} src={mediaUrl} size='w-full h-full my-4' />
                  </div>
                ) : (
                  <Fragment>
                    <DropDown
                      items={[
                        { label: 'image / gif', value: 'IMAGE' as MediaType },
                        { label: 'video', value: 'VIDEO' as MediaType },
                        { label: 'audio', value: 'AUDIO' as MediaType },
                      ]}
                      disabled={progress.loading}
                      value={mediaType}
                      setValue={(_val) => {
                        setData((prev) => {
                          const arr = [...(prev.options || [])]
                          arr[idx].mediaType = _val

                          return {
                            ...prev,
                            options: arr,
                          }
                        })
                      }}
                    />

                    <button
                      type='button'
                      onClick={() => {}}
                      disabled={progress.loading || !mediaType}
                      className='relative w-full m-1 p-4 flex items-center justify-center rounded-lg border border-transparent hover:border-zinc-400 focus:border-zinc-400 disabled:border-transparent bg-zinc-700 hover:bg-zinc-600 disabled:text-zinc-600 disabled:bg-zinc-800 disabled:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed'
                    >
                      <input
                        className='absolute w-full h-full opacity-0 cursor-pointer'
                        type='file'
                        accept={
                          mediaType === 'IMAGE'
                            ? '.jpg,.jpeg,.png,.webp,.gif'
                            : mediaType === 'VIDEO'
                            ? '.mp4,.mov,.avi,.m4v,.wmv,.webm'
                            : mediaType === 'AUDIO'
                            ? '.mp3,.wav'
                            : ''
                        }
                        multiple={false}
                        disabled={progress.loading || !mediaType}
                        onChange={async (e) => {
                          const file = (e.target.files as FileList)[0]
                          const fileUrl = await upload(file)

                          if (fileUrl) {
                            setData((prev) => {
                              const arr = [...(prev.options || [])]
                              arr[idx].mediaUrl = fileUrl

                              return {
                                ...prev,
                                options: arr,
                              }
                            })
                          }
                        }}
                      />
                      <ArrowUpTrayIcon className='w-5 h-5 mr-2' />
                      Upload File
                    </button>
                  </Fragment>
                )}
              </div>
            ) : (
              <Input
                placeholder={`Option #${serial}`}
                disabled={progress.loading}
                value={answer}
                setValue={(v) =>
                  setData((prev) => {
                    const arr = [...(prev.options || [])]
                    arr[idx].answer = v

                    return {
                      ...prev,
                      options: arr,
                    }
                  })
                }
              />
            )}

            {(data.options || []).length > 1 ? (
              <TrashButton
                disabled={progress.loading}
                onClick={async () => {
                  if (mediaUrl) await deleteFile(mediaUrl)

                  setData((prev) => {
                    const payload: PollSettings = JSON.parse(JSON.stringify(prev))

                    payload['options'] = payload['options'].filter((obj) => obj.serial !== serial)
                    payload['options'] = payload['options'].map((item, i) => ({ ...item, serial: i + 1 }))

                    return payload
                  })
                }}
              />
            ) : null}
          </div>

          <div className='w-3/4 h-0.5 my-4 mx-auto bg-zinc-400 rounded-full' />
        </div>
      ))}

      {progress.loading || progress.msg ? (
        <Fragment>
          {progress.loading ? <Loader /> : null}
          {progress.msg ? <p className='mt-1 text-center'>{progress.msg}</p> : null}
        </Fragment>
      ) : (
        <Button
          label='Add another option'
          icon={PlusCircleIcon}
          disabled={progress.loading || !data['options']?.filter((obj) => (obj.isMedia && !!obj.mediaUrl) || (!obj.isMedia && !!obj.answer)).length}
          onClick={() =>
            setData((prev) => {
              const payload: PollSettings = JSON.parse(JSON.stringify(prev))

              payload['options'].push({ ...INIT_OPTION, serial: payload['options'].length + 1 })
              payload['options'] = payload['options'].map((item, i) => ({ ...item, serial: i + 1 }))

              return payload
            })
          }
        />
      )}
    </JourneyStepWrapper>
  )
}

export default PollContent
