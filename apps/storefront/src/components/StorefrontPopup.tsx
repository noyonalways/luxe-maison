import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Percent, Megaphone, Copy, Check } from 'lucide-react';
import { usePopup, type PopupConfig, type PopupType } from '@/context/PopupContext';
import { Button } from '@/components/ui/button';

const TYPE_ICONS: Record<PopupType, React.ElementType> = {
  welcome: Gift,
  discount: Percent,
  campaign: Megaphone,
};

const DISMISSED_KEY = 'dismissed_popups';

function getDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dismiss(id: string) {
  const set = getDismissed();
  set.add(id);
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

export default function StorefrontPopup() {
  const { getActivePopups } = usePopup();
  const [currentPopup, setCurrentPopup] = useState<PopupConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shownRef = useRef(false);

  const showNext = useCallback(() => {
    const dismissed = getDismissed();
    const active = getActivePopups().filter(p => !dismissed.has(p.id));
    if (active.length === 0) return null;
    return active[0];
  }, [getActivePopups]);

  // Page load & delay triggers
  useEffect(() => {
    if (shownRef.current) return;
    const popup = showNext();
    if (!popup) return;

    if (popup.trigger === 'page_load') {
      const t = setTimeout(() => { setCurrentPopup(popup); setOpen(true); shownRef.current = true; }, 1200);
      return () => clearTimeout(t);
    }
    if (popup.trigger === 'delay_10s') {
      const t = setTimeout(() => { setCurrentPopup(popup); setOpen(true); shownRef.current = true; }, 10000);
      return () => clearTimeout(t);
    }

    // exit_intent
    if (popup.trigger === 'exit_intent') {
      const handler = (e: MouseEvent) => {
        if (e.clientY < 10 && !shownRef.current) {
          setCurrentPopup(popup);
          setOpen(true);
          shownRef.current = true;
        }
      };
      document.addEventListener('mousemove', handler);
      return () => document.removeEventListener('mousemove', handler);
    }

    // scroll_50
    if (popup.trigger === 'scroll_50') {
      const handler = () => {
        const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if (scrolled >= 0.5 && !shownRef.current) {
          setCurrentPopup(popup);
          setOpen(true);
          shownRef.current = true;
        }
      };
      window.addEventListener('scroll', handler, { passive: true });
      return () => window.removeEventListener('scroll', handler);
    }
  }, [showNext]);

  const handleClose = () => {
    setOpen(false);
    if (currentPopup) dismiss(currentPopup.id);
  };

  const handleCopy = () => {
    if (!currentPopup?.discountCode) return;
    navigator.clipboard.writeText(currentPopup.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentPopup) return null;

  const Icon = TYPE_ICONS[currentPopup.type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-background rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-primary via-gold-light to-primary" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-8 text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon size={24} className="text-primary" />
              </div>

              <h2 className="font-heading text-2xl lg:text-3xl mb-3">{currentPopup.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs mx-auto">
                {currentPopup.message}
              </p>

              {currentPopup.discountCode && (
                <div className="mb-6 inline-flex items-center gap-2 bg-secondary border border-border rounded-md px-4 py-2.5">
                  <span className="font-mono font-semibold text-lg tracking-wider text-foreground">
                    {currentPopup.discountCode}
                  </span>
                  <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy code">
                    {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href={currentPopup.ctaLink} onClick={handleClose}>
                    {currentPopup.ctaText}
                  </Link>
                </Button>
                <button onClick={handleClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  No thanks, I'll pass
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
