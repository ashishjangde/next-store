"use client";

import React from "react";
import { motion } from "framer-motion";
import { IndianRupee } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function CommissionStructure() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 rounded-lg border border-primary/20 shadow-lg relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-primary" />
        <span className="text-primary">
          Commission Rates
        </span>
      </h3>
      <ul className="space-y-3 relative z-10">
        <li className="flex justify-between items-center">
          <span>Premium Apparel</span>
          <span className="font-medium bg-gradient-to-r from-primary/30 to-primary/20 px-3 py-1 rounded-full text-sm">8-10%</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Casual Wear</span>
          <span className="font-medium bg-gradient-to-r from-primary/30 to-primary/20 px-3 py-1 rounded-full text-sm">10-12%</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Designer Collections</span>
          <span className="font-medium bg-gradient-to-r from-primary/30 to-primary/20 px-3 py-1 rounded-full text-sm">12-15%</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Accessories</span>
          <span className="font-medium bg-gradient-to-r from-primary/30 to-primary/20 px-3 py-1 rounded-full text-sm">9-11%</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Seasonal Collections</span>
          <span className="font-medium bg-gradient-to-r from-primary/30 to-primary/20 px-3 py-1 rounded-full text-sm">11-14%</span>
        </li>
      </ul>
      <p className="text-xs text-muted-foreground mt-4 relative z-10">
        *Commission rates may vary based on product subcategories and promotions
      </p>
    </motion.div>
  );
}
