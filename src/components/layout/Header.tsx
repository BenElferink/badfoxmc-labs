import Image from 'next/image'
import { Bars3Icon } from '@heroicons/react/24/solid'
import Auth from '@/components/Auth'

const Header = ({ clickMenu }: { clickMenu: () => void }) => {
  return (
    <header id='header' className='sticky top-0 z-20 h-20 px-4 flex items-center justify-between'>
      <div className='flex items-center'>
        <Image src='/media/logo/badlabs.png' alt='logo' width={50} height={50} />
        <h1 className='ml-1.5 text-xl whitespace-nowrap'>Bad Labs</h1>
      </div>

      <div className='flex items-center'>
        <div className='sm:hidden p-0.5 rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 cursor-pointer'>
          <button type='button' onClick={clickMenu} className='p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center'>
            <Bars3Icon className='w-6 h-6' />
          </button>
        </div>

        <Auth />
      </div>
    </header>
  )
}

export default Header
