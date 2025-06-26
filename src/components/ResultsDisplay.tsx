

import React, { useState } from 'react';
import { FileText, Network, Download, Eye, BarChart3, Shield, ChevronDown, ChevronUp, ExternalLink, GitBranch } from 'lucide-react';
import { AnalysisResult } from '../services/AnalysisEngine';

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

  const handleViewDetails = () => {
    setShowDetailedView(!showDetailedView);
  };

  const handleExportReport = () => {
    const reportData = {
      protocol: `${analysisResult.summary.name} Analysis`,
      timestamp: analysisResult.timestamp,
      summary: analysisResult.summary,
      architecture: analysisResult.architecture,
      security: analysisResult.security
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysisResult.summary.name.toLowerCase().replace(/\s+/g, '-')}-analysis-report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: ResultTab[] = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-4 transition-colors duration-300">Protocol Overview</h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Protocol Category</h4>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{analysisResult.summary.category}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{analysisResult.summary.description}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Overview</h4>
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 transition-colors duration-300">{analysisResult.summary.overview}</div>
            </div>
            
            {analysisResult.summary.keyFeatures.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Key Features</h4>
                <ul className="text-gray-700 dark:text-gray-300 space-y-1 transition-colors duration-300">
                  {analysisResult.summary.keyFeatures.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Web3 Fundamentals</h4>
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 transition-colors duration-300">{analysisResult.summary.web3Fundamentals}</div>
            </div>
            
            {showDetailedView && (
              <div className="mt-8 space-y-6">
                <h4 className="text-xl font-bold text-black dark:text-white transition-colors duration-300">Economic Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-black dark:text-white transition-colors duration-300">Tokenomics</h5>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 transition-colors duration-300">
                      {analysisResult.summary.economicModel.tokenomics.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-semibold text-black dark:text-white transition-colors duration-300">Fee Structure</h5>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 transition-colors duration-300">
                      {analysisResult.summary.economicModel.feeStructure.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Complexity Score</h4>
              <div className="text-2xl font-bold text-black dark:text-white transition-colors duration-300">{analysisResult.summary.complexityScore}/10</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Protocol complexity assessment</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Security Rating</h4>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{analysisResult.security.rating}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Security assessment grade</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-black dark:text-white mb-2 transition-colors duration-300">Gas Efficiency</h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{analysisResult.architecture.gasOptimization.efficiency}/10</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Gas optimization score</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: <Network className="w-4 h-4" />,
      content: (
        <div>
          <h3 className="text-2xl font-bold text-black dark:text-white mb-6 transition-colors duration-300">Smart Contract Architecture</h3>
          
          {/* Data Flow Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center transition-colors duration-300">
              <Network className="w-5 h-5 mr-2" />
              Data Flow Diagram (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto transition-colors duration-300">
              <pre>{analysisResult.architecture.dataFlow}</pre>
            </div>
          </div>

          {/* Interaction Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center transition-colors duration-300">
              <BarChart3 className="w-5 h-5 mr-2" />
              Interaction Sequence (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 text-blue-400 p-6 rounded-lg font-mono text-sm overflow-x-auto transition-colors duration-300">
              <pre>{analysisResult.architecture.interactionDiagram}</pre>
            </div>
          </div>

          {/* Inheritance Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center transition-colors duration-300">
              <GitBranch className="w-5 h-5 mr-2" />
              Contract Inheritance & Relationships (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 text-purple-400 p-6 rounded-lg font-mono text-sm overflow-x-auto transition-colors duration-300">
              <pre>{analysisResult.architecture.inheritanceDiagram}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg transition-colors duration-300">
              <strong>💡 Tip:</strong> Copy the Mermaid syntax above and paste it into{' '}
              <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                mermaid.live
              </a>{' '}
              to visualize the interactive diagram.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black dark:text-white transition-colors duration-300">Core Contracts</h4>
              <div className="space-y-2">
                {analysisResult.architecture.coreContracts.map((contract, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold text-black dark:text-white transition-colors duration-300">{contract.name}</span>
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-black dark:hover:text-white transition-colors duration-300" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{contract.description}</p>
                    {showDetailedView && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Functions: {contract.functions} | Complexity: {contract.complexity.toFixed(1)} | Role: {contract.role}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black dark:text-white transition-colors duration-300">Dependencies</h4>
              <div className="space-y-2">
                {analysisResult.architecture.dependencies.slice(0, showDetailedView ? undefined : 5).map((dep, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-black dark:text-white transition-colors duration-300">{dep}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                ))}
                {!showDetailedView && analysisResult.architecture.dependencies.length > 5 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">+{analysisResult.architecture.dependencies.length - 5} more dependencies</p>
                )}
              </div>
            </div>
          </div>
          
          {showDetailedView && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4 transition-colors duration-300">Design Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.architecture.designPatterns.map((pattern, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm transition-colors duration-300">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gas Optimization Analysis */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-300">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4 transition-colors duration-300">⛽ Gas Optimization Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-green-800 dark:text-green-300 mb-2 transition-colors duration-300">✅ Optimizations Detected</h5>
                <ul className="text-green-700 dark:text-green-400 space-y-1 text-sm transition-colors duration-300">
                  {analysisResult.architecture.gasOptimization.optimizations.map((opt, index) => (
                    <li key={index}>• {opt}</li>
                  ))}
                </ul>
              </div>
              {analysisResult.architecture.gasOptimization.concerns.length > 0 && (
                <div>
                  <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2 transition-colors duration-300">⚠️ Gas Concerns</h5>
                  <ul className="text-orange-700 dark:text-orange-400 space-y-1 text-sm transition-colors duration-300">
                    {analysisResult.architecture.gasOptimization.concerns.map((concern, index) => (
                      <li key={index}>• {concern}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security Analysis',
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div>
          <h3 className="text-2xl font-bold text-black dark:text-white mb-6 transition-colors duration-300">Security Assessment</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4 transition-colors duration-300">Business Logic Analysis</h4>
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line transition-colors duration-300">
                {analysisResult.security.businessLogic}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 transition-colors duration-300">✓ Security Strengths</h4>
              <ul className="text-green-700 dark:text-green-400 space-y-1 transition-colors duration-300">
                {analysisResult.security.strengths.map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
            </div>
            
            {analysisResult.security.vulnerabilities.length > 0 && (
              <div className="p-6 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg transition-colors duration-300">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 transition-colors duration-300">⚠ Security Considerations</h4>
                <ul className="text-yellow-700 dark:text-yellow-400 space-y-1 transition-colors duration-300">
                  {analysisResult.security.vulnerabilities.map((vuln, index) => (
                    <li key={index}>• {vuln}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {showDetailedView && analysisResult.security.recommendations.length > 0 && (
              <div className="p-6 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-300">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 transition-colors duration-300">🔍 Recommended Security Enhancements</h4>
                <ul className="text-blue-700 dark:text-blue-400 space-y-1 transition-colors duration-300">
                  {analysisResult.security.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">📋 Audit Status</h4>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{analysisResult.security.auditStatus}</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-black dark:text-white mb-6 transition-colors duration-300">Analysis Results</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">Comprehensive AI-powered insights into {analysisResult.summary.name}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Analyzed: {new Date(analysisResult.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleViewDetails}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300 text-black dark:text-white"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showDetailedView ? 'Hide Details' : 'View Details'}</span>
                  {showDetailedView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleExportReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsDisplay;