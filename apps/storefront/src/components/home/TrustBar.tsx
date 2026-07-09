import { Truck, RefreshCw, ShieldCheck, Headphones } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Complimentary shipping', detail: 'On orders over $150' },
  { icon: RefreshCw, label: 'Easy returns', detail: '30-day hassle-free' },
  { icon: ShieldCheck, label: 'Secure checkout', detail: 'Protected payments' },
  { icon: Headphones, label: 'Style support', detail: 'Mon-Fri, 9am-6pm' },
];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-cream/40" aria-label="Store benefits">
      <div className="container mx-auto px-6 lg:px-12 py-5 lg:py-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="flex items-start gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background border border-border text-gold">
                <Icon size={16} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
