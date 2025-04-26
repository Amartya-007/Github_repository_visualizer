import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, X, AlertCircle } from 'lucide-react';
import RepoUrlForm from './RepoUrlForm';
import TreeView from './TreeView';
import LoadingAnimation from './LoadingAnimation';
import SuccessNotification from './SuccessNotification';

const RepositoryVisualizer: React.FC = () => {
  const { repoUrl, repoData, loading, error, success, resetState, branch } = useAppContext();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <RepoUrlForm />
      </div>

      {loading && (
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center">
          <LoadingAnimation />
          <p className="mt-4 text-lg text-purple-200">Fetching repository structure...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6 flex items-center space-x-4">
          <AlertCircle className="text-red-400 shrink-0" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error</h3>
            <p className="text-white">{error}</p>
          </div>
        </div>
      )}

      {repoData && !loading && (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {repoData.owner}/{repoData.name}
              </h2>
              {repoData.description && (
                <p className="text-gray-300 text-sm">{repoData.description}</p>
              )}
            </div>
            <button 
              onClick={resetState}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close repository view"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-auto max-h-[60vh] custom-scrollbar">
            <TreeView 
              tree={repoData.fileTree} 
              repoUrl={repoUrl.replace(/\/$/, '')}
              branch={branch}
            />
          </div>
        </div>
      )}

      {showSuccess && <SuccessNotification />}
    </div>
  );
};

export default RepositoryVisualizer;