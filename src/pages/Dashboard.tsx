
import React from 'react';
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  
  React.useEffect(() => {
    toast({
      title: "Welcome to Nestor",
      description: "Your device is now connected and ready to use.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-6">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Health Overview</h2>
          <p className="text-nestor-gray-600">Your Nestor device is collecting data. Check back soon for insights.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium mb-4">Device Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="nestor-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-nestor-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zm-2.83 2.83a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-nestor-gray-900">My Nestor</h3>
                <p className="text-sm text-nestor-gray-600">Connected</p>
              </div>
            </div>
            <span className="text-sm text-green-600">98% battery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
