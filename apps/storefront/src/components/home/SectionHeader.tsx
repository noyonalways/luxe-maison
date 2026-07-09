import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  align?: 'left' | 'center';
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'inverted';
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  align = 'left',
  viewAllHref,
  viewAllLabel = 'View All',
  className,
  actions,
  variant = 'default',
}: SectionHeaderProps) {
  const centered = align === 'center';
  const inverted = variant === 'inverted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className={cn(
        'mb-10 lg:mb-12',
        centered ? 'text-center' : 'flex flex-col md:flex-row md:items-end md:justify-between gap-4',
        className,
      )}
    >
      <div className={cn(centered && 'mx-auto max-w-xl')}>
        {(eyebrow || Icon) && (
          <div
            className={cn(
              'flex items-center gap-2 mb-2',
              centered && 'justify-center',
            )}
          >
            {Icon && <Icon size={14} className="text-gold shrink-0" />}
            {eyebrow && (
              <p className="text-xs font-body font-medium letter-wider uppercase text-gold">
                {eyebrow}
              </p>
            )}
          </div>
        )}
        <h2
          className={cn(
            'font-heading text-2xl sm:text-3xl lg:text-4xl text-balance',
            inverted && 'text-background',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'text-sm mt-2 leading-relaxed',
              inverted ? 'text-background/50' : 'text-muted-foreground',
              centered ? 'mx-auto' : 'max-w-lg',
            )}
          >
            {description}
          </p>
        )}
        {viewAllHref && centered && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold mt-4"
          >
            {viewAllLabel} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {(actions || (viewAllHref && !centered)) && (
        <div className="flex items-center gap-3 shrink-0">
          {viewAllHref && !centered && (
            <Link
              href={viewAllHref}
              className="text-sm font-medium text-foreground underline underline-offset-4 transition-smooth hover-gold hidden sm:inline-flex items-center gap-1"
            >
              {viewAllLabel} <ArrowRight size={14} />
            </Link>
          )}
          {actions}
        </div>
      )}
    </motion.div>
  );
}
