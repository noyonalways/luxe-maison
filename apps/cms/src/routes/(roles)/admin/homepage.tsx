import { createFileRoute } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import Homepage from '@/pages/cms/Homepage';

export const Route = createFileRoute('/(roles)/admin/homepage')({
  beforeLoad: () => requireSectionAccess('admin', 'homepage'),
  component: Homepage,
});
