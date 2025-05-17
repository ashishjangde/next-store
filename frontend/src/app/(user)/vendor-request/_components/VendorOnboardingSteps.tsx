"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, Store, ShoppingBag, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const steps = [
  {
    number: 1,
    title: "Complete Application",
    description: "Fill out your fashion business details including GST, PAN, brand name, and contact information.",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800/50"
  },
  {
    number: 2,
    title: "Application Review",
    description: "Our fashion team will review your application for quality and brand fit. Usually takes 1-2 days.",
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800/50"
  },
  {
    number: 3,
    title: "Set Up Your Collection",
    description: "Once approved, upload your apparel catalog, set pricing, and configure delivery options.",
    icon: Store,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30", 
    borderColor: "border-purple-200 dark:border-purple-800/50"
  },
  {
    number: 4,
    title: "Start Selling",
    description: "Launch your fashion store and reach style-conscious customers across India.",
    icon: ShoppingBag,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50"
  },
];

export function VendorOnboardingSteps() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-12"
      >
        <motion.h2 
          variants={itemVariants} 
          className="text-3xl font-bold tracking-tight mb-3 text-primary"
        >
          How to Become a Fashion Partner
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Your journey to showcasing your designs on our platform
        </motion.p>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 z-0"></div>
          
          <div className="space-y-10">
            {steps.map((step, index) => (
              <motion.div 
                key={step.number}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative z-10"
                onMouseEnter={() => setActiveStep(step.number)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <Card 
                  className={cn(
                    "transition-all duration-300 pl-16 pr-6 py-5",
                    "border shadow-md hover:shadow-lg", 
                    activeStep === step.number ? [
                      step.bgColor, 
                      step.borderColor
                    ] : "hover:border-primary/40"
                  )}
                >
                  {/* Step Icon */}
                  <div 
                    className={cn(
                      "absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center",
                      "border-4 border-background dark:border-background transition-all duration-300",
                      activeStep === step.number ? step.bgColor : "bg-muted"
                    )}
                  >
                    <span className="text-xs font-bold">
                      {step.number}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <step.icon className={cn("h-6 w-6 mt-1", activeStep === step.number ? step.color : "text-muted-foreground")} />
                    <div>
                      <h3 className={cn("text-lg font-semibold mb-1", activeStep === step.number ? step.color : "")}>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Show arrow for all steps except the last one */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 hidden md:block">
                    <ArrowRight className="h-4 w-4 text-primary/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
