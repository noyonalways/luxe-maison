import { Suspense } from "react";
import StorefrontLayout from "@/components/StorefrontLayout";
import TrackOrderPage from "@/views/TrackOrderPage";
import { Loader2 } from "lucide-react";
import { PageCenter } from "@/components/layout/PageShell";

function TrackOrderFallback() {
  return (
    <PageCenter>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading tracking…</span>
      </div>
    </PageCenter>
  );
}

export default function TrackOrder() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<TrackOrderFallback />}>
        <TrackOrderPage />
      </Suspense>
    </StorefrontLayout>
  );
}
