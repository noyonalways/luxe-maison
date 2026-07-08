import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ProductsProvider } from '@/providers/products-provider';
import { CampaignsProvider } from '@/providers/campaigns-provider';
import { PopupProvider } from '@/providers/popup-provider';
import { CustomerProvider } from '@/providers/customer-provider';
import { RoleProvider } from '@/providers/role-provider';
import { StaffProvider } from '@/providers/staff-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
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
                        {children}
                      </SettingsProvider>
                    </StaffProvider>
                  </RoleProvider>
                </CustomerProvider>
              </PopupProvider>
            </CampaignsProvider>
          </ProductsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}
