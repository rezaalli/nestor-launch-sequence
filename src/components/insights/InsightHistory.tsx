import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Filter, Search, ArrowUpDown, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InsightPriority } from './InsightCard';

export interface HistoricalInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: Date;
  priority: InsightPriority;
  isValid: boolean;
  isHelpful?: boolean;
  feedback?: string;
  feedbackTimestamp?: Date;
  improvementScore?: number;
  wasActionTaken?: boolean;
  actionTaken?: string;
  actionTimestamp?: Date;
}

interface InsightHistoryProps {
  insights: HistoricalInsight[];
  onViewDetails?: (id: string) => void;
  onFilterChange?: (filters: InsightHistoryFilters) => void;
}

export interface InsightHistoryFilters {
  categories: string[];
  dateRange: { start?: Date; end?: Date };
  showActionTaken: boolean;
  showImproved: boolean;
  showOnlyFeedback: boolean;
  query: string;
}

/**
 * InsightHistory component that displays historical insights with filtering and tracking
 */
const InsightHistory: React.FC<InsightHistoryProps> = ({ 
  insights, 
  onViewDetails, 
  onFilterChange 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<InsightHistoryFilters>({
    categories: [],
    dateRange: {},
    showActionTaken: false,
    showImproved: false,
    showOnlyFeedback: false,
    query: ''
  });
  const [visibleFilters, setVisibleFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'feedback' | 'improved'>('all');
  
  // Apply filters to insights
  const filteredInsights = insights.filter(insight => {
    // Apply search query if present
    if (filters.query && !insight.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !insight.description.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (filters.categories.length > 0 && !filters.categories.includes(insight.category)) {
      return false;
    }
    
    // Apply date range filter
    if (filters.dateRange.start && new Date(insight.timestamp) < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && new Date(insight.timestamp) > filters.dateRange.end) {
      return false;
    }
    
    // Apply action taken filter
    if (filters.showActionTaken && !insight.wasActionTaken) {
      return false;
    }
    
    // Apply improved filter
    if (filters.showImproved && !insight.improvementScore) {
      return false;
    }
    
    // Apply feedback filter
    if (filters.showOnlyFeedback && insight.isHelpful === undefined) {
      return false;
    }
    
    // Filter by active tab
    if (activeTab === 'feedback' && insight.isHelpful === undefined) {
      return false;
    }
    if (activeTab === 'improved' && !insight.improvementScore) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortOrder === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });
  
  // Get all unique categories
  const allCategories = [...new Set(insights.map(insight => insight.category))];
  
  // Calculate stats for each tab
  const allCount = insights.length;
  const feedbackCount = insights.filter(i => i.isHelpful !== undefined).length;
  const improvedCount = insights.filter(i => i.improvementScore !== undefined && i.improvementScore > 0).length;
  
  // Handle filter changes
  const handleFilterChange = (updates: Partial<InsightHistoryFilters>) => {
    const updatedFilters = { ...filters, ...updates };
    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    const currentCategories = [...filters.categories];
    if (currentCategories.includes(category)) {
      handleFilterChange({ categories: currentCategories.filter(c => c !== category) });
    } else {
      handleFilterChange({ categories: [...currentCategories, category] });
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'feedback' | 'improved');
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange({ query: e.target.value });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Insight History</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          {/* Search and filter bar */}
          <div className="mb-4 space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search insights..."
                  className="pl-8"
                  value={filters.query}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleFilters(!visibleFilters)}
                className={cn(
                  "flex items-center",
                  filters.categories.length > 0 || filters.showActionTaken || 
                  filters.showImproved || filters.showOnlyFeedback || visibleFilters 
                    ? "border-blue-500 text-blue-600" 
                    : ""
                )}
              >
                <Filter size={16} className="mr-1" />
                Filters
                {(filters.categories.length > 0 || filters.showActionTaken || 
                  filters.showImproved || filters.showOnlyFeedback) && (
                  <Badge className="ml-1 bg-blue-500 text-white" variant="default">
                    {filters.categories.length + 
                     (filters.showActionTaken ? 1 : 0) + 
                     (filters.showImproved ? 1 : 0) + 
                     (filters.showOnlyFeedback ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'newest' 
                    ? 'oldest' 
                    : sortOrder === 'oldest' 
                      ? 'priority' 
                      : 'newest');
                }}
                className="flex items-center"
              >
                <ArrowUpDown size={16} className="mr-1" />
                {sortOrder === 'newest' 
                  ? 'Newest' 
                  : sortOrder === 'oldest' 
                    ? 'Oldest' 
                    : 'Priority'}
              </Button>
            </div>
            
            {/* Filter options (expandable) */}
            {visibleFilters && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                      <Badge
                        key={category}
                        variant={filters.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Additional Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={filters.showActionTaken ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange({ showActionTaken: !filters.showActionTaken })}
                    >
                      Action Taken
                    </Badge>
                    <Badge
                      variant={filters.showImproved ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange({ showImproved: !filters.showImproved })}
                    >
                      Improved
                    </Badge>
                    <Badge
                      variant={filters.showOnlyFeedback ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange({ showOnlyFeedback: !filters.showOnlyFeedback })}
                    >
                      Has Feedback
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilters({
                        categories: [],
                        dateRange: {},
                        showActionTaken: false,
                        showImproved: false,
                        showOnlyFeedback: false,
                        query: ''
                      });
                      if (onFilterChange) {
                        onFilterChange({
                          categories: [],
                          dateRange: {},
                          showActionTaken: false,
                          showImproved: false,
                          showOnlyFeedback: false,
                          query: ''
                        });
                      }
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs for different views */}
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All <Badge className="ml-1 bg-gray-200 text-gray-700">{allCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex-1">
                Feedback <Badge className="ml-1 bg-gray-200 text-gray-700">{feedbackCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="improved" className="flex-1">
                Improved <Badge className="ml-1 bg-gray-200 text-gray-700">{improvedCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {sortedInsights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No insights found matching your filters</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedInsights.map(insight => (
                    <div 
                      key={insight.id} 
                      className="flex items-start bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewDetails && onViewDetails(insight.id)}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 mr-3",
                        insight.priority === 'critical' && "bg-red-500",
                        insight.priority === 'high' && "bg-orange-500",
                        insight.priority === 'medium' && "bg-yellow-500",
                        insight.priority === 'low' && "bg-green-500",
                        insight.priority === 'info' && "bg-blue-500",
                      )} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatDate(insight.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{insight.description}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          {insight.isHelpful !== undefined && (
                            <Badge variant="outline" className={cn(
                              "text-xs flex items-center",
                              insight.isHelpful 
                                ? "text-green-700 bg-green-50 border-green-200" 
                                : "text-red-700 bg-red-50 border-red-200"
                            )}>
                              {insight.isHelpful 
                                ? <><ThumbsUp size={10} className="mr-1" /> Helpful</>
                                : <><ThumbsDown size={10} className="mr-1" /> Not Helpful</>
                              }
                            </Badge>
                          )}
                          {insight.wasActionTaken && (
                            <Badge variant="outline" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
                              Action Taken
                            </Badge>
                          )}
                          {insight.improvementScore && insight.improvementScore > 0 && (
                            <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50 border-blue-200">
                              Improved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-4">
              {activeTab === 'feedback' && sortedInsights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No insights with feedback found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedInsights.map(insight => (
                    <div 
                      key={insight.id} 
                      className="bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewDetails && onViewDetails(insight.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge className={cn(
                          insight.isHelpful 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        )}>
                          {insight.isHelpful ? "Helpful" : "Not Helpful"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.feedback || 'No feedback comment provided'}</p>
                      <div className="flex justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {formatDate(insight.feedbackTimestamp || insight.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="improved" className="mt-4">
              {activeTab === 'improved' && sortedInsights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No improved insights found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedInsights.map(insight => (
                    <div 
                      key={insight.id} 
                      className="bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewDetails && onViewDetails(insight.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge className="bg-blue-100 text-blue-700">
                          Improved by {insight.improvementScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      <div className="flex justify-between mt-2">
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          {insight.wasActionTaken && (
                            <Badge variant="outline" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
                              Action Taken
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(insight.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default InsightHistory; 