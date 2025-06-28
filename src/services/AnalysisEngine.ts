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
  ContractAnalysis,
  VulnerabilityDetail
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
          economicModel: llmResult.summary.economicModel || baseResult.summary.economicModel,
          riskAssessment: llmResult.summary.riskAssessment || baseResult.summary.riskAssessment
        },
        architecture: {
          ...baseResult.architecture,
          designPatterns: [...new Set([...baseResult.architecture.designPatterns, ...(llmResult.architecture.designPatterns || [])])],
          dataFlow: llmResult.architecture.dataFlow || baseResult.architecture.dataFlow,
          interactionDiagram: llmResult.architecture.interactionDiagram || baseResult.architecture.interactionDiagram,
          inheritanceDiagram: llmResult.architecture.inheritanceDiagram || baseResult.architecture.inheritanceDiagram,
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
      // Convert base vulnerabilities (strings) to VulnerabilityDetail objects if needed
      const baseVulnerabilities: VulnerabilityDetail[] = Array.isArray(baseSecurity.vulnerabilities) && 
        baseSecurity.vulnerabilities.length > 0 && typeof baseSecurity.vulnerabilities[0] === 'string'
        ? (baseSecurity.vulnerabilities as unknown as string[]).map(vuln => ({
            name: vuln,
            description: vuln,
            severity: 'Medium' as const,
            exploitability: 'Medium' as const,
            category: 'General',
            mitigation: 'Review and address this vulnerability'
          }))
        : baseSecurity.vulnerabilities as VulnerabilityDetail[];

      return {
        rating: llmSecurity.rating || baseSecurity.rating,
        businessLogic: llmSecurity.businessLogic || baseSecurity.businessLogic,
        strengths: [...new Set([...baseSecurity.strengths, ...(llmSecurity.strengths || [])])],
        vulnerabilities: llmSecurity.vulnerabilities && llmSecurity.vulnerabilities.length > 0 
          ? llmSecurity.vulnerabilities 
          : baseVulnerabilities,
        recommendations: [...new Set([...baseSecurity.recommendations, ...(llmSecurity.recommendations || [])])],
        auditStatus: llmSecurity.auditStatus || baseSecurity.auditStatus,
        documentationCodeMismatches: llmSecurity.documentationCodeMismatches || []
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
    const content = (docsData.content + repoData.description).toLowerCase();
    
    if (content.includes('lending') || content.includes('borrow')) return 'Lending Protocol';
    if (content.includes('derivative') || content.includes('perpetual') || content.includes('futures')) return 'Derivatives Trading';
    if (content.includes('yield') || content.includes('farm') || content.includes('stake')) return 'Yield Farming';
    if (content.includes('governance') || content.includes('voting') || content.includes('dao')) return 'Governance Protocol';
    if (content.includes('bridge') || content.includes('cross-chain')) return 'Cross-Chain Bridge';
    if (content.includes('nft') || content.includes('erc721') || content.includes('erc1155')) return 'NFT Protocol';
    if (content.includes('token') && content.includes('manage')) return 'Token Management';
    if (content.includes('risk') || content.includes('insurance')) return 'Risk Management';
    if (content.includes('defi') || content.includes('swap') || content.includes('liquidity')) return 'DeFi Protocol';
    
    return 'Other';
  }

  private generateOverview(repoData: ProcessedRepository, docsData: DocumentContent, category: ProtocolCategory): string {
    const contractCount = repoData.contractAnalysis.length;
    const avgComplexity = this.calculateAverageComplexity(repoData);
    
    return `${repoData.name} is a ${category.toLowerCase()} built on smart contract architecture with ${contractCount} core contracts. 

The protocol demonstrates ${avgComplexity > 7 ? 'high' : avgComplexity > 5 ? 'moderate' : 'low'} complexity with an average complexity score of ${avgComplexity}/10. The system integrates ${repoData.dependencies.length} external dependencies, indicating ${repoData.dependencies.length > 10 ? 'extensive' : 'moderate'} ecosystem integration.

Based on the documentation analysis, the protocol focuses on ${this.extractPrimaryFocus(docsData, category)}. The smart contract architecture follows ${this.detectArchitecturalPattern(repoData)} patterns, ensuring ${this.assessSecurityPosture(repoData)} security posture.

This protocol represents a ${this.assessInnovationLevel(repoData, docsData)} approach to ${category.toLowerCase()}, with potential applications in ${this.identifyUseCases(docsData, category)}.`;
  }

  private extractPrimaryFocus(docsData: DocumentContent, category: ProtocolCategory): string {
    const content = docsData.content.toLowerCase();
    
    switch (category) {
      case 'DeFi Protocol':
        if (content.includes('swap')) return 'decentralized trading and liquidity provision';
        if (content.includes('liquidity')) return 'liquidity management and yield optimization';
        return 'decentralized financial services';
      case 'Lending Protocol':
        return 'collateralized lending and borrowing mechanisms';
      case 'Derivatives Trading':
        return 'perpetual contracts and derivatives trading';
      case 'Yield Farming':
        return 'yield generation and farming strategies';
      default:
        return 'blockchain-based financial infrastructure';
    }
  }

  private detectArchitecturalPattern(repoData: ProcessedRepository): string {
    const hasProxy = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('proxy') || 
      c.imports.some(imp => imp.includes('proxy'))
    );
    
    const hasFactory = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('factory')
    );
    
    const hasAccessControl = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('AccessControl') || imp.includes('Ownable'))
    );
    
    const patterns = [];
    if (hasProxy) patterns.push('upgradeable proxy');
    if (hasFactory) patterns.push('factory');
    if (hasAccessControl) patterns.push('access control');
    
    return patterns.length > 0 ? patterns.join(', ') : 'modular';
  }

  private assessSecurityPosture(repoData: ProcessedRepository): string {
    const hasReentrancyGuard = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('ReentrancyGuard'))
    );
    
    const hasPausable = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('Pausable'))
    );
    
    const hasAccessControl = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('AccessControl') || imp.includes('Ownable'))
    );
    
    const securityFeatures = [hasReentrancyGuard, hasPausable, hasAccessControl].filter(Boolean).length;
    
    if (securityFeatures >= 2) return 'robust';
    if (securityFeatures === 1) return 'moderate';
    return 'basic';
  }

  private assessInnovationLevel(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const avgComplexity = this.calculateAverageComplexity(repoData);
    const hasAdvancedFeatures = docsData.content.toLowerCase().includes('innovative') || 
                               docsData.content.toLowerCase().includes('novel') ||
                               avgComplexity > 7;
    
    return hasAdvancedFeatures ? 'innovative' : 'conventional';
  }

  private identifyUseCases(docsData: DocumentContent, category: ProtocolCategory): string {
    const content = docsData.content.toLowerCase();
    
    const useCases = [];
    if (content.includes('institutional')) useCases.push('institutional finance');
    if (content.includes('retail')) useCases.push('retail trading');
    if (content.includes('dao')) useCases.push('DAO treasury management');
    if (content.includes('yield')) useCases.push('yield optimization');
    if (content.includes('hedge')) useCases.push('risk hedging');
    
    return useCases.length > 0 ? useCases.join(', ') : 'general DeFi applications';
  }

  private extractKeyFeatures(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    const features = [];
    const content = docsData.content.toLowerCase();
    
    // Extract from documentation
    if (content.includes('liquidity')) features.push('Liquidity management system');
    if (content.includes('governance')) features.push('Decentralized governance mechanism');
    if (content.includes('yield')) features.push('Yield generation and optimization');
    if (content.includes('stake') || content.includes('staking')) features.push('Staking and rewards system');
    if (content.includes('flash loan')) features.push('Flash loan functionality');
    if (content.includes('oracle')) features.push('Oracle price feed integration');
    
    // Extract from contract analysis
    const hasMultiSig = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('multisig')
    );
    if (hasMultiSig) features.push('Multi-signature wallet integration');
    
    const hasTimelock = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('timelock')
    );
    if (hasTimelock) features.push('Timelock security mechanism');
    
    const hasVault = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('vault')
    );
    if (hasVault) features.push('Vault-based asset management');
    
    return features.length > 0 ? features : ['Smart contract automation', 'Decentralized protocol architecture'];
  }

  private generateWeb3Fundamentals(category: ProtocolCategory): string {
    return `Web3 represents the next evolution of the internet, built on blockchain technology that enables decentralized, trustless interactions without intermediaries. This protocol operates on Ethereum or compatible blockchains, leveraging smart contracts - self-executing programs that automatically enforce agreements and execute transactions when predetermined conditions are met.

In the context of ${category.toLowerCase()}, several key DeFi (Decentralized Finance) concepts are fundamental to understanding this protocol:

**Liquidity** refers to the availability of assets for trading or lending. Liquidity providers deposit tokens into pools, earning fees from trades or lending activities. **Automated Market Makers (AMMs)** use mathematical formulas to determine asset prices based on supply and demand, eliminating the need for traditional order books. **Yield farming** allows users to earn rewards by providing liquidity or staking tokens in various protocols.

**Token standards** like ERC-20 (fungible tokens) and ERC-721 (NFTs) define how tokens behave and interact within the ecosystem. **Gas optimization** is crucial for reducing transaction costs on Ethereum, involving techniques like batch operations and efficient storage patterns. **Consensus mechanisms** ensure network security and transaction finality, while **interoperability** enables cross-chain functionality and broader ecosystem integration.

Understanding these fundamentals is essential for evaluating the protocol's design decisions, security considerations, and potential risks in the broader Web3 ecosystem.`;
  }

  private analyzeEconomicModel(docsData: DocumentContent): EconomicModel {
    const content = docsData.content.toLowerCase();
    
    const tokenomics = [];
    if (content.includes('utility token')) tokenomics.push('Utility token for protocol access and governance');
    if (content.includes('governance token')) tokenomics.push('Governance token for voting and protocol decisions');
    if (content.includes('reward token')) tokenomics.push('Reward token for incentivizing participation');
    if (content.includes('burn') || content.includes('deflationary')) tokenomics.push('Token burning mechanism for deflationary pressure');
    if (tokenomics.length === 0) tokenomics.push('Standard token economics with utility functions');
    
    const feeStructure = [];
    if (content.includes('trading fee')) feeStructure.push('Trading fees on transactions');
    if (content.includes('protocol fee')) feeStructure.push('Protocol fees for system maintenance');
    if (content.includes('withdrawal fee')) feeStructure.push('Withdrawal fees for liquidity management');
    if (content.includes('performance fee')) feeStructure.push('Performance fees on generated yields');
    if (feeStructure.length === 0) feeStructure.push('Standard protocol fees for operations');
    
    const incentives = [];
    if (content.includes('liquidity mining')) incentives.push('Liquidity mining rewards for providers');
    if (content.includes('staking reward')) incentives.push('Staking rewards for token holders');
    if (content.includes('yield')) incentives.push('Yield generation through protocol participation');
    if (content.includes('airdrop')) incentives.push('Token airdrops for early adopters');
    if (incentives.length === 0) incentives.push('Participation incentives for protocol users');
    
    let governance = 'Token-based governance system';
    if (content.includes('dao')) governance = 'Decentralized Autonomous Organization (DAO) governance';
    if (content.includes('multisig')) governance = 'Multi-signature governance with elected representatives';
    if (content.includes('timelock')) governance = 'Timelock-protected governance for security';
    
    return { tokenomics, feeStructure, incentives, governance };
  }

  private calculateAverageComplexity(repoData: ProcessedRepository): number {
    if (repoData.contractAnalysis.length === 0) return 5;
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
    const inheritanceDiagram = this.generateInheritanceDiagram(repoData.contractAnalysis);
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
    const functionTypes = contract.functions.reduce((acc, func) => {
      acc[func.visibility] = (acc[func.visibility] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const hasEvents = contract.events.length > 0;
    const hasModifiers = contract.modifiers.length > 0;
    const hasInheritance = contract.inheritance.length > 0;
    
    let description = `${contract.contractName} smart contract`;
    
    if (hasInheritance) {
      description += ` inheriting from ${contract.inheritance.join(', ')}`;
    }
    
    description += ` with ${contract.functions.length} functions`;
    
    if (hasEvents) {
      description += `, ${contract.events.length} events`;
    }
    
    if (hasModifiers) {
      description += `, and ${contract.modifiers.length} custom modifiers`;
    }
    
    description += `. Manages core protocol functionality with ${functionTypes.external || 0} external and ${functionTypes.public || 0} public interfaces.`;
    
    return description;
  }

  private determineContractRole(contractName: string): string {
    const name = contractName.toLowerCase();
    
    if (name.includes('vault') || name.includes('pool')) return 'Asset Management Contract';
    if (name.includes('factory')) return 'Factory Contract';
    if (name.includes('router') || name.includes('gateway')) return 'Router/Gateway Contract';
    if (name.includes('governance') || name.includes('voting')) return 'Governance Contract';
    if (name.includes('token') || name.includes('erc20')) return 'Token Contract';
    if (name.includes('oracle') || name.includes('price')) return 'Oracle/Price Feed Contract';
    if (name.includes('timelock')) return 'Security/Timelock Contract';
    if (name.includes('proxy') || name.includes('implementation')) return 'Proxy/Implementation Contract';
    if (name.includes('staking') || name.includes('reward')) return 'Staking/Rewards Contract';
    
    return 'Core Protocol Contract';
  }

  private generateDataFlow(contracts: ContractInfo[]): string {
    if (contracts.length === 0) {
      return `
flowchart TD
    A[User Interface] --> B[Protocol Entry Point]
    B --> C[Business Logic]
    C --> D[State Management]
    D --> E[Asset Storage]
      `;
    }

    // Generate dynamic Mermaid.js flowchart based on actual contracts
    let mermaidCode = 'flowchart TD\n';
    
    // Add user entry point
    mermaidCode += '    User[👤 User] --> Entry[🚪 Entry Point]\n';
    
    // Add contracts as nodes
    contracts.forEach((contract, index) => {
      const nodeId = `C${index}`;
      const contractName = contract.name.replace(/[^a-zA-Z0-9]/g, '');
      mermaidCode += `    Entry --> ${nodeId}[📄 ${contractName}]\n`;
      
      // Add function flows for complex contracts
      if (contract.functions > 5) {
        mermaidCode += `    ${nodeId} --> ${nodeId}_Logic[⚙️ Business Logic]\n`;
        mermaidCode += `    ${nodeId}_Logic --> ${nodeId}_State[💾 State Updates]\n`;
      }
    });
    
    // Add external interactions
    mermaidCode += '    C0 --> External[🌐 External Calls]\n';
    mermaidCode += '    External --> Events[📡 Event Emission]\n';
    
    return mermaidCode;
  }

  private generateInteractionDiagram(contracts: ContractInfo[]): string {
    if (contracts.length === 0) {
      return `
sequenceDiagram
    participant User
    participant Contract
    participant Storage
    
    User->>Contract: Function Call
    Contract->>Storage: Read State
    Storage-->>Contract: Current State
    Contract->>Storage: Update State
    Contract-->>User: Return Result
      `;
    }

    // Generate dynamic Mermaid.js sequence diagram
    let mermaidCode = 'sequenceDiagram\n';
    
    // Add participants
    mermaidCode += '    participant User as 👤 User\n';
    contracts.slice(0, 3).forEach((contract, index) => {
      const contractName = contract.name.replace(/[^a-zA-Z0-9]/g, '');
      mermaidCode += `    participant C${index} as 📄 ${contractName}\n`;
    });
    mermaidCode += '    participant Storage as 💾 Storage\n';
    
    // Add interaction flows
    mermaidCode += '    User->>C0: Initialize Transaction\n';
    
    if (contracts.length > 1) {
      mermaidCode += '    C0->>C1: Delegate Call\n';
      mermaidCode += '    C1->>Storage: Read State\n';
      mermaidCode += '    Storage-->>C1: Current Data\n';
      mermaidCode += '    C1->>Storage: Update State\n';
      mermaidCode += '    C1-->>C0: Return Data\n';
    } else {
      mermaidCode += '    C0->>Storage: Read/Write State\n';
      mermaidCode += '    Storage-->>C0: State Data\n';
    }
    
    mermaidCode += '    C0-->>User: Transaction Result\n';
    
    return mermaidCode;
  }

  private generateInheritanceDiagram(contracts: ContractAnalysis[]): string {
    if (contracts.length === 0) {
      return `
classDiagram
    class BaseContract {
        +modifier onlyOwner()
        +function pause()
        +function unpause()
    }
    
    class MainContract {
        +function execute()
        +function validate()
    }
    
    BaseContract <|-- MainContract
      `;
    }

    // Generate dynamic Mermaid.js class diagram based on actual inheritance
    let mermaidCode = 'classDiagram\n';
    
    contracts.forEach((contract, index) => {
      const className = contract.contractName.replace(/[^a-zA-Z0-9]/g, '');
      
      // Add class definition
      mermaidCode += `    class ${className} {\n`;
      
      // Add key functions (limit to 5 for readability)
      const keyFunctions = contract.functions.slice(0, 5);
      keyFunctions.forEach(func => {
        const visibility = func.visibility === 'public' ? '+' : 
                          func.visibility === 'private' ? '-' : 
                          func.visibility === 'internal' ? '#' : '~';
        mermaidCode += `        ${visibility}${func.name}()\n`;
      });
      
      // Add modifiers if any
      if (contract.modifiers.length > 0) {
        contract.modifiers.slice(0, 3).forEach(modifier => {
          mermaidCode += `        +modifier ${modifier.name}()\n`;
        });
      }
      
      mermaidCode += '    }\n\n';
      
      // Add inheritance relationships
      if (contract.inheritance.length > 0) {
        contract.inheritance.forEach(parent => {
          const parentName = parent.replace(/[^a-zA-Z0-9]/g, '');
          // Check if parent exists in our contracts list
          const parentExists = contracts.some(c => 
            c.contractName.replace(/[^a-zA-Z0-9]/g, '') === parentName
          );
          
          if (parentExists) {
            mermaidCode += `    ${parentName} <|-- ${className}\n`;
          } else {
            // Add external parent class
            mermaidCode += `    class ${parentName} {\n        <<interface>>\n    }\n`;
            mermaidCode += `    ${parentName} <|-- ${className}\n`;
          }
        });
      }
    });
    
    // Add relationships between contracts based on function calls
    contracts.forEach((contract, index) => {
      const className = contract.contractName.replace(/[^a-zA-Z0-9]/g, '');
      
      // Look for potential relationships in function names
      contracts.forEach((otherContract, otherIndex) => {
        if (index !== otherIndex) {
          const otherClassName = otherContract.contractName.replace(/[^a-zA-Z0-9]/g, '');
          
          // Check if this contract might use the other contract
          const hasRelationship = contract.functions.some(func => 
            func.name.toLowerCase().includes(otherContract.contractName.toLowerCase()) ||
            otherContract.contractName.toLowerCase().includes('factory') ||
            otherContract.contractName.toLowerCase().includes('manager')
          );
          
          if (hasRelationship) {
            mermaidCode += `    ${className} --> ${otherClassName} : uses\n`;
          }
        }
      });
    });
    
    return mermaidCode;
  }

  private detectDesignPatterns(repoData: ProcessedRepository): string[] {
    const patterns = [];
    
    // Check for common patterns
    const hasFactory = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('factory')
    );
    if (hasFactory) patterns.push('Factory Pattern');
    
    const hasProxy = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('proxy') || 
      c.imports.some(imp => imp.includes('proxy'))
    );
    if (hasProxy) patterns.push('Proxy Pattern');
    
    const hasAccessControl = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('AccessControl') || imp.includes('Ownable'))
    );
    if (hasAccessControl) patterns.push('Access Control Pattern');
    
    const hasReentrancyGuard = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('ReentrancyGuard'))
    );
    if (hasReentrancyGuard) patterns.push('Reentrancy Guard Pattern');
    
    const hasPausable = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('Pausable'))
    );
    if (hasPausable) patterns.push('Circuit Breaker Pattern');
    
    const hasTimelock = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('timelock')
    );
    if (hasTimelock) patterns.push('Timelock Pattern');
    
    return patterns.length > 0 ? patterns : ['Standard Contract Pattern'];
  }

  private analyzeGasOptimization(repoData: ProcessedRepository): GasAnalysis {
    const optimizations = [];
    const concerns = [];
    
    // Check for optimizations
    const hasBatchOperations = repoData.contractAnalysis.some(c => 
      c.functions.some(f => f.name.toLowerCase().includes('batch'))
    );
    if (hasBatchOperations) optimizations.push('Batch operations implemented');
    
    const hasPackedStructs = repoData.files.some(f => 
      f.content.includes('packed') || f.content.includes('uint128') || f.content.includes('uint64')
    );
    if (hasPackedStructs) optimizations.push('Storage packing utilized');
    
    const hasImmutable = repoData.files.some(f => 
      f.content.includes('immutable')
    );
    if (hasImmutable) optimizations.push('Immutable variables used');
    
    // Check for concerns
    const avgComplexity = this.calculateAverageComplexity(repoData);
    if (avgComplexity > 7) concerns.push('High contract complexity may increase gas costs');
    
    const hasLoops = repoData.files.some(f => 
      f.content.includes('for (') || f.content.includes('while (')
    );
    if (hasLoops) concerns.push('Loop operations detected - potential gas limit issues');
    
    const hasMultipleExternalCalls = repoData.contractAnalysis.some(c => 
      c.functions.filter(f => f.name.toLowerCase().includes('call')).length > 2
    );
    if (hasMultipleExternalCalls) concerns.push('Multiple external calls may increase gas costs');
    
    // Calculate efficiency score
    const optimizationScore = Math.min(optimizations.length * 2, 6);
    const concernPenalty = Math.min(concerns.length * 1.5, 4);
    const efficiency = Math.max(1, Math.min(10, 5 + optimizationScore - concernPenalty));
    
    return {
      efficiency: Math.round(efficiency * 10) / 10,
      optimizations: optimizations.length > 0 ? optimizations : ['Standard gas optimization practices'],
      concerns: concerns.length > 0 ? concerns : []
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
    const vulnerabilities: VulnerabilityDetail[] = []; // Will be populated by LLM
    const recommendations = this.generateSecurityRecommendations(repoData, docsData);
    const auditStatus = this.checkAuditStatus(repoData, docsData);

    console.log('✅ AnalysisEngine: Security analysis completed');
    return {
      rating,
      businessLogic,
      strengths,
      vulnerabilities,
      recommendations,
      auditStatus,
      documentationCodeMismatches: []
    };
  }

  private calculateSecurityRating(contracts: ContractAnalysis[]): SecurityRating {
    let score = 70; // Base score
    
    // Check for security features
    const hasAccessControl = contracts.some(c => 
      c.imports.some(imp => imp.includes('AccessControl') || imp.includes('Ownable'))
    );
    if (hasAccessControl) score += 10;
    
    const hasReentrancyGuard = contracts.some(c => 
      c.imports.some(imp => imp.includes('ReentrancyGuard'))
    );
    if (hasReentrancyGuard) score += 10;
    
    const hasPausable = contracts.some(c => 
      c.imports.some(imp => imp.includes('Pausable'))
    );
    if (hasPausable) score += 5;
    
    // Penalize for complexity
    const avgComplexity = contracts.reduce((sum, c) => sum + c.complexity, 0) / contracts.length;
    if (avgComplexity > 8) score -= 15;
    else if (avgComplexity > 6) score -= 10;
    
    // Convert to letter grade
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  private analyzeBusinessLogic(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const contractCount = repoData.contractAnalysis.length;
    const avgComplexity = this.calculateAverageComplexity(repoData);
    const hasGovernance = docsData.content.toLowerCase().includes('governance') || 
                         repoData.contractAnalysis.some(c => c.contractName.toLowerCase().includes('governance'));
    
    let analysis = `The protocol's business logic centers around ${contractCount} smart contracts with an average complexity of ${avgComplexity}/10. `;
    
    if (hasGovernance) {
      analysis += `The system incorporates governance mechanisms for decentralized decision-making, allowing token holders to participate in protocol upgrades and parameter adjustments. `;
    }
    
    analysis += `Core business operations are distributed across multiple contracts to ensure modularity and upgradeability. `;
    
    const hasVault = repoData.contractAnalysis.some(c => c.contractName.toLowerCase().includes('vault'));
    if (hasVault) {
      analysis += `Asset management is handled through vault contracts that secure user funds and manage liquidity. `;
    }
    
    const hasOracle = docsData.content.toLowerCase().includes('oracle') || 
                     repoData.contractAnalysis.some(c => c.contractName.toLowerCase().includes('oracle'));
    if (hasOracle) {
      analysis += `The protocol relies on external price feeds and oracles for accurate market data, introducing dependencies on third-party services. `;
    }
    
    analysis += `The business logic emphasizes ${avgComplexity > 7 ? 'sophisticated' : 'straightforward'} operations with ${avgComplexity > 7 ? 'multiple layers of validation and complex state management' : 'clear execution paths and minimal state complexity'}.`;
    
    return analysis;
  }

  private extractSecurityStrengths(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    const strengths = [];
    
    // Check for security patterns
    const hasAccessControl = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('AccessControl') || imp.includes('Ownable'))
    );
    if (hasAccessControl) strengths.push('Comprehensive access control implementation with role-based permissions');
    
    const hasReentrancyGuard = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('ReentrancyGuard'))
    );
    if (hasReentrancyGuard) strengths.push('Reentrancy protection implemented across critical functions');
    
    const hasPausable = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('Pausable'))
    );
    if (hasPausable) strengths.push('Emergency pause mechanisms for crisis management');
    
    const hasTimelock = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('timelock')
    );
    if (hasTimelock) strengths.push('Timelock delays for critical administrative functions');
    
    const hasMultiSig = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('multisig')
    );
    if (hasMultiSig) strengths.push('Multi-signature wallet integration for enhanced security');
    
    const usesOpenZeppelin = repoData.dependencies.some(dep => 
      dep.includes('openzeppelin')
    );
    if (usesOpenZeppelin) strengths.push('Utilizes battle-tested OpenZeppelin security libraries');
    
    const hasEvents = repoData.contractAnalysis.some(c => c.events.length > 0);
    if (hasEvents) strengths.push('Comprehensive event logging for transparency and monitoring');
    
    return strengths.length > 0 ? strengths : ['Basic security measures implemented'];
  }

  private generateSecurityRecommendations(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    const recommendations = [];
    
    // Check for missing security features
    const hasReentrancyGuard = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('ReentrancyGuard'))
    );
    if (!hasReentrancyGuard) recommendations.push('Implement reentrancy guards on all state-changing functions');
    
    const hasPausable = repoData.contractAnalysis.some(c => 
      c.imports.some(imp => imp.includes('Pausable'))
    );
    if (!hasPausable) recommendations.push('Add emergency pause functionality for crisis management');
    
    const hasTimelock = repoData.contractAnalysis.some(c => 
      c.contractName.toLowerCase().includes('timelock')
    );
    if (!hasTimelock) recommendations.push('Implement timelock delays for administrative functions');
    
    const avgComplexity = this.calculateAverageComplexity(repoData);
    if (avgComplexity > 7) {
      recommendations.push('Consider breaking down complex contracts into smaller, more manageable modules');
      recommendations.push('Conduct thorough testing of complex business logic paths');
    }
    
    const hasOracle = docsData.content.toLowerCase().includes('oracle');
    if (hasOracle) {
      recommendations.push('Implement oracle price validation and circuit breakers');
      recommendations.push('Consider using multiple oracle sources for price feed redundancy');
    }
    
    recommendations.push('Conduct comprehensive security audit before mainnet deployment');
    recommendations.push('Implement comprehensive monitoring and alerting systems');
    
    return recommendations;
  }

  private checkAuditStatus(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const content = (docsData.content + repoData.description).toLowerCase();
    
    if (content.includes('audited by') || content.includes('audit report')) {
      return 'Security audit completed - review audit reports for detailed findings';
    }
    
    if (content.includes('audit') && content.includes('pending')) {
      return 'Security audit in progress - awaiting completion';
    }
    
    if (content.includes('audit') && content.includes('planned')) {
      return 'Security audit planned but not yet initiated';
    }
    
    return 'No public audit information available - recommend professional security review';
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
        return new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo).');
      } else if (error.message.includes('Failed to fetch documentation')) {
        return new Error('Failed to fetch documentation. Please check the URL and try again.');
      } else {
        return new Error(`Analysis failed: ${error.message}`);
      }
    }
    
    return new Error('Failed to analyze protocol due to an unexpected error');
  }
}

// Export the AnalysisResult type for use in other components
export type { AnalysisResult };