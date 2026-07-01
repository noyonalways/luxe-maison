import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import PopupSettings from "@/pages/cms/PopupSettings";

export const Route = createFileRoute("/(roles)/admin/popup")({
  beforeLoad: () => requireSectionAccess("admin", "popup"),
  component: PopupSettings,
});
