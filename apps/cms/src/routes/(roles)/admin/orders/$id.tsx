import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import OrderDetailPage from '@/pages/cms/OrderDetailPage';

export const Route = createFileRoute('/(roles)/admin/orders/$id')({
  beforeLoad: () => requireSectionAccess('admin', 'orders'),
  component: OrderDetailPage,
});
