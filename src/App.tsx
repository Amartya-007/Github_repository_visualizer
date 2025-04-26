import React from 'react';
import { GithubIcon } from 'lucide-react';
import RepositoryVisualizer from './components/RepositoryVisualizer';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <header className="py-6 px-4 md:px-8">
          <div className="container mx-auto flex items-center justify-center">
            <GithubIcon className="w-8 h-8 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              GitHub Repository Visualizer
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 md:px-8 py-8 flex-grow">
          <RepositoryVisualizer />
        </main>
        <footer className="py-6 px-4 md:px-8 text-center text-gray-400 text-sm mt-auto">
          <div className="container mx-auto">
            <p>Built with React & GitHub API • {new Date().getFullYear()}</p>
            <p className="mt-1">
              Made with ❤️ by{' '}
              <a 
                href="https://github.com/Amartya-007" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Amartya Vishwakarma
              </a>
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;