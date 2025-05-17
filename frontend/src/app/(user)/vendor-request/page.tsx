import React from 'react';
import { cookies } from 'next/headers';
import { VendorBenefits } from "@/app/(user)/vendor-request/_components/VendorBenefits";
import { VendorOnboardingSteps } from "@/app/(user)/vendor-request/_components/VendorOnboardingSteps";
import { VendorStats } from "@/app/(user)/vendor-request/_components/VendorStats";
import { VendorFAQ } from "@/app/(user)/vendor-request/_components/VendorFAQ";
import { Sparkles, Store } from "lucide-react";
import { VendorActions } from "@/api-actions/vendor-actions";
import VendorRequestClient from './_components/VendorRequestClient';
import { CommissionStructure } from './_components/CommissionStructure';
import { notFound } from "next/navigation";

export default async function VendorRequestPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Try to get current vendor profile to check if the user is already a vendor
  let vendorData = null;
  let vendorError = null;
  try {
    const vendorResponse = await VendorActions.getVendorProfile(allCookies);
    console.log(vendorResponse)
    // Process vendor data if available
    if (vendorResponse.data) {
      vendorData = vendorResponse.data;
    }
  } catch (error: any) {
    // Only capture 404 errors (user is not a vendor yet)
    if (error?.response?.status === 404) {
      vendorError = 'not_found';
    } else if (!error?.response?.status) {
      // If there's another type of error (like unauthorized), redirect to login or error page
      return notFound();
    }
  }  return (
    <div className="container mx-auto px-4 pb-24">      
      {/* Hero Section with Animated Gradient */}
      <div className="relative py-20 mb-16 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/20"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">Exclusive Fashion Partner Opportunity</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <Store className="h-14 w-14 text-primary relative" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-primary">
                Fashion Partner Portal
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
            Grow your apparel business by selling your fashion collections on our marketplace and reach millions of style-conscious customers across India.
          </p>
        </div>
      </div>

      <section id="stats-section" className="mb-24 scroll-mt-24">
        <VendorStats />
      </section>
      
      <section id="registration-section" className="mb-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <VendorRequestClient vendorData={vendorData} vendorError={vendorError} />
            </div>
            <div className="space-y-8">
              <CommissionStructure />
            </div>
          </div>
        </div>
      </section>
      
      <section id="onboarding-section" className="mb-24 scroll-mt-24 bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16 rounded-3xl">
        <VendorOnboardingSteps />
      </section>
      
      <section id="benefits-section" className="mb-24 scroll-mt-24">
        <VendorBenefits />
      </section>
      
      <section id="faq-section" className="bg-gradient-to-br from-background via-primary/5 to-background py-16 rounded-3xl">
        <VendorFAQ />
      </section>
    </div>
  );
}
