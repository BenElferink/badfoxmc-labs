import { storage } from '@/utils/firebase'

const deleteFile = async (fileUrl: string) => {
  if (!fileUrl) return

  const fileId = fileUrl.split('?')[0].split('/labs%2F')[1]

  await storage.ref(`/labs/${fileId}`).delete()
}

export default deleteFile
