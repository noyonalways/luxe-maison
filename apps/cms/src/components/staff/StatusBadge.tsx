export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-gray-50 text-gray-600 border-gray-200',
    archived: 'bg-red-50 text-red-700 border-red-200',
    unsubscribed: 'bg-muted text-muted-foreground border-border',
    expired: 'bg-red-50 text-red-700 border-red-200',
    disabled: 'bg-muted text-muted-foreground border-border',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    ended: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-semibold letter-wide uppercase border rounded ${styles[status] || 'bg-secondary text-muted-foreground border-border'}`}
    >
      {status}
    </span>
  );
}
