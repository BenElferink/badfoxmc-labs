const formatIpfsReference = (str: string) => {
  if (!str) {
    return {
      ipfs: '',
      url: '',
    }
  }

  const ipfs = str.indexOf('ipfs://') === 0 ? str : `ipfs://${str}`
  const url = ipfs.replace('ipfs://', 'https://image-optimizer.jpgstoreapis.com/')

  return {
    ipfs,
    url,
  }
}

export default formatIpfsReference
