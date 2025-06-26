import { DocumentProcessor } from './DocumentProcessor';
import { LLMAdapter, LLMContext, SecurityInsight } from './LLMAdapter';
import type {
  AnalysisResult,
  ProtocolSummary,
  EconomicModel,
  ArchitectureAnalysis,
  ContractInfo,
  GasAnalysis,
  SecurityAnalysis,
  ProcessedRepository,
  DocumentContent,
  ContractAnalysis
} from './types';

export class AnalysisEngine {
  private documentProcessor: DocumentProcessor;
  private llmAdapter?: LLMAdapter;
  private llmEnabled: boolean;

  constructor(githubToken?: string, openaiApiKey?: string) {
    console.log('🚀 AnalysisEngine: Initializing analysis engine...');
    
    this.documentProcessor = new DocumentProcessor(githubToken);
    
    if (openaiApiKey && import.meta.env.VITE_LLM_ENABLED === 'true') {
      try {
        console.log('🤖 AnalysisEngine: Initializing LLM adapter...');
        this.llmAdapter = new LLMAdapter(openaiApiKey);
        this.llmEnabled = true;
        console.log('✅ AnalysisEngine: LLM adapter initialized successfully');
      } catch (error) {
        console.warn('⚠️ AnalysisEngine: Failed to initialize LLMAdapter:', error);
        this.llmEnabled = false;
      }
    } else {
      this.llmEnabled = false;
      if (!openaiApiKey) {
        console.log('💡 AnalysisEngine: No OpenAI API key provided, using base analysis only');
      }
      if (import.meta.env.VITE_LLM_ENABLED !== 'true') {
        console.log('💡 AnalysisEngine: LLM features disabled via environment variable');
      }
    }
    
    console.log(`🎯 AnalysisEngine: Initialized with LLM ${this.llmEnabled ? 'enabled' : 'disabled'}`);
  }

  async analyzeProtocol(githubUrl: string, docsUrl: string): Promise<AnalysisResult> {
    console.log('🚀 AnalysisEngine: Starting protocol analysis...');
    console.log('📍 GitHub URL:', githubUrl);
    console.log('📍 Documentation URL:', docsUrl);
    
    try {
      console.log('📂 AnalysisEngine: Starting GitHub repository processing...');
      const repoData = await this.documentProcessor.processGitHubRepository(githubUrl);
      console.log('✅ AnalysisEngine: GitHub repository processing completed');
      
      console.log('📄 AnalysisEngine: Starting documentation processing...');
      const docsData = await this.documentProcessor.processDocumentationUrl(docsUrl);
      console.log('✅ AnalysisEngine: Documentation processing completed');
      
      console.log('🔍 AnalysisEngine: Generating base analysis...');
      const baseResult = this.generateBaseAnalysis(repoData, docsData);
      console.log('✅ AnalysisEngine: Base analysis completed');
      
      if (this.llmEnabled && this.llmAdapter) {
        try {
          console.log('🤖 AnalysisEngine: Starting LLM enhancement...');
          
          const llmContext: LLMContext = {
            repoData,
            docsData,
            baseResult
          };
          
          const llmResult = await this.llmAdapter.analyzeProtocol(llmContext);
          console.log('✅ AnalysisEngine: LLM enhancement completed successfully');
          
          const enhancedResult = this.mergeAnalyses(baseResult, llmResult);
          console.log('🎯 AnalysisEngine: Analysis merging completed');
          
          return enhancedResult;
        } catch (llmError) {
          console.warn('⚠️ AnalysisEngine: LLM analysis failed, using base analysis only:', llmError);
          return baseResult;
        }
      }
      
      console.log('🎯 AnalysisEngine: Returning base analysis result');
      return baseResult;
    } catch (error) {
      console.error('❌ AnalysisEngine: Analysis failed:', error);
      throw this.handleAnalysisError(error);
    }
  }

