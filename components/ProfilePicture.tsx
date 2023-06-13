const ProfilePicture = (props: { src?: string; size?: number }) => {
  const { src, size = 50 } = props

  return <img src={src} alt='' width={size} height={size} className='rounded-full' />
}

export default ProfilePicture
