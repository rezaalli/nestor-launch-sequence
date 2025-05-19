import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { stagger } from '@/styles/motion';
import { profileAnimations } from '@/styles/profile-tokens';

interface ProfileCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  headerActions?: ReactNode;
  animate?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * ProfileCard component
 * A card component specifically designed for the profile/settings UI
 */
const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  variant = 'default',
  headerActions,
  animate = true,
  onClick,
  interactive = false,
}) => {
  const cardContent = (
    <Card 
      variant={variant}
      className={`
        profile-card overflow-hidden
        ${className}
        ${interactive ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
      `}
      onClick={interactive ? onClick : undefined}
    >
      {(title || description || headerActions) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {headerActions && (
            <div className="header-actions flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="flex justify-between items-center border-t pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
  
  // Apply animation if requested
  if (animate) {
    return (
      <motion.div
        variants={stagger.item}
        className="w-full"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
};

// Grid layout for cards
interface ProfileCardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileCardGrid: React.FC<ProfileCardGridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className = '',
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };
  
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default ProfileCard; 