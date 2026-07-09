import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div>
            <h3 className="font-heading text-2xl font-semibold mb-4">MAISON</h3>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs">
              Curating premium fashion for men, women, and kids since 2020.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-body font-semibold letter-wide uppercase mb-4 opacity-80">Shop</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Men', href: '/shop/men' },
                { label: 'Women', href: '/shop/women' },
                { label: 'Kids', href: '/shop/kids' },
                { label: 'New Arrivals', href: '/shop?badge=New+Arrival' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-sm opacity-60 transition-smooth hover:opacity-100">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-body font-semibold letter-wide uppercase mb-4 opacity-80">Company</h4>
            <div className="flex flex-col gap-2.5">
              {['Our Story', 'Craftsmanship', 'Sustainability', 'Careers'].map(item => (
                <span key={item} className="text-sm opacity-60 cursor-pointer transition-smooth hover:opacity-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-body font-semibold letter-wide uppercase mb-4 opacity-80">Support</h4>
            <div className="flex flex-col gap-2.5">
              {['Sizing Guide', 'Shipping & Returns', 'Care Instructions', 'Contact Us'].map(item => (
                <span key={item} className="text-sm opacity-60 cursor-pointer transition-smooth hover:opacity-100">
                  {item}
                </span>
              ))}
              <Link href="/track-order" className="text-sm opacity-60 cursor-pointer transition-smooth hover:opacity-100">
                Track Order
              </Link>
              <Link href="/admin" className="text-sm opacity-40 cursor-pointer transition-smooth hover:opacity-80 mt-2">
                Store Manager →
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">© 2026 MAISON. All rights reserved.</p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/cookies' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs opacity-40 transition-smooth hover:opacity-80"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
