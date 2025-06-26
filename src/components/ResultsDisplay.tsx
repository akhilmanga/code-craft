import React, { useState } from 'react';
import { FileText, Network, Download, Eye, BarChart3, Shield, ChevronDown, ChevronUp, ExternalLink, GitBranch } from 'lucide-react';
import { AnalysisResult } from '../services/AnalysisEngine';
import ReactMarkdown from 'react-markdown';

interface ResultTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface ResultsDisplayProps {
  analysisResult: AnalysisResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ analysisResult }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Toggle detailed view state
  const toggleDetails = () => setShowDetailedView(!showDetailedView);

  // Generate PDF report
  const exportReport = () => {
    // Implementation for PDF export would go here
    console.log('Exporting report...');
    alert('PDF Export functionality will be implemented in the final version');
  };

  // Mermaid diagram rendering
  const renderMermaidDiagram = (diagram: string) => {
    return (
      <div className="mermaid-diagram mt-6">
        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <code className="text-blue-400">
            {diagram}
          </code>
        </pre>
      </div>
    );
  };

  // Tab configuration
  const tabs: ResultTab[] = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-white mb-2">Overview</h4>
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {analysisResult.summary.overview}
            </div>
          </div>
          
          {analysisResult.summary.keyFeatures.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2">Key Features</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 transition-colors duration-300">
                {analysisResult.summary.keyFeatures.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}

          {showDetailedView && (
            <div className="mt-8 space-y-6">
              <h4 className="text-xl font-bold text-black dark:text-white transition-colors duration-300">Economic Model</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-black dark:text-white mb-2">Tokenomics</h5>
                  <ul className="space-y-1">
                    {analysisResult.summary.economicModel.tokenomics.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">• {item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-black dark:text-white mb-2">Fee Structure</h5>
                  <ul className="space-y-1">
                    {analysisResult.summary.economicModel.feeStructure.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-black dark:text-white mb-2">Incentives</h5>
                  <ul className="space-y-1">
                    {analysisResult.summary.economicModel.incentives.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">• {item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-black dark:text-white mb-2">Governance</h5>
                  <p className="text-gray-700 dark:text-gray-300">{analysisResult.summary.economicModel.governance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: <Network className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-black dark:text-white mb-4 transition-colors duration-300">Smart Contract Architecture</h4>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
              <div className="mb-6">
                <p>The protocol consists of {analysisResult.architecture.coreContracts.length} core contracts with the following structure:</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-black dark:text-white">Contract Relationships</h5>
              <button 
                onClick={toggleDetails}
                className="flex items-center space-x-2 px-3 py-1 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                {showDetailedView ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm">Hide Details</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-sm">View Details</span>
                  </>
                )}
              </button>
            </div>
            
            {renderMermaidDiagram(analysisResult.architecture.interactionDiagram)}
            
            {showDetailedView && (
              <div className="mt-6">
                <h5 className="font-semibold text-black dark:text-white mb-3">Design Patterns</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.architecture.designPatterns.map((pattern, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm transition-colors duration-300"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-black dark:text-white mb-4 transition-colors duration-300">Security Analysis</h4>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
              <div className="mb-6">
                <p>{analysisResult.security.businessLogic}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">✓ Security Strengths</h4>
              <ul className="text-green-700 dark:text-green-400 space-y-2">
                {analysisResult.security.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ Vulnerabilities</h4>
              <ul className="text-red-700 dark:text-red-400 space-y-2">
                {analysisResult.security.vulnerabilities.map((vuln, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="p-6 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg transition-colors duration-300">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">📝 Recommendations</h4>
            <ul className="text-yellow-700 dark:text-yellow-400 space-y-2">
              {analysisResult.security.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-2 transition-colors duration-300">
            Protocol Analysis Results
          </h1>
          
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
          >
            <Download className="text-lg" />
            <span>Export Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowDetailedView(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-gray-700 shadow-md'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${
                      activeTab === tab.id 
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {tab.icon}
                    </div>
                    <span className={`${
                      activeTab === tab.id 
                        ? 'font-bold' 
                        : 'font-medium'
                    }`}>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
            
            <div className="mt-8">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <h3 className="font-semibold text-black dark:text-white mb-3">Protocol Metrics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                      {analysisResult.summary.complexityScore}/10
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Protocol complexity score
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                      {analysisResult.security.rating}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Security assessment grade
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Gas Optimization</h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black dark:text-white transition-colors duration-300">
                      {analysisResult.architecture.gasOptimization.efficiency}/10
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Gas efficiency score
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className={`transition-all duration-300 ease-in-out ${
                  activeTab !== tab.id ? 'hidden' : ''
                }`}
              >
                <section className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
                  <div className="p-8">
                    {tab.content}
                  </div>
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;