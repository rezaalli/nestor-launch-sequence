import React from 'react';
import EnhancedDataVisualization from '@/components/EnhancedDataVisualization';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Data Explorer page featuring the enhanced interactive charts
 * and accessibility features
 */
const DataExplorer: React.FC = () => {
  return (
    <div className="container mx-auto pb-20">
      <div className="flex justify-between items-center mb-4 pt-4">
        <h1 className="text-2xl font-bold">Data Explorer</h1>
        <Link to="/insights">
          <Button variant="outline" size="sm">
            Back to Insights
          </Button>
        </Link>
      </div>
      
      <div className="bg-card rounded-lg p-4 mb-6">
        <p className="text-sm">
          This page demonstrates enhanced data visualization capabilities with interactive features 
          and comprehensive accessibility support. Explore your health data with zoom capabilities, 
          comparative views, and voice navigation.
        </p>
      </div>
      
      <EnhancedDataVisualization />
    </div>
  );
};

export default DataExplorer; 