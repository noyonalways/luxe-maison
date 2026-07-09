import { useEffect, useState } from 'react';
import type { HomepageContent } from '@luxe-maison/shared';
import { useHomepage } from '@/contexts/homepage-context';
import { useRole } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

export default function HomepagePage() {
  const { hasAccess, canEdit, canDelete } = useRole();
  const { content, isLoading, updateHomepage, resetHomepage, isSaving } = useHomepage();
  const [draft, setDraft] = useState<HomepageContent | null>(null);

  useEffect(() => {
    if (content) setDraft(structuredClone(content));
  }, [content]);

  if (!hasAccess('homepage')) {
    return (
      <div className="text-center py-20">
        <Home size={40} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm">Only admins can manage homepage content.</p>
      </div>
    );
  }

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading homepage content…</span>
      </div>
    );
  }

  const canModify = canEdit('homepage');
  const canReset = canDelete('homepage');

  const handleSave = async () => {
    if (!canModify) return;
    try {
      await updateHomepage(draft);
      toast.success('Homepage updated');
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleReset = async () => {
    if (!canReset) return;
    try {
      await resetHomepage();
      toast.success('Homepage reset to defaults');
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl">Homepage</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage storefront homepage sections</p>
        </div>
        <div className="flex items-center gap-2">
          {canReset && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving} className="gap-1.5">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              Reset
            </Button>
          )}
          {canModify && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="mb-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          {draft.heroSlides.map((slide, index) => (
            <section key={slide.id} className="bg-background border border-border rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Slide {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hero-enabled-${slide.id}`}>Enabled</Label>
                  <Switch
                    id={`hero-enabled-${slide.id}`}
                    checked={slide.enabled}
                    disabled={!canModify}
                    onCheckedChange={(enabled) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, enabled };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Eyebrow</Label>
                  <Input
                    value={slide.eyebrow}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, eyebrow: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={slide.imageUrl}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, imageUrl: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={slide.title}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, title: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title Highlight</Label>
                  <Input
                    value={slide.titleHighlight ?? ''}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, titleHighlight: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={slide.description}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, description: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input
                    value={slide.ctaText}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, ctaText: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input
                    value={slide.ctaLink}
                    disabled={!canModify}
                    onChange={(event) => {
                      const heroSlides = [...draft.heroSlides];
                      heroSlides[index] = { ...slide, ctaLink: event.target.value };
                      setDraft({ ...draft, heroSlides });
                    }}
                  />
                </div>
              </div>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <section className="bg-background border border-border rounded p-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Section Eyebrow</Label>
              <Input
                value={draft.categoriesSection.eyebrow}
                disabled={!canModify}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    categoriesSection: { ...draft.categoriesSection, eyebrow: event.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={draft.categoriesSection.title}
                disabled={!canModify}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    categoriesSection: { ...draft.categoriesSection, title: event.target.value },
                  })
                }
              />
            </div>
          </section>

          {draft.categoryTiles.map((tile, index) => (
            <section key={tile.id} className="bg-background border border-border rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{tile.name}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`tile-enabled-${tile.id}`}>Enabled</Label>
                  <Switch
                    id={`tile-enabled-${tile.id}`}
                    checked={tile.enabled}
                    disabled={!canModify}
                    onCheckedChange={(enabled) => {
                      const categoryTiles = [...draft.categoryTiles];
                      categoryTiles[index] = { ...tile, enabled };
                      setDraft({ ...draft, categoryTiles });
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={tile.name}
                    disabled={!canModify}
                    onChange={(event) => {
                      const categoryTiles = [...draft.categoryTiles];
                      categoryTiles[index] = { ...tile, name: event.target.value };
                      setDraft({ ...draft, categoryTiles });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={tile.imageUrl}
                    disabled={!canModify}
                    onChange={(event) => {
                      const categoryTiles = [...draft.categoryTiles];
                      categoryTiles[index] = { ...tile, imageUrl: event.target.value };
                      setDraft({ ...draft, categoryTiles });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={tile.description}
                    disabled={!canModify}
                    onChange={(event) => {
                      const categoryTiles = [...draft.categoryTiles];
                      categoryTiles[index] = { ...tile, description: event.target.value };
                      setDraft({ ...draft, categoryTiles });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link</Label>
                  <Input
                    value={tile.link}
                    disabled={!canModify}
                    onChange={(event) => {
                      const categoryTiles = [...draft.categoryTiles];
                      categoryTiles[index] = { ...tile, link: event.target.value };
                      setDraft({ ...draft, categoryTiles });
                    }}
                  />
                </div>
              </div>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="story" className="space-y-4">
          <section className="bg-background border border-border rounded p-5 grid gap-4">
            {(['eyebrow', 'title', 'description', 'ctaText', 'ctaLink'] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                {field === 'description' ? (
                  <Textarea
                    value={draft.storySection[field]}
                    disabled={!canModify}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        storySection: { ...draft.storySection, [field]: event.target.value },
                      })
                    }
                  />
                ) : (
                  <Input
                    value={draft.storySection[field]}
                    disabled={!canModify}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        storySection: { ...draft.storySection, [field]: event.target.value },
                      })
                    }
                  />
                )}
              </div>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <section className="bg-background border border-border rounded p-5 grid gap-4">
            {(['title', 'description', 'placeholder', 'buttonText'] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                {field === 'description' ? (
                  <Textarea
                    value={draft.newsletterSection[field]}
                    disabled={!canModify}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        newsletterSection: { ...draft.newsletterSection, [field]: event.target.value },
                      })
                    }
                  />
                ) : (
                  <Input
                    value={draft.newsletterSection[field]}
                    disabled={!canModify}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        newsletterSection: { ...draft.newsletterSection, [field]: event.target.value },
                      })
                    }
                  />
                )}
              </div>
            ))}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
