import {
  BanknotesIcon,
  ChartBarIcon,
  // CodeBracketIcon,
  // FingerPrintIcon,
  // FireIcon,
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
        `fixed top-20 left-0 z-40 w-60 h-[calc(100vh-5rem)] p-0.5 pl-0 rounded-r-xl bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 transition-transform ` +
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
              tags: ['Soon'],
            },
            {
              label: 'Governance',
              Icon: (props) => <ChartBarIcon {...props} />,
              path: '/polls',
              tags: ['Soon'],
            },
            {
              label: 'Giveaways',
              Icon: (props) => <GiftIcon {...props} />,
              path: '/giveaways',
              tags: ['Soon'],
            },
            // {
            //   label: 'Mint Tokens',
            //   Icon: (props) => <FingerPrintIcon {...props} />,
            //   path: '/mint',
            //   tags: ['Pro'],
            // },
            // {
            //   label: 'Burn Tokens',
            //   Icon: (props) => <FireIcon {...props} />,
            //   path: '/burn',
            //   tags: ['Pro'],
            // },
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
