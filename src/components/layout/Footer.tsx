import Link from 'next/link'
import { MeshBadge } from '@meshsdk/react'
import MediaViewer from '@/components/MediaViewer'

const Item = ({ url, logo, label }: { url: string; logo: string; label: string }) => {
  return (
    <Link href={url} target='_blank' rel='noopener noreferrer' className='mx-2 flex flex-col items-center'>
      <MediaViewer mediaType='IMAGE' src={logo} size='h-[28px] w-[28px]' />
      <span className='text-sm'>{label}</span>
    </Link>
  )
}

const Footer = () => {
  return (
    <footer id='footer' className='p-4 flex flex-col items-center justify-center'>
      <div className='flex items-end justify-center'>
        <Item label='Cardano' url='https://cardano.org' logo='https://cardano.org/img/cardano-white.svg' />
        <div className='mx-2 text-sm'>
          <MeshBadge isDark />
        </div>
        <Item label='Blockfrost' url='https://blockfrost.io' logo='https://blockfrost.io/images/b-logo.svg' />
      </div>
    </footer>
  )
}

export default Footer
