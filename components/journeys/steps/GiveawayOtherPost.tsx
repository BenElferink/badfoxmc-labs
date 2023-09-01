import { useEffect, useState } from 'react'
import uploadFile from '@/functions/storage/bucket/uploadFile'
import deleteFile from '@/functions/storage/bucket/deleteFile'
import JourneyStepWrapper from './JourneyStepWrapper'
import Loader from '@/components/Loader'
import Input from '@/components/form/Input'
import TextArea from '@/components/form/TextArea'
import MediaViewer from '@/components/MediaViewer'
import type { GiveawaySettings } from '@/@types'

const GiveawayOtherPost = (props: {
  defaultData: Partial<GiveawaySettings>
  callback: (payload: Partial<GiveawaySettings>) => void
  next?: () => void
  back?: () => void
}) => {
  const { defaultData, callback, next, back } = props
  const [data, setData] = useState(defaultData)

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

    const sizeLimit = 1000000 // 1mb
    if (file.size > sizeLimit) {
      setProgress((prev) => ({ ...prev, loading: false, msg: 'File size is limited to 1mb' }))
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
      disableNext={!data['otherAmount'] || !data['otherTitle'] || progress.loading}
      back={back}
      next={next}
      buttons={[
        {
          label: 'Upload Image',
          disabled: progress.loading,
          onClick: () => {},
          type: 'file',
          acceptFile: '.jpg,.jpeg,.png,.webp,.gif',
          callbackFile: async (file) => {
            if (!file) return
            if (data['thumb']) await deleteFile(data['thumb'])

            const mediaUrl = (await upload(file)) as string

            setData((prev) => {
              const payload = { ...prev }

              payload['thumb'] = mediaUrl

              return payload
            })
          },
        },
      ]}
    >
      <h6 className='mb-6 text-xl text-center'>What should be given away?</h6>

      <Input
        placeholder='Amount'
        value={data['otherAmount'] || ''}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }

            const n = Number(v)
            if (isNaN(n) || n < 0) return prev

            payload['otherAmount'] = Math.floor(n)

            return payload
          })
        }
      />

      <Input
        placeholder='Title (ex. whitelist)'
        value={data['otherTitle']}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }

            payload['otherTitle'] = v

            return payload
          })
        }
      />

      <TextArea
        placeholder='Description (optional)'
        value={data['otherDescription']}
        setValue={(v) =>
          setData((prev) => {
            const payload = { ...prev }

            payload['otherDescription'] = v

            return payload
          })
        }
      />

      {data['thumb'] ? <MediaViewer mediaType='IMAGE' src={data['thumb']} size='max-w-[555px] w-full h-full mx-auto' /> : null}

      {progress.loading ? <Loader /> : null}
      {progress.msg ? <p className='mt-1 text-center'>{progress.msg}</p> : null}
    </JourneyStepWrapper>
  )
}

export default GiveawayOtherPost
