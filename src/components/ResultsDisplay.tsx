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
          <h3 className="text-2xl font-bold text-black mb-4">Protocol Overview</h3>
          <div className="text-gray-700 leading-relaxed">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black mb-2">Protocol Category</h4>
              <p className="text-gray-700">{analysisResult.summary.category}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black mb-2">Description</h4>
              <p className="text-gray-700">{analysisResult.summary.description}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black mb-2">Overview</h4>
              <div className="whitespace-pre-line text-gray-700">{analysisResult.summary.overview}</div>
            </div>
            
            {analysisResult.summary.keyFeatures.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-black mb-2">Key Features</h4>
                <ul className="text-gray-700 space-y-1">
                  {analysisResult.summary.keyFeatures.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-black mb-2">Web3 Fundamentals</h4>
              <div className="whitespace-pre-line text-gray-700">{analysisResult.summary.web3Fundamentals}</div>
            </div>
            
            {showDetailedView && (
              <div className="mt-8 space-y-6">
                <h4 className="text-xl font-bold text-black">Economic Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-black">Tokenomics</h5>
                    <ul className="text-gray-700 space-y-2">
                      {analysisResult.summary.economicModel.tokenomics.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-semibold text-black">Fee Structure</h5>
                    <ul className="text-gray-700 space-y-2">
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">Complexity Score</h4>
              <div className="text-2xl font-bold text-black">{analysisResult.summary.complexityScore}/10</div>
              <p className="text-sm text-gray-600 mt-1">Protocol complexity assessment</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">Security Rating</h4>
              <div className="text-2xl font-bold text-green-600">{analysisResult.security.rating}</div>
              <p className="text-sm text-gray-600 mt-1">Security assessment grade</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">Gas Efficiency</h4>
              <div className="text-2xl font-bold text-blue-600">{analysisResult.architecture.gasOptimization.efficiency}/10</div>
              <p className="text-sm text-gray-600 mt-1">Gas optimization score</p>
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
          <h3 className="text-2xl font-bold text-black mb-6">Smart Contract Architecture</h3>
          
          {/* Data Flow Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <Network className="w-5 h-5 mr-2" />
              Data Flow Diagram (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{analysisResult.architecture.dataFlow}</pre>
            </div>
          </div>

          {/* Interaction Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Interaction Sequence (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 text-blue-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{analysisResult.architecture.interactionDiagram}</pre>
            </div>
          </div>

          {/* Inheritance Diagram */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <GitBranch className="w-5 h-5 mr-2" />
              Contract Inheritance & Relationships (Mermaid Syntax)
            </h4>
            <div className="bg-gray-900 text-purple-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{analysisResult.architecture.inheritanceDiagram}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>💡 Tip:</strong> Copy the Mermaid syntax above and paste it into{' '}
              <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                mermaid.live
              </a>{' '}
              to visualize the interactive diagram.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black">Core Contracts</h4>
              <div className="space-y-2">
                {analysisResult.architecture.coreContracts.map((contract, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold">{contract.name}</span>
                      <Eye className="w-4 h-4 text-gray-400 cursor-pointer hover:text-black" />
                    </div>
                    <p className="text-xs text-gray-600">{contract.description}</p>
                    {showDetailedView && (
                      <div className="mt-2 text-xs text-gray-500">
                        Functions: {contract.functions} | Complexity: {contract.complexity.toFixed(1)} | Role: {contract.role}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black">Dependencies</h4>
              <div className="space-y-2">
                {analysisResult.architecture.dependencies.slice(0, showDetailedView ? undefined : 5).map((dep, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm">{dep}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                {!showDetailedView && analysisResult.architecture.dependencies.length > 5 && (
                  <p className="text-sm text-gray-500">+{analysisResult.architecture.dependencies.length - 5} more dependencies</p>
                )}
              </div>
            </div>
          </div>
          
          {showDetailedView && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-black mb-4">Design Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.architecture.designPatterns.map((pattern, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gas Optimization Analysis */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold text-black mb-4">⛽ Gas Optimization Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-green-800 mb-2">✅ Optimizations Detected</h5>
                <ul className="text-green-700 space-y-1 text-sm">
                  {analysisResult.architecture.gasOptimization.optimizations.map((opt, index) => (
                    <li key={index}>• {opt}</li>
                  ))}
                </ul>
              </div>
              {analysisResult.architecture.gasOptimization.concerns.length > 0 && (
                <div>
                  <h5 className="font-medium text-orange-800 mb-2">⚠️ Gas Concerns</h5>
                  <ul className="text-orange-700 space-y-1 text-sm">
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
          <h3 className="text-2xl font-bold text-black mb-6">Security Assessment</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-4">Business Logic Analysis</h4>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {analysisResult.security.businessLogic}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✓ Security Strengths</h4>
              <ul className="text-green-700 space-y-1">
                {analysisResult.security.strengths.map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
            </div>
            
            {analysisResult.security.vulnerabilities.length > 0 && (
              <div className="p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠ Security Considerations</h4>
                <ul className="text-yellow-700 space-y-1">
                  {analysisResult.security.vulnerabilities.map((vuln, index) => (
                    <li key={index}>• {vuln}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {showDetailedView && analysisResult.security.recommendations.length > 0 && (
              <div className="p-6 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Recommended Security Enhancements</h4>
                <ul className="text-blue-700 space-y-1">
                  {analysisResult.security.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-6 border border-gray-200 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📋 Audit Status</h4>
              <p className="text-gray-700">{analysisResult.security.auditStatus}</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-black mb-6">Analysis Results</h2>
          <p className="text-xl text-gray-600">Comprehensive AI-powered insights into {analysisResult.summary.name}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
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
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Analyzed: {new Date(analysisResult.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleViewDetails}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showDetailedView ? 'Hide Details' : 'View Details'}</span>
                  {showDetailedView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleExportReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300"
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