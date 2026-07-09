import { useEffect, useMemo, useState } from 'react';
import type { HeroSlide } from '@luxe-maison/shared';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveStorefrontAssetUrl } from '@/lib/homepage-preview';

interface HeroSlidePreviewProps {
  slides: HeroSlide[];
  activeSlideId?: string | null;
  onActiveSlideChange?: (slideId: string) => void;
}

export function HeroSlidePreview({ slides, activeSlideId, onActiveSlideChange }: HeroSlidePreviewProps) {
  const previewSlides = useMemo(
    () => [...slides].filter((slide) => slide.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [slides],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (previewSlides.length === 0) {
      setIndex(0);
      return;
    }

    if (activeSlideId) {
      const nextIndex = previewSlides.findIndex((slide) => slide.id === activeSlideId);
      if (nextIndex >= 0) {
        setIndex(nextIndex);
        return;
      }
    }

    setIndex((current) => Math.min(current, previewSlides.length - 1));
  }, [previewSlides, activeSlideId]);

  const goTo = (nextIndex: number) => {
    if (previewSlides.length === 0) return;
    const wrapped = (nextIndex + previewSlides.length) % previewSlides.length;
    setIndex(wrapped);
    onActiveSlideChange?.(previewSlides[wrapped]!.id);
  };

  if (previewSlides.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">No enabled slides to preview.</p>
        <p className="text-xs text-muted-foreground mt-1">Add a slide or enable an existing one.</p>
      </section>
    );
  }

  const slide = previewSlides[index]!;
  const imageSrc = resolveStorefrontAssetUrl(slide.imageUrl);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Hero Preview</h3>
          <p className="text-xs text-muted-foreground">How this slide appears on the storefront</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(index - 1)}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[4rem] text-center">
            {index + 1} / {previewSlides.length}
          </span>
          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(index + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border aspect-[16/7] bg-foreground">
        {imageSrc ? (
          <img src={imageSrc} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-foreground/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="relative flex h-full items-center px-6 lg:px-10">
          <div className="max-w-md text-background">
            <p className="text-[10px] font-medium uppercase tracking-wider text-background/70 mb-2">
              {slide.eyebrow || 'Eyebrow'}
            </p>
            <h4 className="font-heading text-2xl lg:text-3xl font-semibold leading-tight mb-3">
              {slide.title || 'Title'}
              {slide.titleHighlight && (
                <>
                  <br />
                  {slide.titleHighlight}
                </>
              )}
            </h4>
            <p className="text-xs lg:text-sm text-background/80 leading-relaxed mb-4 line-clamp-3">
              {slide.description || 'Description will appear here.'}
            </p>
            <span className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
              {slide.ctaText || 'CTA'} <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {previewSlides.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(itemIndex)}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              itemIndex === index ? 'bg-foreground' : 'bg-border hover:bg-muted-foreground'
            }`}
            aria-label={`Preview slide ${itemIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
