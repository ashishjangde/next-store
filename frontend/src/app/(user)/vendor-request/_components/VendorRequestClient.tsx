"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CreateVendorSchema , CreateVendorInput } from "@/schema/vendor-schema";
import { VendorActions } from "@/api-actions/vendor-actions";
import { extractErrorMessage } from "@/utils/error-utils";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Store as StoreIcon, CheckCircle, RotateCw, CheckCircle2, AlertCircle, BanIcon, Clock, Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface VendorRequestClientProps {
  vendorData: IVendor | null;
  vendorError: string | null;
}

export default function VendorRequestClient({ 
  vendorData, 
  vendorError 
}: VendorRequestClientProps) {
  const [showForm, setShowForm] = useQueryState("showForm", { 
    defaultValue: "false",
    parse: (value) => value === "true" ? "true" : "false"
  });
  // Determine what to display based on vendor status
  const renderVendorStatus = () => {
    if (vendorError === 'not_found') {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 rounded-lg border border-primary/20 shadow-lg relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/60 via-primary/80 to-primary/30"></div>
          <div className="absolute -top-28 -right-28 w-56 h-56 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>

          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-md"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-full shadow-inner">
                <StoreIcon className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-primary to-primary-foreground/90 bg-clip-text text-transparent">
              Become a Fashion Partner
            </h2>
            <p className="text-muted-foreground max-w-lg text-lg">
              Join our growing community of fashion vendors and showcase your unique apparel collections to millions of style-conscious customers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="flex flex-col items-center p-5 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent mb-1">10M+</div>
              <div className="text-sm text-muted-foreground text-center">Active Shoppers</div>
            </div>
            <div className="flex flex-col items-center p-5 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent mb-1">₹2.5Cr+</div>
              <div className="text-sm text-muted-foreground text-center">Monthly Sales</div>
            </div>
            <div className="flex flex-col items-center p-5 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent mb-1">7 Days</div>
              <div className="text-sm text-muted-foreground text-center">Payment Cycle</div>
            </div>
          </div>

          <Button 
            onClick={() => setShowForm("true")}
            size="lg" 
            className="w-full sm:w-auto relative z-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md group"
          >
            Register as a Fashion Partner
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      );
    }    if (vendorData) {
      const statusConfig = {
        PENDING: {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: "Application Under Review",
          description: "Your fashion partner application is currently being reviewed by our team. This usually takes 1-2 business days.",
          bg: "bg-amber-50/50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-900/50",
          titleGradient: "from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600",
          buttonText: "Application Status: Pending",
          buttonIcon: <RotateCw className="ml-2 h-4 w-4" />,
          buttonAction: () => {},          
          buttonVariant: "outline" as const,
          buttonClass: "bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 pointer-events-none"
        },
        APPROVED: {
          icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
          title: "Application Approved!",
          description: "Congratulations! Your fashion partner application has been approved. You can now start setting up your apparel store.",
          bg: "bg-emerald-50/50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-900/50",
          titleGradient: "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600",
          buttonText: "Go to Fashion Dashboard",
          buttonIcon: <StoreIcon className="ml-2 h-4 w-4" />,
          buttonAction: () => window.location.href = "/vendor/dashboard",
          buttonVariant: "default" as const,
          buttonClass: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        },
        REJECTED: {
          icon: <AlertCircle className="h-12 w-12 text-rose-500" />,
          title: "Application Rejected",
          description: "Unfortunately, your fashion partner application was rejected. You can reapply with updated information.",
          bg: "bg-rose-50/50 dark:bg-rose-900/20", 
          border: "border-rose-200 dark:border-rose-900/50",
          titleGradient: "from-rose-500 to-rose-700 dark:from-rose-400 dark:to-rose-600",
          buttonText: "Reapply",
          buttonIcon: <ArrowRight className="ml-2 h-4 w-4" />,
          buttonAction: () => setShowForm("true"),
          buttonVariant: "default" as const,
          buttonClass: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
        },
        SUSPENDED: {
          icon: <BanIcon className="h-12 w-12 text-slate-500" />,
          title: "Account Suspended",
          description: "Your fashion partner account has been suspended. Please contact customer support for assistance.",
          bg: "bg-slate-50/50 dark:bg-slate-900/20",
          border: "border-slate-200 dark:border-slate-900/50",
          titleGradient: "from-slate-500 to-slate-700 dark:from-slate-400 dark:to-slate-600",
          buttonText: "Contact Support",
          buttonIcon: <ArrowRight className="ml-2 h-4 w-4" />,
          buttonAction: () => window.location.href = "/contact",
          buttonVariant: "outline" as const,
          buttonClass: "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:hover:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700"
        }
      };

      const status = vendorData.status as keyof typeof statusConfig;
      const config = statusConfig[status];

      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className={`p-8 rounded-lg border shadow-lg ${config.bg} ${config.border} relative overflow-hidden`}
        >
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            <div className="shrink-0">
              <div className={`rounded-full p-7 ${config.bg} shadow-inner relative group`}>
                <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {config.icon}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className={`text-3xl font-bold mb-3 bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
                {config.title}
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                {config.description}
              </p>
              
              <Button 
                variant={config.buttonVariant}
                onClick={config.buttonAction}
                className={`${config.buttonClass} shadow-md relative overflow-hidden group`}
              >
                <span className="relative z-10 flex items-center">
                  {config.buttonText}
                  {config.buttonIcon && (
                    <span className="inline-block group-hover:translate-x-0.5 transition-transform">
                      {config.buttonIcon}
                    </span>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Fallback if no data or error
    return null;
  };

  return (
    <div id="registration-section" className="max-w-4xl mx-auto">
      {showForm === "true" && vendorError === 'not_found' ? (
        <VendorRegistrationForm onCancel={() => setShowForm("false")} />
      ) : (
        renderVendorStatus()
      )}
    </div>
  );
}

interface VendorRegistrationFormProps {
  onCancel?: () => void;
}

function VendorRegistrationForm({ onCancel }: VendorRegistrationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<CreateVendorInput>({
    resolver: zodResolver(CreateVendorSchema),
    defaultValues: {
      gst_number: "",
      pan_number: "",
      shop_name: "",
      shop_address: "",
      phone_number: "",
    },
  });

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: (data: CreateVendorInput) => VendorActions.registerAsVendor(data),
    onSuccess: () => {
      toast({
        title: "Fashion Partner Registration Successful",
        description: "Your application has been submitted for review.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: CreateVendorInput) {
    mutate(data);
  }
  if (isSuccess) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-emerald-200 dark:border-emerald-900/30 shadow-lg relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl"></div>
        
        <div className="rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800/30 dark:to-emerald-900/20 p-7 mb-6 shadow-inner relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse"></div>
          <CheckCircle className="h-14 w-14 text-emerald-600 dark:text-emerald-400 relative" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent relative z-10">
          Application Submitted!
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md relative z-10">
          Your fashion partner application has been submitted successfully and is pending review.
          We will notify you once your application is approved.
        </p>
        
        <Button 
          asChild
          variant="default"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg relative z-10"
        >
          <a href="/">Return to Home</a>
        </Button>
      </motion.div>
    );
  }
    return (    
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-card shadow-lg relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/60 via-primary/80 to-primary/30"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
      
      <div className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 md:px-8 py-5 flex items-center justify-between relative z-10">
        {onCancel && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 hover:bg-primary/10" 
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-full shadow-inner">
            <StoreIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary-foreground/90 bg-clip-text text-transparent">
            Fashion Partner Registration
          </h2>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="p-6 md:p-8 relative z-10">
        <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoLTZ2LTZoNnYtNmg2djZoNnY2aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <p className="relative z-10 text-muted-foreground">
            Please fill out the form below with accurate apparel business information. 
            All fashion partner applications are reviewed manually by our team within 1-2 business days.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <span className="text-primary">*</span> Fashion Brand/Store Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="border-primary/20 focus-visible:ring-primary/30" 
                        placeholder="Your fashion brand name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <span className="text-primary">*</span> Business Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="border-primary/20 focus-visible:ring-primary/30" 
                        placeholder="10-digit phone number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shop_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1">
                    <span className="text-primary">*</span> Business Address
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      className="border-primary/20 focus-visible:ring-primary/30" 
                      placeholder="Complete store/office address" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <span className="text-primary">*</span> GST Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="border-primary/20 focus-visible:ring-primary/30" 
                        placeholder="Valid GST registration number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <span className="text-primary">*</span> PAN Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="border-primary/20 focus-visible:ring-primary/30" 
                        placeholder="Business PAN number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-6 border-t border-border/40 flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Application...
                  </>
                ) : (
                  "Submit Fashion Partner Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
