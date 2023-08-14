import { checkSubscription } from '@/lib/subscription';
import { create } from 'zustand';

// export const isProCheck = async() => {
//   const isPro = await checkSubscription();
// }

interface useProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useProModal = create<useProModalStore>((set) => ({
  isOpen: true,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

