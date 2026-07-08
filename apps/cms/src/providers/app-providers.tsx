import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ProductsProvider } from '@/providers/products-provider';
import { CampaignsProvider } from '@/providers/campaigns-provider';
import { NewsletterProvider } from '@/providers/newsletter-provider';
import { DiscountsProvider } from '@/providers/discounts-provider';
import { PopupProvider } from '@/providers/popup-provider';
import { CustomersProvider } from '@/providers/customers-provider';
import { OrdersProvider } from '@/providers/orders-provider';
import { RoleProvider } from '@/providers/role-provider';
import { StaffProvider } from '@/providers/staff-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <AuthProvider>
          <RoleProvider>
            <CustomersProvider>
              <OrdersProvider>
              <PopupProvider>
                <CampaignsProvider>
                  <NewsletterProvider>
                    <DiscountsProvider>
                      <ProductsProvider>
                        <StaffProvider>
                          <SettingsProvider>
                            <Toaster />
                            <Sonner />
                            {children}
                          </SettingsProvider>
                        </StaffProvider>
                      </ProductsProvider>
                    </DiscountsProvider>
                  </NewsletterProvider>
                </CampaignsProvider>
              </PopupProvider>
              </OrdersProvider>
            </CustomersProvider>
          </RoleProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}
