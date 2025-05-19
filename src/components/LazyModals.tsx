import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Modal loading fallback component
export const ModalLoadingFallback = () => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-700">Loading...</p>
    </div>
  </div>
);

// Lazy-loaded modal components
export const LazyAddMealModalWrapper = React.lazy(() => import('./AddMealModalWrapper'));

// Higher-order component to handle lazy loading
export const withSuspense = (Component: React.ComponentType<any>, Fallback: React.ComponentType = ModalLoadingFallback) => {
  return (props: any) => (
    <Suspense fallback={<Fallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Export ready-to-use lazy components
export const SuspendedAddMealModalWrapper = withSuspense(LazyAddMealModalWrapper); 