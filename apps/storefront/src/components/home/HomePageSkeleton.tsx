export function HomePageSkeleton() {
  return (
    <main className="animate-pulse">
      <section className="relative h-[100svh] bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/20 to-transparent" />
        <div className="relative container mx-auto px-6 lg:px-12 pt-28 lg:pt-32 max-w-lg space-y-4">
          <div className="h-3 w-24 bg-background/30 rounded" />
          <div className="h-12 w-full bg-background/25 rounded" />
          <div className="h-12 w-4/5 bg-background/20 rounded" />
          <div className="h-4 w-full bg-background/15 rounded" />
          <div className="h-4 w-2/3 bg-background/15 rounded" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-36 bg-background/30 rounded" />
            <div className="h-11 w-28 bg-background/20 rounded" />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-cream/50">
        <div className="container mx-auto px-6 lg:px-12 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-8 w-48 bg-muted rounded mb-8 mx-auto" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-muted rounded-sm mb-3" />
                <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-1/3 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
