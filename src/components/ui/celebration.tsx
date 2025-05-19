import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Award, Star, Sparkles, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from "class-variance-authority";

const celebrationVariants = cva(
  "fixed inset-0 flex items-center justify-center z-50 pointer-events-none",
  {
    variants: {
      variant: {
        success: "text-green-500",
        achievement: "text-amber-500",
        milestone: "text-purple-500",
        custom: "",
      },
      size: {
        sm: "scale-75",
        default: "scale-100",
        lg: "scale-125",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "default",
    },
  }
);

export interface CelebrationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof celebrationVariants> {
  show: boolean;
  icon?: React.ReactNode;
  message?: string;
  duration?: number;
  confetti?: boolean;
  onComplete?: () => void;
}

function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: [
      '#FFD700', // gold
      '#FF4F00', // orange-red
      '#8A2BE2', // blue-violet
      '#32CD32', // lime green
      '#FF1493', // deep pink
      '#00BFFF', // deep sky blue
      '#FF00FF', // magenta
    ][Math.floor(Math.random() * 7)],
  }));
}

const Celebration = React.forwardRef<HTMLDivElement, CelebrationProps>(
  ({
    className,
    variant,
    size,
    show,
    icon,
    message,
    duration = 2000,
    confetti = true,
    onComplete,
    ...props
  }, ref) => {
    const [visible, setVisible] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<any[]>([]);
    
    // Get default icon based on variant
    const getDefaultIcon = () => {
      switch (variant) {
        case 'success':
          return <Check size={40} />;
        case 'achievement':
          return <Award size={40} />;
        case 'milestone':
          return <Trophy size={40} />;
        default:
          return <Sparkles size={40} />;
      }
    };
    
    // Animation variants for the central icon
    const iconVariants = {
      hidden: { scale: 0, opacity: 0, rotate: -30 },
      visible: { 
        scale: 1, 
        opacity: 1, 
        rotate: 0,
        transition: { 
          type: "spring", 
          damping: 10, 
          stiffness: 200,
          duration: 0.4
        }
      },
      exit: { 
        scale: 1.2, 
        opacity: 0,
        transition: { duration: 0.3 } 
      }
    };
    
    // Animation variants for the background circle
    const circleVariants = {
      hidden: { scale: 0 },
      visible: { 
        scale: 3, 
        opacity: 0,
        transition: { 
          duration: 0.8,
          ease: "easeOut"
        }
      }
    };
    
    // Animation variants for the message
    const messageVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: 0.1,
          duration: 0.3 
        }
      },
      exit: { 
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 } 
      }
    };
    
    // Animation variants for confetti
    const confettiVariants = {
      hidden: { y: -10, opacity: 0 },
      visible: (i: number) => ({ 
        y: [0, -200 - Math.random() * 400],
        x: [0, (Math.random() - 0.5) * 400],
        rotate: [0, Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 0],
        transition: { 
          duration: 1.5 + Math.random(),
          delay: i * 0.02,
          ease: "easeOut"
        }
      })
    };
    
    useEffect(() => {
      if (show) {
        setVisible(true);
        if (confetti) {
          setConfettiPieces(generateConfetti(40));
        }
        
        const timer = setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }, [show, duration, confetti, onComplete]);
    
    return (
      <AnimatePresence>
        {visible && (
          <div
            ref={ref}
            className={cn(celebrationVariants({ variant, size, className }))}
            {...props}
          >
            {/* Background pulse */}
            <motion.div 
              className={cn(
                "absolute rounded-full",
                variant === 'success' ? "bg-green-100" : 
                variant === 'achievement' ? "bg-amber-100" : 
                variant === 'milestone' ? "bg-purple-100" : "bg-blue-100"
              )}
              initial="hidden"
              animate="visible"
              variants={circleVariants}
            />
            
            {/* Central icon */}
            <motion.div
              className={cn(
                "flex flex-col items-center justify-center relative z-10"
              )}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={iconVariants}
            >
              <div className={cn(
                "rounded-full p-4",
                variant === 'success' ? "bg-green-500 text-white" : 
                variant === 'achievement' ? "bg-amber-500 text-white" : 
                variant === 'milestone' ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
              )}>
                {icon || getDefaultIcon()}
              </div>
              
              {message && (
                <motion.div
                  className="mt-4 px-6 py-2 bg-white rounded-full shadow-lg text-center"
                  variants={messageVariants}
                >
                  <span className="font-medium text-gray-900">{message}</span>
                </motion.div>
              )}
            </motion.div>
            
            {/* Confetti */}
            {confetti && confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute"
                custom={piece.id}
                style={{ 
                  top: '50%',
                  left: '50%',
                  width: `${piece.scale * 16}px`,
                  height: `${piece.scale * 16}px`,
                  backgroundColor: piece.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                  zIndex: 9
                }}
                initial="hidden"
                animate="visible"
                variants={confettiVariants}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    );
  }
);

Celebration.displayName = "Celebration";

export { Celebration, celebrationVariants };

// Hook for easily using celebrations in components
export function useCelebration() {
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationConfig, setCelebrationConfig] = useState<Omit<CelebrationProps, 'show' | 'onComplete'>>({});
  
  const celebrate = (config?: Omit<CelebrationProps, 'show' | 'onComplete'>) => {
    if (celebrating) return;
    
    if (config) {
      setCelebrationConfig(config);
    }
    setCelebrating(true);
  };
  
  const celebrationComponent = (
    <Celebration
      show={celebrating}
      onComplete={() => setCelebrating(false)}
      {...celebrationConfig}
    />
  );
  
  return { celebrate, celebrating, celebrationComponent };
} 