"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
import { PopupProvider } from "@/context/PopupContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { AuthProvider } from "@/context/AuthContext";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ReviewsProvider>
                <CampaignsProvider>
                  <PopupProvider>
                    <CustomerProvider>
                      <Toaster />
                      <Sonner />
                      {children}
                    </CustomerProvider>
                  </PopupProvider>
                </CampaignsProvider>
              </ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
