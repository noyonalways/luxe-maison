import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductsProvider } from "@/context/ProductsContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import { PopupProvider } from "@/context/PopupContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { RoleProvider } from "@/context/RoleContext";
import { StaffProvider } from "@/context/StaffContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { useState } from "react";

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ProductsProvider>
            <CampaignsProvider>
              <PopupProvider>
                <CustomerProvider>
                  <RoleProvider>
                    <StaffProvider>
                      <SettingsProvider>
                        <Toaster />
                        <Sonner />
                        <Outlet />
                      </SettingsProvider>
                    </StaffProvider>
                  </RoleProvider>
                </CustomerProvider>
              </PopupProvider>
            </CampaignsProvider>
          </ProductsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
