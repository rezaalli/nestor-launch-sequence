
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, FileType, Heart, Bed, Activity, RotateCw, Eye, Share2, Trash2, ArrowLeft, MoreVertical, CalendarDays, Calendar, CheckSquare, Sliders, AlertTriangle } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import Toggle from '@/components/Toggle';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import ReportFormatToggle from '@/components/ReportFormatToggle';
import { useAssessment } from '@/contexts/AssessmentContext';
import { format, subDays } from 'date-fns';

const Reports = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncComplete, setSyncComplete] = useState<boolean>(false);
  const { completedAssessments, healthPatterns } = useAssessment();
  
  // State for date range
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'MMM d, yyyy'),
    endDate: format(new Date(), 'MMM d, yyyy')
  });
  
  // Report configuration state
  const [metrics, setMetrics] = useState({
    heartRate: true,
    sleep: true,
    activity: true,
    temperature: false,
    readiness: true,
    assessments: true,
    patterns: true
  });
  
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleSync = () => {
    setSyncing(true);
    
    // Simulate sync completion
    setTimeout(() => {
      setSyncing(false);
      setSyncComplete(true);
      
      setTimeout(() => {
        setSyncComplete(false);
      }, 1500);
    }, 2000);
  };

  // Generate a report with assessment data and patterns
  const handleGenerateReport = () => {
    // Count metrics for the report
    const selectedMetricsCount = Object.values(metrics).filter(Boolean).length;
    
    // Count available assessments in date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const assessmentsInRange = completedAssessments.filter(assessment => {
      const assessmentDate = new Date(assessment.date);
      return assessmentDate >= startDate && assessmentDate <= endDate;
    });
    
    // Count patterns in date range
    const patternsInRange = healthPatterns.filter(pattern => {
      const patternDate = new Date(pattern.detectedDate);
      return patternDate >= startDate && patternDate <= endDate;
    });
    
    // Add more details to toast based on what's included
    const reportDetails = [];
    if (metrics.assessments && assessmentsInRange.length > 0) {
      reportDetails.push(`${assessmentsInRange.length} assessments`);
    }
    
    if (metrics.patterns && patternsInRange.length > 0) {
      reportDetails.push(`${patternsInRange.length} health patterns`);
    }
    
    if (metrics.readiness) {
      reportDetails.push('readiness scores');
    }
    
    const reportDescription = reportDetails.length > 0 
      ? `Report will include ${reportDetails.join(', ')}.` 
      : 'This may take a few minutes depending on the data range.';
    
    toast.success('Report generation started. You will be notified when it\'s ready.', {
      description: reportDescription
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <StatusBar />
      
      {/* Header with Back Button */}
      <header className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3"
          >
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        </div>
        <button>
          <MoreVertical className="text-gray-700" size={20} />
        </button>
      </header>
      
      {/* Reports Overview */}
      <div className="px-4 py-5">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          <div className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <CheckSquare className="text-blue-900" size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Weekly</h3>
            <p className="text-xs text-gray-500">Last: {format(new Date(), 'MMM d')}</p>
          </div>
          
          <div className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <CalendarDays className="text-blue-900" size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Monthly</h3>
            <p className="text-xs text-gray-500">Last: {format(subDays(new Date(), 30), 'MMM yyyy')}</p>
          </div>
          
          <div className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Sliders className="text-blue-900" size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Custom</h3>
            <p className="text-xs text-gray-500">Create new</p>
          </div>
        </div>
        
        <button 
          className="w-full py-3.5 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center"
          onClick={() => {
            document.getElementById('report-generator')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <FileText className="mr-2" size={18} />
          Generate Full Report
        </button>
      </div>
      
      {/* Report Generator */}
      <div id="report-generator" className="mt-4 px-4 py-5 bg-white rounded-t-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Create Report</h2>
        
        <div className="space-y-5 mb-6">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full p-3.5 border border-gray-300 rounded-lg pl-10" 
                  placeholder="Start Date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full p-3.5 border border-gray-300 rounded-lg pl-10" 
                  placeholder="End Date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>
          </div>
          
          {/* Metrics Toggles */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">Metrics to Include</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Heart className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Heart Rate</span>
                </div>
                <Toggle checked={metrics.heartRate} onChange={(checked) => setMetrics({...metrics, heartRate: checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Bed className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Sleep Data</span>
                </div>
                <Toggle checked={metrics.sleep} onChange={(checked) => setMetrics({...metrics, sleep: checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Activity className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Activity</span>
                </div>
                <Toggle checked={metrics.activity} onChange={(checked) => setMetrics({...metrics, activity: checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 text-sm">°F</span>
                  </div>
                  <span className="text-gray-800">Body Temperature</span>
                </div>
                <Toggle checked={metrics.temperature} onChange={(checked) => setMetrics({...metrics, temperature: checked})} />
              </div>
              
              {/* New metrics for assessments and readiness */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <ChartLine className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Readiness Scores</span>
                </div>
                <Toggle checked={metrics.readiness} onChange={(checked) => setMetrics({...metrics, readiness: checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <CheckSquare className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Assessment Data</span>
                </div>
                <Toggle checked={metrics.assessments} onChange={(checked) => setMetrics({...metrics, assessments: checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-blue-900" size={16} />
                  </div>
                  <span className="text-gray-800">Health Patterns</span>
                </div>
                <Toggle checked={metrics.patterns} onChange={(checked) => setMetrics({...metrics, patterns: checked})} />
              </div>
            </div>
          </div>
          
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">Format</label>
            <ReportFormatToggle value={reportFormat} onChange={setReportFormat} />
          </div>
        </div>
        
        <button 
          className="w-full py-3.5 bg-nestor-blue text-white font-medium rounded-lg shadow-sm"
          onClick={handleGenerateReport}
        >
          Generate Report
        </button>
      </div>
      
      {/* Connected Services */}
      <div className="mt-4 px-4 py-5 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Connected Services</h2>
        
        <div className="space-y-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fa-brands fa-apple text-black"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Apple Health</h3>
                <p className="text-xs text-gray-500">Last sync: Today, 10:45 AM</p>
              </div>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fa-brands fa-google text-blue-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Google Fit</h3>
                <p className="text-xs text-gray-500">Last sync: Yesterday, 8:30 PM</p>
              </div>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>
        </div>
        
        <button 
          className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg flex items-center justify-center"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <RotateCw className="mr-2 animate-spin" size={18} />
              Syncing...
            </>
          ) : syncComplete ? (
            <>
              <i className="fa-solid fa-check mr-2"></i>
              Sync Complete
            </>
          ) : (
            <>
              <RotateCw className="mr-2" size={18} />
              Sync Now
            </>
          )}
        </button>
      </div>
      
      {/* Report History with Assessment and Pattern Integration */}
      <div className="mt-4 px-4 py-5 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">My Reports</h2>
        
        <div className="space-y-4">
          {/* Generated Health Report */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Complete_Health_Report_{format(new Date(), 'MMM_yyyy')}</h3>
                <p className="text-xs text-gray-500">Generated: {format(new Date(), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
                <FileText className="text-blue-900" size={16} />
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Eye className="mr-1" size={14} />
                Open
              </button>
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Share2 className="mr-1" size={14} />
                Share
              </button>
              <button className="w-10 py-2 bg-gray-100 text-red-500 text-sm rounded-md flex items-center justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          {/* Pattern Analysis Report */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Health_Patterns_Analysis_{format(subDays(new Date(), 30), 'MMM_yyyy')}</h3>
                <p className="text-xs text-gray-500">Generated: {format(subDays(new Date(), 7), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
                <AlertTriangle className="text-blue-900" size={16} />
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Eye className="mr-1" size={14} />
                Open
              </button>
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Share2 className="mr-1" size={14} />
                Share
              </button>
              <button className="w-10 py-2 bg-gray-100 text-red-500 text-sm rounded-md flex items-center justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          {/* Assessment Summary Report */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Daily_Assessment_Summary_{format(subDays(new Date(), 60), 'MMM_yyyy')}</h3>
                <p className="text-xs text-gray-500">Generated: {format(subDays(new Date(), 30), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
                <CheckSquare className="text-blue-900" size={16} />
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Eye className="mr-1" size={14} />
                Open
              </button>
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md flex items-center justify-center">
                <Share2 className="mr-1" size={14} />
                Share
              </button>
              <button className="w-10 py-2 bg-gray-100 text-red-500 text-sm rounded-md flex items-center justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20"></div>
      <BottomNavbar />
    </div>
  );
}

export default Reports;
