import { createFileRoute, redirect } from '@tanstack/react-router';
import { requireSectionAccess } from '@/lib/route-guards';
import ContentPageEditor from '@/pages/cms/ContentPageEditor';
import { isContentPageSlug } from '@luxe-maison/shared';
import { cmsNavPath } from '@/lib/cms-navigation';

export const Route = createFileRoute('/(roles)/admin/pages/$slug')({
  beforeLoad: ({ params }) => {
    requireSectionAccess('admin', 'pages');
    if (!isContentPageSlug(params.slug)) {
      throw redirect(cmsNavPath('admin', 'pages/privacy'));
    }
  },
  component: ContentPageRoute,
});

function ContentPageRoute() {
  const { slug } = Route.useParams();
  if (!isContentPageSlug(slug)) return null;
  return <ContentPageEditor slug={slug} />;
}
