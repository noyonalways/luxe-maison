import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ShieldBan, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useRole } from '@/contexts/role-context';
import { useCustomers } from '@/contexts/customers-context';
import { useCustomerQuery } from '@/hooks/customers/use-customer-query';
import { useOrdersList } from '@/hooks/orders/use-orders-list';
import { CustomerDetailContent } from '@/components/customers/CustomerDetailContent';
import { cmsTo } from '@/lib/cms-navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

export default function CustomerDetailPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { roleSlug, canDelete } = useRole();
  const canDeleteCustomers = canDelete('customers');
  const customersRoute = cmsTo('customers', roleSlug);
  const { setCustomerStatus, isSaving } = useCustomers();
  const { data: customer, isPending, isError } = useCustomerQuery(id ?? '');
  const { data: orders = [] } = useOrdersList(true);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextStatus = customer.status === 'active' ? 'blocked' : 'active';
    try {
      await setCustomerStatus(customer.id, nextStatus);
      toast.success(
        nextStatus === 'blocked' ? `${customer.name} blocked` : `${customer.name} unblocked`,
      );
      setShowBlockConfirm(false);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (!id) {
    return (
      <div className="text-center py-24">
        <h2 className="font-heading text-xl mb-2">Customer not found</h2>
        <p className="text-sm text-muted-foreground mb-6">Invalid customer link.</p>
        <Button variant="outline" onClick={() => navigate(customersRoute)} className="gap-2">
          <ArrowLeft size={14} />
          Back to customers
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading customer…</span>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="text-center py-24">
        <h2 className="font-heading text-xl mb-2">Customer not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This customer may have been removed or the link is invalid.
        </p>
        <Button variant="outline" onClick={() => navigate(customersRoute)} className="gap-2">
          <ArrowLeft size={14} />
          Back to customers
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 mb-6 bg-secondary/95 backdrop-blur border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate(customersRoute)}
              className="mt-0.5 p-2 text-muted-foreground transition-smooth hover-gold shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium letter-wider uppercase text-gold mb-1">Customer</p>
              <h1 className="font-heading text-2xl lg:text-3xl truncate">{customer.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since {format(new Date(customer.joinedAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          {canDeleteCustomers && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setShowBlockConfirm(true)}
            >
              {customer.status === 'active' ? (
                <>
                  <ShieldBan size={14} />
                  Block customer
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  Unblock customer
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <CustomerDetailContent customer={customer} orders={orders} />

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customer.status === 'active' ? 'Block' : 'Unblock'} {customer.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {customer.status === 'active'
                ? 'This customer will be blocked from placing new orders.'
                : 'This customer will be able to place orders again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleToggleStatus()} disabled={isSaving}>
              {customer.status === 'active' ? 'Block' : 'Unblock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
