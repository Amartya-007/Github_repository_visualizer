import React from 'react';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="loading-animation py-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          {/* Main circle */}
          <div className="absolute inset-0 border-4 border-purple-300 rounded-full opacity-20"></div>
          
          {/* Rotating arc */}
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-purple-500 rounded-full animate-pulse opacity-50"></div>
        </div>
        
        {/* "Folder" structure that builds */}
        <div className="folder-structure mt-8 w-40">
          <div className="h-2 w-16 bg-gray-600 mb-2 mx-auto animate-pulse"></div>
          <div className="h-2 w-32 bg-gray-600 mb-2 animate-pulse delay-75"></div>
          <div className="h-2 w-24 bg-gray-600 mb-2 ml-4 animate-pulse delay-100"></div>
          <div className="h-2 w-20 bg-gray-600 mb-2 ml-8 animate-pulse delay-150"></div>
          <div className="h-2 w-28 bg-gray-600 mb-2 ml-4 animate-pulse delay-200"></div>
          <div className="h-2 w-32 bg-gray-600 animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;