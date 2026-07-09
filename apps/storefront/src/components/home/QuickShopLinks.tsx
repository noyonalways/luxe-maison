import Link from 'next/link';

const links = [
  { href: '/shop/women', label: 'Women' },
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/kids', label: 'Kids' },
  { href: '/shop?badge=New+Arrival', label: 'New arrivals' },
  { href: '/shop?sort=popular', label: 'Best sellers' },
];

export function QuickShopLinks() {
  return (
    <section className="py-6 border-b border-border bg-background" aria-label="Quick shop">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <span className="text-[11px] font-medium letter-wider uppercase text-muted-foreground mr-1">
            Shop
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-4 py-2 text-xs font-medium text-foreground transition-smooth hover:border-gold hover:bg-gold/10 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
