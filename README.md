# Bad Labs

Domain: [labs.badfoxmc.com](https://labs.badfoxmc.com)

## SDK for websites

Products: giveaways, polls

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
