const formatIpfsReference = (str: string) => {
  if (!str) {
    return {
      ipfs: '',
      url: '',
    }
  }

  const ipfs = str.indexOf('ipfs://') === 0 ? str : `ipfs://${str}`
  const url = ipfs.replace('ipfs://', 'https://ipfs.blockfrost.dev/ipfs/')

  return {
    ipfs,
    url,
  }
}

export default formatIpfsReference
