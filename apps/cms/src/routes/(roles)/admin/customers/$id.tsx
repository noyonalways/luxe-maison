import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import CustomerDetailPage from '@/pages/cms/CustomerDetailPage';

export const Route = createFileRoute('/(roles)/admin/customers/$id')({
  beforeLoad: () => requireSectionAccess('admin', 'customers'),
  component: CustomerDetailPage,
});
