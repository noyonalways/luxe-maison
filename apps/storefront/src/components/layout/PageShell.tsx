import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Clears the fixed navbar — apply on the first visible block, not on `<main>`. */
export const NAV_OFFSET = 'pt-20 lg:pt-24';

export function PageMain({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={cn('min-h-screen pb-16', className)}>{children}</main>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <section
      className={cn(
        'bg-gradient-to-b from-cream to-background border-b border-border',
        NAV_OFFSET,
        className,
      )}
    >
      <div
        className={cn(
          'container mx-auto px-6 lg:px-12 py-8 lg:py-12',
          centered && 'max-w-3xl mx-auto text-center',
        )}
      >
        {(eyebrow || title || description) && (
          <div className={centered ? undefined : 'max-w-3xl'}>
            {eyebrow && (
              <p className="text-xs font-body font-medium letter-wider uppercase text-gold mb-2">
                {eyebrow}
              </p>
            )}
            {title && <h1 className="font-heading text-3xl lg:text-4xl">{title}</h1>}
            {description && (
              <p className={cn('text-sm text-muted-foreground mt-2', centered && 'mx-auto')}>
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageBody({
  children,
  className,
  narrow,
  wide,
  offset,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
  /** Use when there is no hero but content still needs navbar clearance. */
  offset?: boolean;
}) {
  return (
    <div
      className={cn(
        'container mx-auto px-6 lg:px-12 py-10 lg:py-14',
        narrow && 'max-w-3xl',
        wide && 'max-w-6xl',
        offset && NAV_OFFSET,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageCenter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PageMain className={cn('bg-gradient-to-b from-cream/60 to-background', className)}>
      <div className={cn(NAV_OFFSET, 'min-h-[calc(100vh-5rem)] flex items-center justify-center px-6')}>
        {children}
      </div>
    </PageMain>
  );
}
