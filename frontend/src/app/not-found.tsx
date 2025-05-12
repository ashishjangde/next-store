"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration errors by only rendering random elements after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-generated positions for the background shapes
  const bgShapes = [
    { width: 150, height: 200, top: "10%", left: "85%", delay: 0.5 },
    { width: 180, height: 90, top: "30%", left: "10%", delay: 1.0 },
    { width: 100, height: 150, top: "15%", left: "25%", delay: 1.5 },
    { width: 120, height: 180, top: "70%", left: "80%", delay: 2.0 },
    { width: 180, height: 200, top: "25%", left: "95%", delay: 2.5 },
    { width: 170, height: 170, top: "40%", left: "50%", delay: 3.0 }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="container max-w-4xl px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.2 
            }}
            className="relative"
          >
            <h1 className="text-9xl font-bold text-primary mb-2">404</h1>
            <motion.div
              className="absolute -right-6 -top-6 bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              Oops!
            </motion.div>
          </motion.div>

          <motion.h2 
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Page not found
          </motion.h2>

          <motion.p 
            className="text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
          
          <motion.div
            className="grid gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              size="lg" 
              onClick={() => router.push("/")}
              className="animate-pulse hover:animate-none"
            >
              Go back home
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Animated background elements - only render after mount to prevent hydration mismatch */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden -z-10">
            {bgShapes.map((shape, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/5"
                style={{
                  width: shape.width,
                  height: shape.height,
                  top: shape.top,
                  left: shape.left,
                }}
                initial={{ 
                  opacity: 0.1, 
                  scale: 0 
                }}
                animate={{ 
                  opacity: [0.1, 0.15, 0.1], 
                  scale: 1, 
                  x: [-20, 20, -20],
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: shape.delay
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
