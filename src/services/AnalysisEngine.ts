import { DocumentProcessor } from './DocumentProcessor';
import { LLMAdapter, LLMContext, SecurityInsight } from './LLMAdapter';
import type {
  AnalysisResult,
  ProtocolSummary,
  EconomicModel,
  ArchitectureAnalysis,
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
    
    // LLM Integration Setup
    this.llmEnabled = false;
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
      // 1. Repository Processing
      console.log('📂 AnalysisEngine: Starting GitHub repository processing...');
      const repoData = await this.documentProcessor.processGitHubRepository(githubUrl);
      console.log('✅ AnalysisEngine: GitHub repository processing completed');
      console.log('📊 Repository data:', {
        name: repoData.name,
        filesCount: repoData.files.length,
        contractsCount: repoData.contractAnalysis.length,
        dependenciesCount: repoData.dependencies.length
      });

      // 2. Documentation Processing
      console.log('📄 AnalysisEngine: Starting documentation processing...');
      const docsData = await this.documentProcessor.processDocumentationUrl(docsUrl);
      console.log('✅ AnalysisEngine: Documentation processing completed');
      console.log('📊 Documentation data:', {
        title: docsData.title,
        contentLength: docsData.content.length,
        sectionsCount: docsData.sections.length,
        linksCount: docsData.links.length
      });

      // 3. Base Analysis Generation
      console.log('🔍 AnalysisEngine: Generating base analysis...');
      const baseResult = this.generateBaseAnalysis(repoData, docsData);
      console.log('✅ AnalysisEngine: Base analysis completed');

      // 4. Optional LLM Enhancement
      if (this.llmEnabled && this.llmAdapter) {
        try {
          console.log('🤖 AnalysisEngine: Starting LLM enhancement...');
          const llmContext: LLMContext = {
            repoData,
            docsData,
            baseResult
          };
          
          const llmResult = await this.llmAdapter.analyzeProtocol(llmContext);
          console.log('✅ AnalysisEngine: LLM enhancement completed');
          
          console.log('🔄 AnalysisEngine: Merging analyses...');
          const mergedResult = this.mergeAnalyses(baseResult, llmResult);
          console.log('🎯 AnalysisEngine: Analysis merging completed');
          
          return mergedResult;
        } catch (llmError) {
          console.error('❌ AnalysisEngine: LLM analysis failed:', llmError);
          console.warn('⚠️ AnalysisEngine: Falling back to base analysis only');
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

  // -----------------------------
  // 🧠 Core Analysis Methods
  // -----------------------------
  private generateBaseAnalysis(repoData: ProcessedRepository, docsData: DocumentContent): AnalysisResult {
    console.log('🔍 AnalysisEngine: Starting generateBaseAnalysis...');
    const summary = this.generateSummary(repoData, docsData);
    const architecture = this.generateArchitectureAnalysis(repoData);
    const security = this.generateSecurityAnalysis(repoData, docsData);
    console.log('✅ AnalysisEngine: Base analysis completed successfully');
    return { summary, architecture, security, timestamp: new Date().toISOString() };
  }

  private mergeAnalyses(baseResult: AnalysisResult, llmResult: AnalysisResult): AnalysisResult {
    console.log('🔄 AnalysisEngine: Starting analysis merging...');
    try {
      return {
        summary: {
          ...baseResult.summary,
          overview: llmResult.summary.overview || baseResult.summary.overview,
          keyFeatures: [...new Set([...baseResult.summary.keyFeatures, ...(llmResult.summary.keyFeatures || [])])],
          web3Fundamentals: llmResult.summary.web3Fundamentals || baseResult.summary.web3Fundamentals,
          economicModel: llmResult.summary.economicModel || baseResult.summary.economicModel
        },
        architecture: {
          ...baseResult.architecture,
          designPatterns: [...new Set([...baseResult.architecture.designPatterns, ...(llmResult.architecture.designPatterns || [])])],
          gasOptimization: {
            ...baseResult.architecture.gasOptimization,
            optimizations: [...new Set([...baseResult.architecture.gasOptimization.optimizations, ...(llmResult.architecture?.gasOptimization?.optimizations || [])])],
            concerns: [...new Set([...baseResult.architecture.gasOptimization.concerns, ...(llmResult.architecture?.gasOptimization?.concerns || [])])]
          }
        },
        security: this.mergeSecurityAnalyses(baseResult.security, llmResult.security),
        timestamp: new Date().toISOString()
      };
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
        strengths: [...new Set([...baseSecurity.strengths, ...(llmSecurity.strengths || [])])],
        vulnerabilities: [...new Set([...baseSecurity.vulnerabilities, ...(llmSecurity.vulnerabilities || [])])],
        recommendations: [...new Set([...baseSecurity.recommendations, ...(llmSecurity.recommendations || [])])],
        auditStatus: llmSecurity.auditStatus || baseSecurity.auditStatus
      };
    } catch (error) {
      console.error('❌ AnalysisEngine: Error merging security analyses:', error);
      console.log('🔄 AnalysisEngine: Falling back to base security analysis');
      return baseSecurity;
    }
  }

  // -----------------------------
  // 📊 Summary Generation
  // -----------------------------
  private generateSummary(repoData: ProcessedRepository, docsData: DocumentContent): ProtocolSummary {
    console.log('📝 AnalysisEngine: Starting generateSummary...');
    console.log('📊 Input data for summary:', {
      repoName: repoData.name,
      contractsCount: repoData.contractAnalysis.length,
      docsContentLength: docsData.content.length
    });

    // Determine protocol category
    const category = this.determineProtocolCategory(repoData, docsData);
    console.log('🏷️ Determined category:', category);

    // Generate overview based on documentation and code analysis
    const overview = this.generateOverview(repoData, docsData, category);
    console.log('📖 Generated overview length:', overview.length);

    // Extract key features
    const keyFeatures = this.extractKeyFeatures(repoData, docsData);
    console.log('🔑 Extracted key features:', keyFeatures);

    // Generate Web3 fundamentals explanation
    const web3Fundamentals = this.generateWeb3Fundamentals(category);
    console.log('🌐 Generated Web3 fundamentals length:', web3Fundamentals.length);

    // Analyze economic model
    const economicModel = this.analyzeEconomicModel(docsData);
    console.log('💰 Analyzed economic model:', economicModel);

    return {
      name: repoData.name,
      description: repoData.description,
      category,
      complexityScore: this.calculateAverageComplexity(repoData),
      overview,
      keyFeatures,
      web3Fundamentals,
      economicModel
    };
  }

  private determineProtocolCategory(repoData: ProcessedRepository, docsData: DocumentContent): ProtocolCategory {
    // Implementation here...
    return 'Derivatives Trading';
  }

  private generateOverview(repoData: ProcessedRepository, docsData: DocumentContent, category: ProtocolCategory): string {
    // Implementation here...
    return 'Protocol overview combining code structure and documentation';
  }

  private extractKeyFeatures(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    // Implementation here...
    return ['Dynamic Open Interest Caps', 'Auto-Deleveraging'];
  }

  private generateWeb3Fundamentals(category: ProtocolCategory): string {
    // Implementation here...
    return 'Web3 fundamentals explanation';
  }

  private analyzeEconomicModel(docsData: DocumentContent): EconomicModel {
    // Implementation here...
    return {
      tokenomics: ['Utility token for protocol access'],
      feeStructure: ['Standard protocol fees'],
      incentives: ['Participation incentives'],
      governance: 'Token-based governance system'
    };
  }

  private calculateAverageComplexity(repoData: ProcessedRepository): number {
    const total = repoData.contractAnalysis.reduce((sum, contract) => sum + contract.complexity, 0);
    return Math.round((total / repoData.contractAnalysis.length) * 10) / 10;
  }

  // -----------------------------
  // 🏗️ Architecture Analysis
  // -----------------------------
  private generateArchitectureAnalysis(repoData: ProcessedRepository): ArchitectureAnalysis {
    console.log('🏗️ AnalysisEngine: Starting generateArchitectureAnalysis...');
    console.log('📊 Input data for architecture:', {
      contractsCount: repoData.contractAnalysis.length
    });

    const contracts = this.formatContractInfos(repoData.contractAnalysis);
    const dependencies = repoData.dependencies;
    const dataFlow = this.generateDataFlow(contracts);
    const interactionDiagram = this.generateInteractionDiagram(contracts);
    const inheritanceDiagram = this.generateInheritanceDiagram(contracts);
    const designPatterns = this.detectDesignPatterns(repoData);
    const gasOptimization = this.analyzeGasOptimization(repoData);

    console.log('✅ AnalysisEngine: generateArchitectureAnalysis completed successfully');
    return {
      coreContracts: contracts,
      dependencies,
      dataFlow,
      interactionDiagram,
      inheritanceDiagram,
      designPatterns,
      gasOptimization
    };
  }

  private formatContractInfos(contractAnalysis: ContractAnalysis[]): ContractInfo[] {
    return contractAnalysis.map(c => ({
      name: c.contractName,
      description: this.generateContractDescription(c),
      functions: c.functions.length,
      complexity: c.complexity,
      role: this.determineContractRole(c.contractName)
    }));
  }

  private generateContractDescription(contract: ContractAnalysis): string {
    // Implementation here...
    return `${contract.contractName} smart contract managing core functionality`;
  }

  private determineContractRole(contractName: string): string {
    // Implementation here...
    return 'Core Protocol Contract';
  }

  private generateDataFlow(contracts: ContractInfo[]): string {
    // Implementation here...
    return 'Traders <-> Market.sol <-> ZlpVault.sol <-> Liquidity Providers';
  }

  private generateInteractionDiagram(contracts: ContractInfo[]): string {
    let mermaidCode = 'classDiagram\n';
    contracts.forEach(c => {
      mermaidCode += `    class ${c.name} {\n`;
      mermaidCode += '        +modifier onlyOwner()\n';
      mermaidCode += '        +function execute()\n';
      mermaidCode += '        +function validate()\n';
      mermaidCode += '    }\n';
    });
    contracts.slice(1).forEach((c, i) => {
      mermaidCode += `    ${contracts[i].name} <|-- ${c.name}\n`;
    });
    return mermaidCode;
  }

  private generateInheritanceDiagram(contracts: ContractInfo[]): string {
    // Implementation here...
    return 'classDiagram\n    BaseContract <|-- MainContract';
  }

  private detectDesignPatterns(repoData: ProcessedRepository): string[] {
    // Implementation here...
    return ['Factory Pattern', 'Access Control', 'Circuit Breaker'];
  }

  private analyzeGasOptimization(repoData: ProcessedRepository): GasAnalysis {
    // Implementation here...
    return {
      efficiency: 7.5,
      optimizations: ['Batch operations', 'Modifier reuse'],
      concerns: ['High complexity', 'Loop operations']
    };
  }

  // -----------------------------
  // 🔒 Security Analysis
  // -----------------------------
  private generateSecurityAnalysis(repoData: ProcessedRepository, docsData: DocumentContent): SecurityAnalysis {
    console.log('🔒 AnalysisEngine: Starting generateSecurityAnalysis...');
    console.log('📊 Input data for security:', {
      contractsCount: repoData.contractAnalysis.length,
      docsContentLength: docsData.content.length
    });

    const rating = this.calculateSecurityRating(repoData.contractAnalysis);
    const businessLogic = this.analyzeBusinessLogic(repoData, docsData);
    const strengths = this.extractSecurityStrengths(repoData, docsData);
    const vulnerabilities = this.extractSecurityVulnerabilities(repoData, docsData);
    const recommendations = this.generateSecurityRecommendations(repoData, docsData);
    const auditStatus = this.checkAuditStatus(repoData, docsData);

    console.log('✅ AnalysisEngine: Security analysis completed');
    return {
      rating,
      businessLogic,
      strengths,
      vulnerabilities,
      recommendations,
      auditStatus
    };
  }

  private calculateSecurityRating(contracts: ContractAnalysis[]): string {
    // Implementation here...
    return 'B+';
  }

  private analyzeBusinessLogic(repoData: ProcessedRepository, docsData: DocumentContent): string {
    // Implementation here...
    return 'Core business logic revolves around liquidity provision and perpetual trading';
  }

  private extractSecurityStrengths(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    // Implementation here...
    return ['Comprehensive access control implementation', 'Emergency pause mechanisms'];
  }

  private extractSecurityVulnerabilities(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    // Implementation here...
    return ['High contract complexity', 'No explicit reentrancy protection'];
  }

  private generateSecurityRecommendations(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    // Implementation here...
    return ['Implement reentrancy guards', 'Add emergency pause functionality'];
  }

  private checkAuditStatus(repoData: ProcessedRepository, docsData: DocumentContent): string {
    // Implementation here...
    return 'No public audit information available';
  }

  // -----------------------------
  // 🛠 Error Handling
  // -----------------------------
  private handleAnalysisError(error: unknown): Error {
    console.error('❌ AnalysisEngine: Error in analyzeProtocol:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return new Error('GitHub API rate limit exceeded. Please try again later or provide a GitHub token for higher rate limits.');
      } else if (error.message.includes('CORS')) {
        return new Error('Unable to access documentation due to CORS policy. Please ensure the documentation URL is publicly accessible.');
      } else if (error.message.includes('Invalid GitHub URL')) {
        return new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo ).');
      } else if (error.message.includes('Failed to fetch documentation')) {
        return new Error('Failed to fetch documentation. Please check the URL and try again.');
      } else {
        return new Error(`Analysis failed: ${error.message}`);
      }
    }
    
    return new Error('Failed to analyze protocol due to an unexpected error');
  }
}