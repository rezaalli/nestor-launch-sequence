import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { stagger } from '@/styles/motion';
import { profileSpacing } from '@/styles/profile-tokens';

interface ProfileSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  divider?: boolean;
  animate?: boolean;
}

/**
 * ProfileSection component
 * A layout component for organizing related content in the profile page
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  description,
  children,
  className = '',
  divider = true,
  animate = true,
}) => {
  const content = (
    <div className={`profile-section ${className} ${divider ? 'border-b pb-8 mb-8' : ''}`}>
      {(title || description) && (
        <div className="section-header mb-4">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  // Apply animation if requested
  if (animate) {
    return (
      <motion.div
        variants={stagger.item}
        className="w-full"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default ProfileSection; 