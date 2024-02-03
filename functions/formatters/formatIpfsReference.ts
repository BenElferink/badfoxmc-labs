const formatIpfsReference = (str: string) => {
  if (!str) {
    return {
      ipfs: '',
      url: '',
    }
  }

  const strIsUrl = str.indexOf('https://') === 0 || str.indexOf('data:') === 0
  const strHasIpfsPrefix = str.indexOf('ipfs://') === 0

  const ipfs = strIsUrl ? '' : strHasIpfsPrefix ? str : `ipfs://${str}`
  const url = strIsUrl ? str : ipfs.replace('ipfs://', 'https://d28yzo4ezrm37i.cloudfront.net/image/') + '?s=400'

  return {
    ipfs,
    url,
  }
}

export default formatIpfsReference
