import type { MediaType } from '@/@types'

const MediaViewer = (props: { mediaType: MediaType; src: string; size?: string }) => {
  const { mediaType, src, size } = props

  const className = (size ? size : 'w-[100px] h-[100px]') + ' m-1 object-contain rounded-lg border border-zinc-600'

  return mediaType === 'IMAGE' || mediaType === 'GIF' ? (
    <img src={src} alt='' className={className} />
  ) : mediaType === 'VIDEO' ? (
    <video src={src} controls className={className} />
  ) : mediaType === 'AUDIO' ? (
    <audio src={src} controls />
  ) : null
}

export default MediaViewer
