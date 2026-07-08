import { useCallback, useState, type ReactNode } from 'react';
import { PopupContext, type PopupConfig } from '@/contexts/popup-context';

const defaultPopups: PopupConfig[] = [
  {
    id: 'default-welcome',
    type: 'welcome',
    enabled: true,
    title: 'Welcome! Enjoy 15% Off',
    message: 'Sign up or shop now to get an exclusive 15% discount on your first order. Use the code below at checkout.',
    discountCode: 'WELCOME15',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    trigger: 'page_load',
    priority: 10,
  },
  {
    id: 'default-discount',
    type: 'discount',
    enabled: false,
    title: 'Flash Sale — 20% Off Everything!',
    message: 'For a limited time, enjoy 20% off all items. Don\'t miss out on this exclusive deal!',
    discountCode: 'FLASH20',
    ctaText: 'Grab the Deal',
    ctaLink: '/shop',
    trigger: 'delay_10s',
    priority: 20,
  },
  {
    id: 'default-campaign',
    type: 'campaign',
    enabled: false,
    title: 'Spring Collection is Here',
    message: 'Discover our latest Spring/Summer collection with fresh styles and exclusive pieces.',
    discountCode: '',
    ctaText: 'Explore Collection',
    ctaLink: '/shop?badge=New+Arrival',
    trigger: 'scroll_50',
    priority: 5,
  },
];

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<PopupConfig[]>(defaultPopups);

  const addPopup = useCallback((popup: PopupConfig) => {
    setPopups((prev) => [...prev, popup]);
  }, []);

  const updatePopup = useCallback((id: string, partial: Partial<PopupConfig>) => {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  }, []);

  const deletePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getActivePopups = useCallback(() => {
    return popups.filter((p) => p.enabled).sort((a, b) => b.priority - a.priority);
  }, [popups]);

  return (
    <PopupContext.Provider value={{ popups, addPopup, updatePopup, deletePopup, getActivePopups }}>
      {children}
    </PopupContext.Provider>
  );
}
