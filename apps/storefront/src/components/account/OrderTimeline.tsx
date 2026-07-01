import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { OrderStatus } from '@/data/admin-types';

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Placed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  returned: -1,
};

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = statusIndex[status];

  if (status === 'returned') {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive font-medium">
        <span className="w-3 h-3 rounded-full bg-destructive" />
        Returned
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-md">
      {steps.map((step, i) => {
        const completed = i <= current;
        const isCurrent = i === current;
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  backgroundColor: completed ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
              >
                {completed ? (
                  <Check size={14} className="text-primary-foreground" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                )}
              </motion.div>
              <span className={`text-[11px] mt-1.5 font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full" style={{
                backgroundColor: i < current ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
