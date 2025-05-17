"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, IndianRupee, Users, BarChart } from "lucide-react";

const statsItems = [
  {
    icon: <Users className="h-6 w-6" />,
    value: "10M+",
    label: "Active Shoppers",
  },
  {
    icon: <IndianRupee className="h-6 w-6" />,
    value: "₹2.5Cr+",
    label: "Monthly Sales",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    value: "98%",
    label: "Timely Payments",
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    value: "45%",
    label: "Avg. Growth Rate",
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export function VendorStats() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-primary text-primary-foreground py-16 px-4 rounded-lg my-16 shadow-xl relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoLTZ2LTZoNnYtNmg2djZoNnY2aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-3xl font-bold mb-2">Our Platform in Numbers</h2>
        <p className="opacity-90 max-w-md mx-auto">
          Join thousands of successful vendors already selling on our marketplace
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto relative z-10">
        {statsItems.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="text-center"
          >
            <div className="mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm w-16 h-16 flex items-center justify-center shadow-inner">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      {/* Extra decorative elements */}
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
    </motion.div>
  );
}
