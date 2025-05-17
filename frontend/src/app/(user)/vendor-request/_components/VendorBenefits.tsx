"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Store, TrendingUp, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefitItems = [
  {
    icon: <Store className="h-6 w-6" />,
    title: "Expand Your Reach",
    description: "Access millions of customers shopping on our platform and increase your sales potential.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Business Growth",
    description: "Leverage our marketing tools and analytics to grow your business strategically.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Simple Logistics",
    description: "Utilize our logistics network or manage your own deliveries with flexible options.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Secure Payments",
    description: "Receive timely payments directly to your bank account with our secure payment system.",
  },
];

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

export function VendorBenefits() {
  return (
    <div className="py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-12"
      >        <motion.h2 
          variants={itemVariants} 
          className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent"
        >
          Why Become a Vendor?
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Join thousands of successful businesses selling on our platform and enjoy these exclusive benefits.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
      >
        {benefitItems.map((item, index) => (          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full relative overflow-hidden border-t-2 border-t-primary/30 bg-gradient-to-br from-background via-primary/5 to-background">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner w-14 h-14 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary-foreground/80 bg-clip-text text-transparent">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
