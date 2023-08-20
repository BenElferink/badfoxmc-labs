class BadLabsSDK {
  constructor({ product, creatorStakeKey }) {
    this.product = product
    this.creatorStakeKey = creatorStakeKey
    this.frontUrl = 'https://labs.badfoxmc.com/sdk'
    this.supportedWallets = ['begin', 'eternl', 'flint', 'lace', 'nami', 'nufi', 'gerowallet', 'typhoncip30', 'vespr']
    // https://github.com/MeshJS/mesh/blob/73b6bb9bee532dc0bac17c14c2cd2f31ef0c071c/packages/module/src/common/constants.ts
  }

  loadWallets = async (options) => {
    const { injectId, buttonBackgroundColor = '#f5f5f5', buttonTextColor = '#00000' } = options || {}

    if (!this.product || !this.creatorStakeKey) {
      throw new Error('400 BAD REQUEST; missing required params; new BadLabsSDK({ product: "string", creatorStakeKey: "string" })')
    }

    if (!['giveaways'].includes(this.product)) {
      throw new Error('400 BAD REQUEST; "product" must be one of ["giveaways"]')
    }

    if (!injectId) {
      throw new Error('400 BAD REQUEST; missing required params; sdk.loadWallets({ injectId: "string" })')
    }

    const cardano = window?.cardano || {}

    const wallets = this.supportedWallets
      .filter((str) => cardano[str] !== void 0)
      .map((str) => ({
        name: cardano[str].name,
        icon: cardano[str].icon,
        version: cardano[str].apiVersion,
        apiName: str,
      }))

    const injectEl = document.getElementById(injectId)
    injectEl.innerText = ''

    const div = document.createElement('div')
    wallets.forEach((obj) => {
      const img = document.createElement('img')
      img.src = obj.icon
      img.style = 'width: 30px; height: 30px; margin: 0 0.5rem 0 0;'

      const span = document.createElement('span')
      span.innerText = obj.name

      const btn = document.createElement('button')
      btn.style = `width: 150px; height: 2.5rem; margin: 0.1rem; white-space: nowrap; color: ${buttonTextColor}; background-color: ${buttonBackgroundColor}; border: none; border-radius: 0.5rem;`

      btn.appendChild(img)
      btn.appendChild(span)
      btn.onclick = async () => {
        await this.connectAndStart(obj.apiName)
        injectEl.innerText = ''
      }

      div.appendChild(btn)
    })

    injectEl.appendChild(div)
  }

  connectAndStart = async (walletName) => {
    const wallet = window?.cardano[walletName]

    if (wallet) {
      const connected = await wallet.enable()
      const stakeKeys = await connected.getRewardAddresses()

      this.start({ userStakeKey: stakeKeys[0] })
    } else {
      window.alert(`${walletName} not installed`)
    }
  }

  start({ userStakeKey } = {}) {
    if (!document || !document.body) {
      throw new Error('document.body is not defined')
    }

    if (!userStakeKey) {
      throw new Error('400 BAD REQUEST; missing required params; sdk.start({ userStakeKey: "string" })')
    }

    const query = `?product=${this.product}&creator_stake_key=${this.creatorStakeKey}&user_stake_key=${userStakeKey}`
    const src = this.frontUrl + query
    const isMobile = window.innerWidth <= 768

    this.iFrameWrapper = document.createElement('div')
    this.iFrameWrapper.setAttribute('id', 'bad-labs-iframe-wrapper')
    this.iFrameWrapper.setAttribute(
      'style',
      'width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); border: none; display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; z-index: 999999'
    )

    this.iFrame = document.createElement('iframe')
    this.iFrame.setAttribute('id', 'bad-labs-iframe')
    this.iFrame.setAttribute('src', src)
    this.iFrame.setAttribute(
      'style',
      `max-width: ${isMobile ? '100vw' : '555px'}; width: 100%; max-height: ${
        isMobile ? '100vh' : '70vh'
      }; height: 100%; border: none; border-radius: ${isMobile ? '0' : '1rem'}; box-shadow: 0 0 2px #fff;`
    )

    this.iFrame = this.iFrameWrapper.appendChild(this.iFrame)
    this.iFrameWrapper = document.body.appendChild(this.iFrameWrapper)

    window.addEventListener('message', ({ origin, data: msg }) => {
      switch (msg) {
        case 'close-bad-labs-sdk': {
          this.stop()
          break
        }
        default: {
          break
        }
      }
    })
  }

  stop() {
    this.iFrame = this.iFrameWrapper.removeChild(this.iFrame)
    this.iFrameWrapper = document.body.removeChild(this.iFrameWrapper)
  }
}
