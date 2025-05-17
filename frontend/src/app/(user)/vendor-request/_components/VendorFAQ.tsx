"use client";

import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What are the requirements to become a vendor?",
    answer: "To become a vendor, you need a valid GST registration, PAN card, a bank account, and details about your business including your shop name, address, and contact information.",
  },
  {
    question: "How long does the approval process take?",
    answer: "Our team typically reviews vendor applications within 1-2 business days. You'll receive an email notification once your application is approved or if we need additional information.",
  },
  {
    question: "What are the commission rates?",
    answer: "Commission rates vary by product category, typically ranging from 5% to 15%. You can view the detailed commission structure in your vendor dashboard after approval.",
  },
  {
    question: "How and when do I get paid?",
    answer: "Payments are processed every 7 days for all successful orders. The amount is directly transferred to your registered bank account after deducting applicable fees and commissions.",
  },
  {
    question: "Do I need to handle shipping?",
    answer: "You have two options: use our logistics network (recommended) or manage your own shipping. If you choose our logistics, we'll pick up products from your location and deliver them to customers.",
  },
  {
    question: "What happens if a customer returns a product?",
    answer: "When a customer initiates a return, you'll be notified. Once the product is received back in acceptable condition, the order amount will be refunded to the customer, and the commission will be adjusted in your next payout.",
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

export function VendorFAQ() {
  return (
    <div className="py-12">      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-12"
      >        
        <motion.h2 
          variants={itemVariants} 
          className="text-3xl font-bold tracking-tight mb-3"
        >
          <span className="text-primary">
            Frequently Asked Questions
          </span>
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Find answers to common questions about becoming a fashion partner on our platform
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (            <motion.div key={index} variants={itemVariants}>
              <AccordionItem value={`item-${index}`} className="border border-primary/10 bg-gradient-to-br from-background via-primary/5 to-background rounded-lg mb-3 overflow-hidden shadow-sm">
                <AccordionTrigger className="text-left px-4 font-medium hover:bg-primary/5">{faq.question}</AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}
