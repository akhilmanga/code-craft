import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadInterface from './components/UploadInterface';
import ResultsDisplay from './components/ResultsDisplay';
import Footer from './components/Footer';
import { AnalysisResult } from './services/AnalysisEngine';

interface AnalysisState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  message: string;
}

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    message: ''
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldUseDarkMode);
  }, []);

  // Apply dark mode class to document and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAnalysisStateChange = (newState: AnalysisState) => {
    setAnalysisState(newState);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <Hero />
      <UploadInterface 
        onAnalysisStateChange={handleAnalysisStateChange}
        onAnalysisComplete={handleAnalysisComplete}
      />
      {analysisState.status === 'complete' && analysisResult && (
        <ResultsDisplay analysisResult={analysisResult} />
      )}
      <Footer />
    </div>
  );
}

export default App;