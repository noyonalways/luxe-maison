import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import OrderDetailPage from '@/pages/cms/OrderDetailPage';

export const Route = createFileRoute('/(roles)/employee/orders/$id')({
  beforeLoad: () => requireSectionAccess('employee', 'orders'),
  component: OrderDetailPage,
});
