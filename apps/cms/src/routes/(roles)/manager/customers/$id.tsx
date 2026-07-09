import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import CustomerDetailPage from '@/pages/cms/CustomerDetailPage';

export const Route = createFileRoute('/(roles)/manager/customers/$id')({
  beforeLoad: () => requireSectionAccess('manager', 'customers'),
  component: CustomerDetailPage,
});
