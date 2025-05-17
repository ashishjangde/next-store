"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateVendorSchema, CreateVendorInput } from "@/schema/vendor-schema";
import { VendorActions } from "@/api-actions/vendor-actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardFooter } from "@/components/ui/card";
import { StoreIcon, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { extractErrorMessage } from "@/utils/error-utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface VendorRegistrationFormProps {
  onCancel?: () => void;
}

export function VendorRegistrationForm({ onCancel }: VendorRegistrationFormProps) {
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
        className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border shadow-lg"
      >
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-800/30 p-6 mb-6">
          <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
          Application Submitted!
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md">
          Your fashion partner application has been submitted successfully and is pending review.
          We will notify you once your application is approved.
        </p>
        
        <Button 
          asChild
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
      className="rounded-lg border bg-card shadow-lg"
    >
      <div className="border-b border-border/40 bg-muted/30 px-6 md:px-8 py-4 flex items-center justify-between">
        {onCancel && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-full">
            <StoreIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Fashion Partner Registration
          </h2>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Please fill out the form below with accurate apparel business information. 
          All fashion partner applications are reviewed manually by our team.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="29AADCB2230M1ZB" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your 15-digit GST identification number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDE1234F" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your 10-character PAN number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shop_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Shop Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shop_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Complete address of your shop" 
                      {...field} 
                      rows={3}
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit phone number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Business phone number for customer inquiries
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isError && (
              <div className="bg-destructive/15 p-4 rounded-md flex items-start gap-3 text-sm">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive mb-1">There was an error submitting your application</p>
                  <p className="text-destructive/90">Please check your information and try again. If the problem persists, contact support.</p>
                </div>
              </div>
            )}

            <CardFooter className="px-0 pt-6 pb-0">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Fashion Partner Application"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
