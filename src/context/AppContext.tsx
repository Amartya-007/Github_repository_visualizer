import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { RepoData, fetchRepositoryData, parseGithubUrl } from '../services/githubApi';

interface AppContextType {
  repoUrl: string;
  setRepoUrl: React.Dispatch<React.SetStateAction<string>>;
  repoData: RepoData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  branch: string;
  setBranch: React.Dispatch<React.SetStateAction<string>>;
  excludedFolders: string[];
  setExcludedFolders: React.Dispatch<React.SetStateAction<string[]>>;
  recentRepos: string[];
  fetchRepo: (url: string) => Promise<void>;
  resetState: () => void;
}

interface RepoHistory {
  url: string;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 5;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [branch, setBranch] = useState<string>('main');
  const [excludedFolders, setExcludedFolders] = useState<string[]>(['node_modules', '.git']);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);

  // Load recent repos from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('repoHistory');
    if (savedHistory) {
      const history: RepoHistory[] = JSON.parse(savedHistory);
      const urls = history
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(item => item.url)
        .slice(0, MAX_HISTORY_ITEMS);
      setRecentRepos(urls);
    }
  }, []);

  const addToHistory = (url: string) => {
    const history: RepoHistory[] = JSON.parse(localStorage.getItem('repoHistory') || '[]');
    const newHistory = [
      { url, timestamp: Date.now() },
      ...history.filter(item => item.url !== url)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem('repoHistory', JSON.stringify(newHistory));
    setRecentRepos(newHistory.map(item => item.url));
  };

  const fetchRepo = async (url: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { owner, repo } = parseGithubUrl(url);
      const data = await fetchRepositoryData(url, branch, excludedFolders);
      setRepoData(data);
      setSuccess(true);
      addToHistory(url);
    } catch (err) {
      let errorMessage = 'Failed to fetch repository data';
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = `Repository or branch "${branch}" not found`;
        } else if (err.message.includes('403')) {
          errorMessage = 'API rate limit exceeded. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setRepoData(null);
    setError(null);
    setSuccess(false);
  };

  const value = {
    repoUrl,
    setRepoUrl,
    repoData,
    loading,
    error,
    success,
    branch,
    setBranch,
    excludedFolders,
    setExcludedFolders,
    recentRepos,
    fetchRepo,
    resetState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};