import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  // CodeBracketIcon,
  GiftIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'
import LinkList from './LinkList'

const Sidebar = (props: { open: boolean }) => {
  const { open } = props

  return (
    <aside
      id='sidebar'
      className={
        `fixed top-20 left-0 z-10 w-60 h-[calc(100vh-5rem)] p-0.5 pl-0 rounded-r-xl bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 transition-transform ` +
        (open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0')
      }
    >
      <div className='h-full py-4 px-3 rounded-r-xl bg-zinc-800 overflow-y-auto'>
        <LinkList
          items={[
            {
              label: 'Home',
              Icon: (props) => <HomeIcon {...props} />,
              path: '/',
            },
            {
              label: 'Airdrops',
              Icon: (props) => <BanknotesIcon {...props} />,
              path: '/airdrops',
              tags: ['PRO'],
            },
            {
              label: 'Governance',
              Icon: (props) => <ChartBarIcon {...props} />,
              path: '/polls',
            },
            {
              label: 'Giveaways',
              Icon: (props) => <GiftIcon {...props} />,
              path: '/giveaways',
            },
            {
              label: 'NFT Swap',
              Icon: (props) => <ArrowPathIcon {...props} />,
              // path: '/swap',
              tags: ['SOON'],
            },
            // {
            //   label: 'Developers',
            //   Icon: (props) => <CodeBracketIcon {...props} />,
            //   nested: [
            //     {
            //       label: 'SDK',
            //       path: '/dev/sdk',
            //     },
            //     {
            //       label: 'API',
            //       path: '/dev/api',
            //     },
            //   ],
            // },
          ]}
        />
      </div>
    </aside>
  )
}

export default Sidebar
