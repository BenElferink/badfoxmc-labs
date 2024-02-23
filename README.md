# Bad Labs

Domain: [labs.badfoxmc.com](https://labs.badfoxmc.com)

## SDK for websites

Products: giveaways, polls

### Vanila HTML/CSS/JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load the Bad Labs SDK -->
    <script src="https://labs.badfoxmc.com/sdk.min.js"></script>
    <script>
      // Variable "product" is one of: "giveaways", "polls"
      const product = 'polls'
      // Variable "creatorStakeKey" is the wallet from which the polls/giveaways will be created
      const creatorStakeKey = 'stake1...'
      // Init an instance from the Bad Labs SDK (a new instance must be created for each product)
      const badLabs = new BadLabsSDK({ product, creatorStakeKey })
    </script>
  </head>

  <body>
    <!-- Create an element that would contain the button and the wallet dropdown -->
    <div style="position: relative;">
      <!--
        The button should call "loadWallets" from the Bad Labs SDK instance.
        Variable "injectId" is equal the element ID of which the wallet buttons would be injected to.
        Variable "buttonBackgroundColor" changes the wallet button's background color.
        Variable "buttonTextColor" changes the wallet button's text color.
        -->
      <button onclick="badLabs.loadWallets({ injectId: 'inject-here', buttonBackgroundColor: '#fff', buttonTextColor: '#000' })">Governance</button>

      <div id="inject-here" style="position: absolute; top: 100%; right: 0; display: flex; flex-direction: column;">
        <!-- Wallets will be injected here -->
      </div>
    </div>

    <!-- The rest of your website... -->
  </body>
</html>
```

### Next.js

```tsx
import Link from 'next/link'
import Script from 'next/script'
import { useRef } from 'react'

// Variable "creatorStakeKey" is the wallet from which the polls/giveaways will be created
const creatorStakeKey = 'stake1...'

const Navigation = () => {
  const pollsSDK = useRef(null)
  const giveawaysSDK = useRef(null)

  const injectWallets = (elementId: string, sdk: typeof pollsSDK | typeof giveawaysSDK) => {
    if (sdk.current) {
      // The button should call "loadWallets" from the Bad Labs SDK instance.
      // Variable "injectId" is equal the element ID of which the wallet buttons would be injected to.
      // Variable "buttonBackgroundColor" changes the wallet button's background color.
      // Variable "buttonTextColor" changes the wallet button's text color.

      // @ts-ignore
      sdk.current.loadWallets({ injectId: elementId, buttonBackgroundColor: '#fff', buttonTextColor: '#000' })
    }
  }

  return (
    <nav className='flex items-center'>
      <Script
        src='https://labs.badfoxmc.com/sdk.min.js'
        onReady={() => {
          // Variable "product" is one of: "giveaways", "polls"
          // Init an instance from the Bad Labs SDK (a new instance must be created for each product)

          // @ts-ignore
          pollsSDK.current = new BadLabsSDK({ product: 'polls', creatorStakeKey })
          // @ts-ignore
          giveawaysSDK.current = new BadLabsSDK({ product: 'giveaways', creatorStakeKey })
        }}
      />

      <ul>
        <li>
          <Link href='/'>Home</Link>
        </li>

        <li className='relative'>
          <button onClick={() => injectWallets('inject-polls', pollsSDK)}>Governance</button>
          <div id='inject-polls' className='absolute flex flex-col'>
            {/* Wallets will be injected here */}
          </div>
        </li>

        <li className='relative'>
          <button onClick={() => injectWallets('inject-giveaways', giveawaysSDK)}>Giveaways</button>
          <div id='inject-giveaways' className='absolute flex flex-col'>
            {/* Wallets will be injected here */}
          </div>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
```