  private generateBaseAnalysis(repoData: ProcessedRepository, docsData: DocumentContent): AnalysisResult {
    console.log('🔍 AnalysisEngine: Starting generateBaseAnalysis...');
    
    const summary = this.generateSummary(repoData, docsData);
    const architecture = this.generateArchitectureAnalysis(repoData);
    const security = this.generateSecurityAnalysis(repoData, docsData);
    
    const result = {
      summary,
      architecture,
      security,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ AnalysisEngine: generateBaseAnalysis completed successfully');
    return result;
  }

  private mergeAnalyses(baseResult: AnalysisResult, llmResult: AnalysisResult): AnalysisResult {
    console.log('🔄 AnalysisEngine: Starting analysis merging...');
    
    try {
      const mergedResult: AnalysisResult = {
        summary: {
          ...baseResult.summary,
          overview: llmResult.summary.overview || baseResult.summary.overview,
          keyFeatures: llmResult.summary.keyFeatures.length > 0 
            ? [...new Set([...baseResult.summary.keyFeatures, ...llmResult.summary.keyFeatures])]
            : baseResult.summary.keyFeatures,
          web3Fundamentals: llmResult.summary.web3Fundamentals || baseResult.summary.web3Fundamentals,
          economicModel: {
            ...baseResult.summary.economicModel,
            ...llmResult.summary.economicModel
          }
        },
        architecture: {
          ...baseResult.architecture,
          dataFlow: llmResult.architecture.dataFlow || baseResult.architecture.dataFlow,
          interactionDiagram: llmResult.architecture.interactionDiagram || baseResult.architecture.interactionDiagram,
          inheritanceDiagram: llmResult.architecture.inheritanceDiagram || baseResult.architecture.inheritanceDiagram,
          designPatterns: llmResult.architecture.designPatterns.length > 0
            ? [...new Set([...baseResult.architecture.designPatterns, ...llmResult.architecture.designPatterns])]
            : baseResult.architecture.designPatterns
        },
        security: this.mergeSecurityAnalyses(baseResult.security, llmResult.security),
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ AnalysisEngine: Analysis merging completed successfully');
      return mergedResult;
    } catch (error) {
      console.error('❌ AnalysisEngine: Error merging analyses:', error);
      console.log('🔄 AnalysisEngine: Falling back to base result');
      return baseResult;
    }
  }

  private mergeSecurityAnalyses(baseSecurity: SecurityAnalysis, llmSecurity: SecurityAnalysis): SecurityAnalysis {
    console.log('🔒 AnalysisEngine: Merging security analyses...');
    
    try {
      return {
        rating: llmSecurity.rating || baseSecurity.rating,
        businessLogic: llmSecurity.businessLogic || baseSecurity.businessLogic,
        strengths: [...new Set([...baseSecurity.strengths, ...llmSecurity.strengths])],
        vulnerabilities: [...new Set([...baseSecurity.vulnerabilities, ...llmSecurity.vulnerabilities])],
        recommendations: [...new Set([...baseSecurity.recommendations, ...llmSecurity.recommendations])],
        auditStatus: llmSecurity.auditStatus || baseSecurity.auditStatus
      };
    } catch (error) {
      console.error('❌ AnalysisEngine: Error merging security analyses:', error);
      return baseSecurity;
    }
  }

  private formatSecurityInsights(baseSecurity: SecurityAnalysis, insights: SecurityInsight[], repoData: ProcessedRepository, docsData: DocumentContent): SecurityAnalysis {
    console.log('🔍 AnalysisEngine: Formatting security insights...');
    
    try {
      const enhancedVulnerabilities = insights
        .filter(insight => insight.severity !== 'Low')
        .map(insight => `${insight.vulnerability} in ${insight.contract}: ${insight.description}`);
      
      const enhancedRecommendations = insights
        .map(insight => insight.recommendation);
      
      const enhancedStrengths = insights
        .filter(insight => insight.severity === 'Low')
        .map(insight => insight.recommendation);
      
      return {
        rating: this.calculateEnhancedSecurityRating(baseSecurity, insights),
        businessLogic: this.generateEnhancedBusinessLogic(baseSecurity, insights),
        strengths: [...new Set([...baseSecurity.strengths, ...enhancedStrengths])],
        vulnerabilities: [...new Set([...baseSecurity.vulnerabilities, ...enhancedVulnerabilities])],
        recommendations: [...new Set([...baseSecurity.recommendations, ...enhancedRecommendations])],
        auditStatus: this.checkAuditStatus(repoData, docsData)
      };
    } catch (error) {
      console.error('❌ AnalysisEngine: Error formatting security insights:', error);
      return baseSecurity;
    }
  }

  private calculateEnhancedSecurityRating(baseSecurity: SecurityAnalysis, insights: SecurityInsight[]): string {
    console.log('📊 AnalysisEngine: Calculating enhanced security rating...');
    
    try {
      const baseRatingMap: Record<string, number> = {
        'A+': 10, 'A': 9, 'A-': 8, 'B+': 7, 'B': 6, 'B-': 5, 'C+': 4, 'C': 3, 'C-': 2, 'D': 1, 'F': 0
      };
      
      const numericRatingMap: Record<number, string> = {
        10: 'A+', 9: 'A', 8: 'A-', 7: 'B+', 6: 'B', 5: 'B-', 4: 'C+', 3: 'C', 2: 'C-', 1: 'D', 0: 'F'
      };
      
      let baseScore = baseRatingMap[baseSecurity.rating] || 6;
      
      const criticalIssues = insights.filter(i => i.severity === 'High').length;
      const mediumIssues = insights.filter(i => i.severity === 'Medium').length;
      
      baseScore -= (criticalIssues * 2);
      baseScore -= (mediumIssues * 1);
      
      baseScore = Math.max(0, Math.min(10, baseScore));
      
      return numericRatingMap[baseScore] || 'B';
    } catch (error) {
      console.error('❌ AnalysisEngine: Error calculating enhanced security rating:', error);
      return baseSecurity.rating;
    }
  }

  private generateEnhancedBusinessLogic(baseSecurity: SecurityAnalysis, insights: SecurityInsight[]): string {
    console.log('💼 AnalysisEngine: Generating enhanced business logic explanation...');
    
    try {
      let enhancedLogic = baseSecurity.businessLogic;
      
      if (insights.length > 0) {
        enhancedLogic += '\n\n**Enhanced Security Insights:**\n';
        
        const criticalInsights = insights.filter(i => i.severity === 'High');
        if (criticalInsights.length > 0) {
          enhancedLogic += `\n• **Critical Concerns**: ${criticalInsights.length} high-severity issues identified requiring immediate attention.`;
        }
        
        const mediumInsights = insights.filter(i => i.severity === 'Medium');
        if (mediumInsights.length > 0) {
          enhancedLogic += `\n• **Medium Priority**: ${mediumInsights.length} medium-severity issues that should be addressed.`;
        }
        
        enhancedLogic += '\n\nThese insights provide additional context for security assessment and risk management decisions.';
      }
      
      return enhancedLogic;
    } catch (error) {
      console.error('❌ AnalysisEngine: Error generating enhanced business logic:', error);
      return baseSecurity.businessLogic;
    }
  }

  private handleAnalysisError(error: unknown): Error {
    console.log('🔍 AnalysisEngine: Handling analysis error...');
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return new Error('GitHub API rate limit exceeded. Please try again later or provide a GitHub token for higher rate limits.');
      } else if (error.message.includes('Not Found')) {
        return new Error('Repository not found. Please check the GitHub URL and ensure the repository is public.');
      } else if (error.message.includes('Bad credentials')) {
        return new Error('Invalid GitHub token provided. Please check your authentication credentials.');
      } else if (error.message.includes('CORS')) {
        return new Error('Unable to access documentation due to CORS policy. Please ensure the documentation URL is publicly accessible.');
      } else if (error.message.includes('Invalid GitHub URL')) {
        return new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo).');
      } else if (error.message.includes('Documentation processing error')) {
        return new Error('Failed to process documentation. Please check the URL and try again.');
      } else {
        return new Error(`Analysis failed: ${error.message}`);
      }
    }
    
    return new Error('Failed to analyze protocol due to an unexpected error');
  }

  // Keep all existing analysis methods unchanged
  private generateSummary(repoData: ProcessedRepository, docsData: DocumentContent): ProtocolSummary {
    // ... (rest of the original methods remain unchanged)
  }

  // ... (all other original methods remain unchanged)
}

// Re-export types for backward compatibility
export type { AnalysisResult } from './types';