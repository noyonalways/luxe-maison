import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { OrderStatus } from '@luxe-maison/shared';

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
        <span className="w-2 h-2 bg-destructive" />
        Order returned
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start min-w-[28rem]">
        {steps.map((step, index) => {
          const completed = index <= current;
          const isCurrent = index === current;

          return (
            <div key={step.status} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-[4.5rem]">
                <motion.div
                  initial={false}
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                  transition={{ duration: 0.25 }}
                  className={`w-9 h-9 flex items-center justify-center border transition-smooth ${
                    completed
                      ? 'border-gold bg-gold text-primary-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  {completed ? <Check size={14} strokeWidth={2.5} /> : <span className="w-1.5 h-1.5 bg-muted-foreground/40" />}
                </motion.div>
                <span
                  className={`text-[10px] mt-2 font-body font-medium letter-wide uppercase text-center ${
                    completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mt-[1.125rem] mx-1 transition-smooth ${
                    index < current ? 'bg-gold' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
