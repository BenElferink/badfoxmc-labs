import { useAuth } from '@/contexts/AuthContext';
import TextFrown from '@/components/TextFrown';

const ErrorNotConnected = (props: { onClose?: () => void }) => {
  const { onClose } = props;
  const { toggleConnectModal } = useAuth();

  return (
    <div className='mx-auto flex flex-col items-center justify-center'>
      <TextFrown text="You're not connected" className='mt-[10vh] mb-2' />

      <div className='max-w-[350px] w-full rounded-lg bg-gradient-to-b from-purple-500 via-blue-500 to-green-500'>
        <button
          onClick={() => {
            toggleConnectModal(true);
            if (onClose) onClose();
          }}
          className='w-full p-4 flex items-center justify-center rounded-lg bg-opacity-50 hover:bg-opacity-50 bg-zinc-700 hover:bg-zinc-500'
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default ErrorNotConnected;
