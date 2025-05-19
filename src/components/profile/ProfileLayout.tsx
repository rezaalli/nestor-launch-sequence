import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { profileBreakpoints, profileAnimations, profileSpacing, profileZIndex } from '@/styles/profile-tokens';
import { variants, stagger } from '@/styles/motion';

// Tab interface
export interface ProfileTab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface ProfileLayoutProps {
  pageTitle: string;
  tabs: ProfileTab[];
  defaultTab?: string;
  headerContent?: ReactNode;
  profileImage?: ReactNode;
  stickyHeader?: boolean;
  onTabChange?: (tab: string) => void;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  pageTitle,
  tabs,
  defaultTab,
  headerContent,
  profileImage,
  stickyHeader = false,
  onTabChange,
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  
  // Media queries for responsive design
  const isMobile = useMediaQuery(`(max-width: ${profileBreakpoints.tablet})`);
  const isDesktop = useMediaQuery(`(min-width: ${profileBreakpoints.desktop})`);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="profile-layout mx-auto px-4 md:px-6 max-w-2xl">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-xl font-semibold tracking-tight mb-1">{pageTitle}</h1>
        {headerContent && (
          <div className="text-sm text-muted-foreground">{headerContent}</div>
        )}
      </div>
      
      {/* Profile Image */}
      {profileImage && (
        <div className="flex justify-center mb-8">
          {profileImage}
        </div>
      )}
      
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <Card className="mb-8 p-1 border shadow-sm">
          <TabsList className="w-full h-auto p-0 bg-transparent grid grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  flex items-center justify-center gap-2 py-3 
                  data-[state=active]:bg-transparent
                  data-[state=active]:text-primary dark:data-[state=active]:text-primary
                  data-[state=active]:shadow-none
                  data-[state=active]:font-medium
                  rounded-none border-0 border-b-2 border-transparent
                  data-[state=active]:border-primary
                  transition-all duration-200
                  ${isMobile ? 'flex-col text-xs px-1' : 'px-4'}
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Card>
        
        {/* Tab Content */}
        <div className="tab-content-container pb-24">
          <AnimatePresence mode="wait">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="outline-none mt-0"
              >
                <motion.div
                  key={tab.id}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={variants.fade}
                  transition={{ duration: 0.3 }}
                >
                  <ScrollArea className="h-full w-full">
                    <motion.div
                      variants={stagger.container}
                      initial="hidden"
                      animate="show"
                      className="space-y-6"
                    >
                      {tab.content}
                    </motion.div>
                  </ScrollArea>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
};

export default ProfileLayout; 