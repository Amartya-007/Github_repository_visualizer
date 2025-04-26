import React, { useState } from 'react';
import { Search, Github, History, Settings2, Link2, CheckCircle2, Star, GitFork, Wrench } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RepoUrlForm: React.FC = () => {
  const { 
    repoUrl, 
    setRepoUrl, 
    fetchRepo, 
    loading,
    branch,
    setBranch,
    excludedFolders,
    setExcludedFolders,
    recentRepos,
    repoData
  } = useAppContext();
  
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [newExcludedFolder, setNewExcludedFolder] = useState<string>('');
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setError('Please enter a GitHub repository URL');
      setIsValidUrl(false);
      return false;
    }
    
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'github.com') {
        setError('URL must be from github.com');
        setIsValidUrl(false);
        return false;
      }
      
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        setError('Invalid repository URL format');
        setIsValidUrl(false);
        return false;
      }
      
      setError('');
      setIsValidUrl(true);
      return true;
    } catch (e) {
      setError('Invalid URL format');
      setIsValidUrl(false);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateUrl(repoUrl);
    setIsValid(valid);
    
    if (valid) {
      fetchRepo(repoUrl);
      setShowHistory(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoUrl(value);
    validateUrl(value);
    if (error) {
      setIsValid(true);
      setError('');
    }
  };

  const handleExcludedFolderAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExcludedFolder && !excludedFolders.includes(newExcludedFolder)) {
      setExcludedFolders([...excludedFolders, newExcludedFolder]);
      setNewExcludedFolder('');
    }
  };

  const handleExcludedFolderRemove = (folder: string) => {
    setExcludedFolders(excludedFolders.filter(f => f !== folder));
  };

  return (
    <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Visualize GitHub Repository Structure</h2>
        <p className="text-gray-300">
          Enter a public GitHub repository URL to generate a visual tree of its contents
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={repoUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/repository"
            className={`w-full pl-10 pr-24 py-3 bg-gray-900 border ${
              isValid ? 'border-gray-700 focus:border-purple-500' : 'border-red-500'
            } rounded-lg focus:outline-none focus:ring-2 ${
              isValid ? 'focus:ring-purple-500' : 'focus:ring-red-500'
            } focus:ring-opacity-50 transition-all duration-200 placeholder-gray-500 text-white`}
            disabled={loading}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
            {isValidUrl && (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            )}
            
            {recentRepos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-md hover:bg-gray-700 transition-colors duration-200"
                title="Recent repositories"
              >
                <History className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md hover:bg-gray-700 transition-colors duration-200"
              title="Settings"
            >
              <Settings2 className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              type="submit"
              className={`p-1.5 rounded-md ${
                loading 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
              } transition-colors duration-200`}
              disabled={loading}
              aria-label="Visualize repository"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        
        {error && (
          <p className="mt-2 text-red-400 text-sm">{error}</p>
        )}

        {repoData && !loading && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{repoData.stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4 text-blue-400" />
              <span>{repoData.forks || 0}</span>
            </div>
            {repoData.language && (
              <div className="flex items-center gap-1">
                <Wrench className="w-4 h-4 text-purple-400" />
                <span>{repoData.language}</span>
              </div>
            )}
          </div>
        )}

        {showHistory && recentRepos.length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
            {recentRepos.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setRepoUrl(url);
                  setShowHistory(false);
                  fetchRepo(url);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 truncate"
              >
                {url}
              </button>
            ))}
          </div>
        )}
        
        {showSettings && (
          <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {repoData?.branches && (
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {repoData.branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excluded Folders
              </label>
              <form onSubmit={handleExcludedFolderAdd} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newExcludedFolder}
                  onChange={(e) => setNewExcludedFolder(e.target.value)}
                  placeholder="folder name"
                  className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm"
                >
                  Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {excludedFolders.map(folder => (
                  <span
                    key={folder}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gray-700 text-sm"
                  >
                    {folder}
                    <button
                      onClick={() => handleExcludedFolderRemove(folder)}
                      className="ml-2 text-gray-400 hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-gray-400 text-sm">
          <p>Example: https://github.com/facebook/react</p>
        </div>
      </form>
    </div>
  );
};

export default RepoUrlForm;