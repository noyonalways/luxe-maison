import Link from 'next/link';
import { contentPagePath } from '@luxe-maison/shared';
import { getCmsUrl } from '@/lib/cms-url';

const shopLinks = [
  { label: 'Men', href: '/shop/men' },
  { label: 'Women', href: '/shop/women' },
  { label: 'Kids', href: '/shop/kids' },
  { label: 'New Arrivals', href: '/shop?badge=New+Arrival' },
] as const;

const companyLinks = [
  { label: 'Our Story', href: contentPagePath('our-story') },
  { label: 'Craftsmanship', href: contentPagePath('craftsmanship') },
  { label: 'Sustainability', href: contentPagePath('sustainability') },
  { label: 'Careers', href: contentPagePath('careers') },
] as const;

const supportLinks = [
  { label: 'Sizing Guide', href: contentPagePath('sizing-guide') },
  { label: 'Shipping & Returns', href: contentPagePath('shipping-returns') },
  { label: 'Care Instructions', href: contentPagePath('care-instructions') },
  { label: 'Contact Us', href: contentPagePath('contact') },
  { label: 'Track Order', href: '/track-order' },
] as const;

const legalLinks = [
  { label: 'Privacy', href: contentPagePath('privacy') },
  { label: 'Terms', href: contentPagePath('terms') },
  { label: 'Cookies', href: contentPagePath('cookies') },
] as const;

export default function Footer() {
  const cmsUrl = getCmsUrl();

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
            <nav className="flex flex-col gap-2.5" aria-label="Shop">
              {shopLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm opacity-60 transition-smooth hover:opacity-100">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="text-xs font-body font-semibold letter-wide uppercase mb-4 opacity-80">Company</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Company">
              {companyLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm opacity-60 transition-smooth hover:opacity-100">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="text-xs font-body font-semibold letter-wide uppercase mb-4 opacity-80">Support</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Support">
              {supportLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm opacity-60 transition-smooth hover:opacity-100">
                  {item.label}
                </Link>
              ))}
              <a
                href={`${cmsUrl}/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm opacity-40 transition-smooth hover:opacity-80 mt-2"
              >
                Store Manager →
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">© 2026 MAISON. All rights reserved.</p>
          <nav className="flex gap-6" aria-label="Legal">
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs opacity-40 transition-smooth hover:opacity-80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
