import React, { useState } from 'react';
import { Github, Link, Loader, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { AnalysisEngine } from '../services/AnalysisEngine';

interface UploadState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  message: string;
  progress?: number;
}

interface UploadInterfaceProps {
  onAnalysisStateChange: (state: UploadState) => void;
  onAnalysisComplete: (result: any) => void;
}

const UploadInterface: React.FC<UploadInterfaceProps> = ({ onAnalysisStateChange, onAnalysisComplete }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    message: ''
  });
  const [githubUrl, setGithubUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [analysisEngine] = useState(() => {
    // Get GitHub token from environment variables if available
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    return new AnalysisEngine(githubToken);
  });

  const updateState = (newState: UploadState) => {
    setUploadState(newState);
    onAnalysisStateChange(newState);
  };

  const processAnalysis = async () => {
    try {
      // Update progress through different stages
      updateState({
        status: 'processing',
        message: 'Initializing RAG engine and document processors...',
        progress: 10
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      updateState({
        status: 'processing',
        message: 'Scraping GitHub repository and analyzing smart contracts...',
        progress: 30
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      updateState({
        status: 'processing',
        message: 'Processing protocol documentation with NLP analysis...',
        progress: 60
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      updateState({
        status: 'processing',
        message: 'Generating comprehensive protocol analysis and security assessment...',
        progress: 90
      });

      // Create a timeout promise that rejects after 5 minutes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Analysis timeout: The analysis process took longer than expected (5 minutes). This may be due to large repository size, network issues, or complex documentation processing. Please try again with a smaller repository or check your network connection.'));
        }, 300000); // 5 minutes timeout (300 seconds)
      });

      // Race the analysis against the timeout
      console.log('🚀 Starting analysis with 5-minute timeout...');
      const analysisPromise = analysisEngine.analyzeProtocol(githubUrl, documentUrl);
      
      const analysisResult = await Promise.race([
        analysisPromise,
        timeoutPromise
      ]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // CRITICAL FIX: Set the analysis result FIRST, then update the state to complete
      // This ensures the parent component has the result data before rendering the results display
      onAnalysisComplete(analysisResult);

      const completeState = {
        status: 'complete' as const,
        message: 'Web3 Protocol analysis complete! Comprehensive results are ready.',
        progress: 100
      };

      updateState(completeState);

    } catch (error) {
      console.error('Analysis error:', error);
      
      let errorMessage = 'Analysis failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Analysis timeout')) {
          errorMessage = error.message;
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded. Please try again later or contact support for higher rate limits.';
        } else if (error.message.includes('Repository not found')) {
          errorMessage = 'Repository not found. Please check the GitHub URL and ensure the repository is public.';
        } else if (error.message.includes('Invalid GitHub URL')) {
          errorMessage = 'Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo).';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Unable to access documentation due to CORS policy. Please ensure the documentation URL is publicly accessible.';
        } else if (error.message.includes('Documentation processing error')) {
          errorMessage = 'Failed to process documentation. Please check the URL and try again.';
        } else {
          errorMessage = `Analysis failed: ${error.message}`;
        }
      }
      
      updateState({
        status: 'error',
        message: errorMessage
      });
    }
  };

  const handleSubmit = () => {
    if (githubUrl && documentUrl) {
      processAnalysis();
    }
  };

  const isValidGitHubUrl = (url: string) => {
    return url.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-6 py-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-black dark:text-white mb-6 transition-colors duration-300">
            Analyze Web3 Protocol
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Provide GitHub repository and documentation links for comprehensive AI-powered Web3 protocol analysis using advanced RAG engine
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* GitHub URL */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-black dark:text-white mb-4 transition-colors duration-300">GitHub Repository</h3>
            <div className="space-y-4">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-black dark:text-white ${
                    githubUrl && !isValidGitHubUrl(githubUrl) 
                      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {githubUrl && !isValidGitHubUrl(githubUrl) && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">Please enter a valid GitHub repository URL</p>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Smart contract code analysis, AST parsing, and architecture mapping
              </div>
            </div>
          </div>

          {/* Document URL */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-black dark:text-white mb-4 transition-colors duration-300">Protocol Documentation</h3>
            <div className="space-y-4">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="url"
                  placeholder="https://docs.protocol.com/whitepaper"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-black dark:text-white ${
                    documentUrl && !isValidUrl(documentUrl) 
                      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {documentUrl && !isValidUrl(documentUrl) && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">Please enter a valid documentation URL</p>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Protocol documentation processing with NLP-powered concept extraction
              </div>
            </div>
          </div>
        </div>

        {/* Single Analyze Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleSubmit}
            disabled={
              !githubUrl || 
              !documentUrl || 
              !isValidGitHubUrl(githubUrl) || 
              !isValidUrl(documentUrl) || 
              uploadState.status === 'processing'
            }
            className="px-12 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {uploadState.status === 'processing' ? 'Analyzing...' : 'Analyze Web3 Protocol'}
          </button>
        </div>

        {/* Processing Status */}
        {uploadState.status !== 'idle' && (
          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mb-8 transition-colors duration-300">
            <div className="flex items-center space-x-4">
              {uploadState.status === 'processing' && (
                <Loader className="w-6 h-6 text-black dark:text-white animate-spin" />
              )}
              {uploadState.status === 'complete' && (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
              {uploadState.status === 'error' && (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p className="font-medium text-black dark:text-white transition-colors duration-300">{uploadState.message}</p>
                {uploadState.status === 'complete' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Scroll down to view the comprehensive analysis results.
                  </p>
                )}
                {uploadState.status === 'error' && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      If you continue to experience issues, please check:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside transition-colors duration-300">
                      <li>GitHub repository URL is correct and public</li>
                      <li>Documentation URL is accessible</li>
                      <li>Try again in a few minutes if rate limited</li>
                      <li>Consider using a smaller repository if timeout occurs</li>
                    </ul>
                  </div>
                )}
                {uploadState.status === 'processing' && uploadState.progress && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                      <div 
                        className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{uploadState.progress}% complete</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RAG Engine Capabilities */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <Github className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Smart Contract Analysis</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Deep code analysis, AST parsing, vulnerability detection, and architecture mapping</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <FileText className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">RAG Document Processing</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Advanced NLP-powered protocol understanding with context-aware analysis</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <Link className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Synthesis & Insights</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Combined analysis for comprehensive protocol understanding and security assessment</p>
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-black/5 dark:bg-white/5 rounded-full transition-colors duration-300">
            <FileText className="w-5 h-5 text-black dark:text-white" />
            <span className="text-sm text-black dark:text-white font-medium transition-colors duration-300">
              Powered by RAGFlow engine for advanced document understanding and Web3 protocol analysis
            </span>
          </div>
        </div>

        {/* GitHub Token Notice */}
        {!import.meta.env.VITE_GITHUB_TOKEN && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors duration-300">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 transition-colors duration-300">GitHub API Rate Limits</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 transition-colors duration-300">
                  For better performance and higher rate limits, consider providing a GitHub Personal Access Token 
                  by setting the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">VITE_GITHUB_TOKEN</code> environment variable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadInterface;