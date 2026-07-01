import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useCampaigns } from '@/context/CampaignsContext';

export function CampaignTopBanner() {
  const { getActiveCampaigns } = useCampaigns();
  const activeCampaigns = getActiveCampaigns();
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Show the first non-dismissed active campaign with a discount code
  const banner = activeCampaigns.find(c => c.discountCode && !dismissed.includes(c.id));
  if (!banner) return null;

  const daysLeft = Math.max(0, Math.ceil((new Date(banner.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <AnimatePresence>
      <motion.div
        key={banner.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-foreground text-background overflow-hidden"
      >
        <div className="container mx-auto px-6 lg:px-12 py-2.5 flex items-center justify-center gap-4 text-xs relative">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={12} className="text-gold" />
              {banner.name}
            </span>
            <span className="text-background/60">|</span>
            <span className="flex items-center gap-1.5">
              <Tag size={11} />
              Use code <span className="font-mono font-semibold bg-background/15 px-1.5 py-0.5 rounded">{banner.discountCode}</span>
            </span>
            {daysLeft <= 7 && (
              <>
                <span className="text-background/60">|</span>
                <span className="flex items-center gap-1 text-gold">
                  <Clock size={11} />
                  {daysLeft === 0 ? 'Ends today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                </span>
              </>
            )}
            <Link href="/shop" className="ml-1 underline underline-offset-2 text-background/80 hover:text-background transition-smooth">
              Shop now
            </Link>
          </div>
          <button
            onClick={() => setDismissed(prev => [...prev, banner.id])}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-background/50 hover:text-background transition-smooth"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CampaignCards() {
  const { getActiveCampaigns } = useCampaigns();
  const activeCampaigns = getActiveCampaigns();

  if (activeCampaigns.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <p className="text-xs font-body font-medium letter-wider uppercase text-muted-foreground mb-3">Limited Time</p>
          <h2 className="font-heading text-3xl lg:text-4xl">Active Campaigns</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.map((c, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href="/shop"
                  className="group block relative overflow-hidden bg-foreground text-background rounded transition-smooth hover:shadow-elevated"
                >
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-60" />

                  <div className="relative p-6 lg:p-8">
                    {/* Type badge */}
                    <span className="inline-block px-2.5 py-1 text-[10px] font-semibold letter-wide uppercase bg-primary text-primary-foreground rounded mb-4">
                      {c.type}
                    </span>

                    <h3 className="font-heading text-xl lg:text-2xl mb-2">{c.name}</h3>
                    <p className="text-sm text-background/70 leading-relaxed mb-5 line-clamp-2">{c.description}</p>

                    {/* Discount code */}
                    {c.discountCode && (
                      <div className="flex items-center gap-3 mb-5 p-3 bg-background/10 rounded border border-background/10">
                        <Tag size={14} className="text-gold flex-shrink-0" />
                        <div>
                          <p className="text-[10px] letter-wide uppercase text-background/50">Discount Code</p>
                          <p className="font-mono font-semibold text-sm tracking-wider">{c.discountCode}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-background/10">
                      <span className="flex items-center gap-1.5 text-xs text-background/60">
                        <Clock size={12} />
                        {daysLeft === 0 ? 'Ends today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-2 transition-all">
                        Shop now <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
