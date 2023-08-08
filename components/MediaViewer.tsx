import Image from 'next/image'
import { useMemo } from 'react'
import type { MediaType } from '@/@types'
import { MEDIA_TYPES } from '@/constants'

const MediaViewer = (props: { mediaType: MediaType; src: string; size?: string; withBorder?: boolean }) => {
  const { mediaType, src, size, withBorder } = props

  const className = useMemo(
    () =>
      (size ? size : 'w-[100px] h-[100px]') +
      ' object-contain rounded-lg ' +
      (withBorder ? 'm-1 border border-zinc-600' : ''),
    [size, withBorder]
  )

  return mediaType === MEDIA_TYPES['IMAGE'] ? (
    <Image
      src={src}
      alt=''
      className={className}
      width={Number(className.split(' ')[0].replace('w-[', '').replace('px]', ''))}
      height={Number(className.split(' ')[1].replace('h-[', '').replace('px]', ''))}
      priority
      unoptimized
    />
  ) : mediaType === MEDIA_TYPES['VIDEO'] ? (
    <video src={src} controls className={className} />
  ) : mediaType === MEDIA_TYPES['AUDIO'] ? (
    <audio src={src} controls />
  ) : null
}

export default MediaViewer
