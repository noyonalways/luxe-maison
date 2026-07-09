import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { ContentPage, ContentPageSlug } from '@luxe-maison/shared';
import { CONTENT_PAGE_LABELS, CONTENT_PAGE_SLUGS } from '@luxe-maison/shared';
import { useRole } from '@/contexts/role-context';
import { cmsNavPath } from '@/lib/cms-navigation';
import { useStaffUrlRole } from '@/lib/use-staff-url-role';
import { useContentPageQuery } from '@/hooks/content-pages/use-content-page-query';
import { useUpdateContentPageMutation } from '@/hooks/content-pages/use-update-content-page-mutation';
import { useResetContentPageMutation } from '@/hooks/content-pages/use-reset-content-page-mutation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExternalLink, FileText, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';

interface ContentPageEditorProps {
  slug: ContentPageSlug;
}

export default function ContentPageEditor({ slug }: ContentPageEditorProps) {
  const urlRole = useStaffUrlRole();
  const { hasAccess, canEdit, canDelete } = useRole();
  const { data, isLoading } = useContentPageQuery(slug, hasAccess('pages'));
  const updateMutation = useUpdateContentPageMutation(slug);
  const resetMutation = useResetContentPageMutation(slug);
  const [draft, setDraft] = useState<ContentPage | null>(null);

  useEffect(() => {
    if (data) setDraft(structuredClone(data));
  }, [data]);

  if (!hasAccess('pages')) {
    return (
      <div className="text-center py-20">
        <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm">Only admins can manage storefront pages.</p>
      </div>
    );
  }

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading page content…</span>
      </div>
    );
  }

  const canModify = canEdit('pages');
  const canReset = canDelete('pages');
  const pageLabel = CONTENT_PAGE_LABELS[slug];

  const handleSave = async () => {
    if (!canModify) return;
    try {
      await updateMutation.mutateAsync({
        title: draft.title,
        body: draft.body,
        metaDescription: draft.metaDescription,
        published: draft.published,
      });
      toast.success(`${pageLabel} updated`);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleReset = async () => {
    if (!canReset) return;
    try {
      const restored = await resetMutation.mutateAsync();
      setDraft(structuredClone(restored));
      toast.success(`${pageLabel} reset to defaults`);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const isSaving = updateMutation.isPending || resetMutation.isPending;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-body font-medium letter-wider uppercase text-gold mb-1">Pages</p>
          <h1 className="font-heading text-2xl lg:text-3xl font-semibold">{pageLabel}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Content shown at{' '}
            <a
              href={`${STOREFRONT_URL}/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-gold inline-flex items-center gap-1"
            >
              /{slug}
              <ExternalLink size={12} />
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canReset && (
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
              <RotateCcw size={14} className="mr-1.5" />
              Reset
            </Button>
          )}
          {canModify && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CONTENT_PAGE_SLUGS.map((item) => (
          <Link
            key={item}
            {...cmsNavPath(urlRole ?? 'admin', `pages/${item}`)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-smooth ${
              item === slug
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
            }`}
          >
            {CONTENT_PAGE_LABELS[item]}
          </Link>
        ))}
      </div>

      <div className="space-y-6 border border-border rounded-lg bg-background p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="published">Published</Label>
            <p className="text-xs text-muted-foreground">Unpublished pages are hidden on the storefront.</p>
          </div>
          <Switch
            id="published"
            checked={draft.published}
            disabled={!canModify}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Page title</Label>
          <Input
            id="title"
            value={draft.title}
            disabled={!canModify}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta description</Label>
          <Input
            id="metaDescription"
            value={draft.metaDescription ?? ''}
            disabled={!canModify}
            onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
            placeholder="Short description for search engines"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Page content</Label>
          <p className="text-xs text-muted-foreground">
            Use blank lines between paragraphs. Headings can be written on their own line.
          </p>
          <Textarea
            id="body"
            value={draft.body}
            disabled={!canModify}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={22}
            className="font-mono text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
