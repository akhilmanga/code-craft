import React, { useState } from 'react';
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

  const handleAnalysisStateChange = (newState: AnalysisState) => {
    setAnalysisState(newState);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  return (
    <div className="min-h-screen">
      <Header />
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