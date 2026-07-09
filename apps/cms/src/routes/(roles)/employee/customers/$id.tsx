import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import CustomerDetailPage from '@/pages/cms/CustomerDetailPage';

export const Route = createFileRoute('/(roles)/employee/customers/$id')({
  beforeLoad: () => requireSectionAccess('employee', 'customers'),
  component: CustomerDetailPage,
});
