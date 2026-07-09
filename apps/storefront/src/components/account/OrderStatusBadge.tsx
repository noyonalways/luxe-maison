import type { OrderStatus } from '@luxe-maison/shared';
import { STATUS_LABELS, STATUS_STYLES } from '@/components/account/account-utils';

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-body font-semibold letter-wide uppercase border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
