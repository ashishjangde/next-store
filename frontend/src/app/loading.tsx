'use client';

import { motion, Variants } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Loading() {
  // Pulse animation variant
  const pulseVariant: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: [0.8, 1.2, 1], 
      opacity: [0, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };
  
  // Spinner variants
  const containerVariants: Variants = {
    initial: { rotate: 0 },
    animate: { 
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  const dotVariants = {
    initial: { scale: 0 },
    animate: (scale: number) => ({
      scale: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: scale * 0.2,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-10">
        {/* Logo with pulse animation */}
        <motion.div
          variants={pulseVariant}
          initial="initial"
          animate="animate"
          className="relative z-10"
        >
          <Logo />
        </motion.div>
        
        {/* Loading text with fade-in animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl text-muted-foreground font-medium"
        >
          Loading...
        </motion.div>
        
        {/* Spinning dots animation */}
        <motion.div
          className="absolute -z-10"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              custom={i / 8}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              className="absolute rounded-full bg-primary/70"
              style={{
                width: 10,
                height: 10,
                top: `${Math.sin(i / 8 * Math.PI * 2) * -60}px`,
                left: `${Math.cos(i / 8 * Math.PI * 2) * 60}px`,
              }}
            />
          ))}
        </motion.div>

        {/* Progress bar at bottom */}
        <motion.div 
          className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-6"
        >
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}