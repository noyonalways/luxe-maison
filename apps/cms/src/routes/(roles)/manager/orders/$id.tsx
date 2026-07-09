import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import OrderDetailPage from '@/pages/cms/OrderDetailPage';

export const Route = createFileRoute('/(roles)/manager/orders/$id')({
  beforeLoad: () => requireSectionAccess('manager', 'orders'),
  component: OrderDetailPage,
});
