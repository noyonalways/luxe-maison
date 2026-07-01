"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MiniCart from "@/components/cart/MiniCart";
import { CampaignTopBanner } from "@/components/CampaignBanner";
import StorefrontPopup from "@/components/StorefrontPopup";
import type { ReactNode } from "react";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CampaignTopBanner />
      <Navbar />
      <MiniCart />
      <StorefrontPopup />
      {children}
      <Footer />
    </>
  );
}
