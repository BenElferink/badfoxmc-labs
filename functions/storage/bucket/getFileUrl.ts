import { storage } from '@/utils/firebase'

const getFileUrl = async (fileId: string) => {
  if (!fileId) return ''

  const refList = await storage.ref('/labs').listAll()

  for await (const item of refList.items) {
    if (item.name === fileId) {
      return await item.getDownloadURL()
    }
  }

  return ''
}

export default getFileUrl
