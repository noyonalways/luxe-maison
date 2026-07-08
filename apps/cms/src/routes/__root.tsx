import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppProviders } from "@/providers/app-providers";

function RootComponent() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
