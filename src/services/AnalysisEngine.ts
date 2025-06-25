import { DocumentProcessor, ProcessedRepository, DocumentContent, ContractAnalysis } from './DocumentProcessor';

export interface AnalysisResult {
  summary: ProtocolSummary;
  architecture: ArchitectureAnalysis;
  security: SecurityAnalysis;
  timestamp: string;
}

export interface ProtocolSummary {
  name: string;
  description: string;
  category: string;
  complexityScore: number;
  overview: string;
  keyFeatures: string[];
  web3Fundamentals: string;
  economicModel: EconomicModel;
}

export interface EconomicModel {
  tokenomics: string[];
  feeStructure: string[];
  incentives: string[];
  governance: string;
}

export interface ArchitectureAnalysis {
  coreContracts: ContractInfo[];
  dependencies: string[];
  dataFlow: string;
  interactionDiagram: string;
  inheritanceDiagram: string;
  designPatterns: string[];
  gasOptimization: GasAnalysis;
}

export interface ContractInfo {
  name: string;
  description: string;
  functions: number;
  complexity: number;
  role: string;
}

export interface GasAnalysis {
  efficiency: number;
  optimizations: string[];
  concerns: string[];
}

export interface SecurityAnalysis {
  rating: string;
  businessLogic: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
  auditStatus: string;
}

export class AnalysisEngine {
  private documentProcessor: DocumentProcessor;

  constructor(githubToken?: string) {
    this.documentProcessor = new DocumentProcessor(githubToken);
  }

  async analyzeProtocol(githubUrl: string, docsUrl: string): Promise<AnalysisResult> {
    console.log('🚀 AnalysisEngine: Starting protocol analysis...');
    console.log('📍 GitHub URL:', githubUrl);
    console.log('📍 Documentation URL:', docsUrl);
    
    try {
      // Process GitHub repository
      console.log('📂 AnalysisEngine: Starting GitHub repository processing...');
      const repoData = await this.documentProcessor.processGitHubRepository(githubUrl);
      console.log('✅ AnalysisEngine: GitHub repository processing completed');
      console.log('📊 Repository data:', {
        name: repoData.name,
        filesCount: repoData.files.length,
        contractsCount: repoData.contractAnalysis.length,
        dependenciesCount: repoData.dependencies.length
      });
      
      // Process documentation
      console.log('📄 AnalysisEngine: Starting documentation processing...');
      const docsData = await this.documentProcessor.processDocumentationUrl(docsUrl);
      console.log('✅ AnalysisEngine: Documentation processing completed');
      console.log('📊 Documentation data:', {
        title: docsData.title,
        contentLength: docsData.content.length,
        sectionsCount: docsData.sections.length,
        linksCount: docsData.links.length
      });
      
      // Generate comprehensive analysis
      console.log('🔍 AnalysisEngine: Starting summary generation...');
      const summary = this.generateSummary(repoData, docsData);
      console.log('✅ AnalysisEngine: Summary generation completed');
      
      console.log('🏗️ AnalysisEngine: Starting architecture analysis...');
      const architecture = this.generateArchitectureAnalysis(repoData);
      console.log('✅ AnalysisEngine: Architecture analysis completed');
      
      console.log('🔒 AnalysisEngine: Starting security analysis...');
      const security = this.generateSecurityAnalysis(repoData, docsData);
      console.log('✅ AnalysisEngine: Security analysis completed');
      
      console.log('🎯 AnalysisEngine: Preparing final analysis result...');
      const result = {
        summary,
        architecture,
        security,
        timestamp: new Date().toISOString()
      };
      
      console.log('🎉 AnalysisEngine: Protocol analysis completed successfully!');
      console.log('📈 Final result summary:', {
        protocolName: result.summary.name,
        category: result.summary.category,
        complexityScore: result.summary.complexityScore,
        securityRating: result.security.rating,
        coreContractsCount: result.architecture.coreContracts.length
      });
      
      return result;
    } catch (error) {
      console.error('❌ AnalysisEngine: Error in analyzeProtocol:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded. Please try again later or provide a GitHub token for higher rate limits.');
        } else if (error.message.includes('CORS')) {
          throw new Error('Unable to access documentation due to CORS policy. Please ensure the documentation URL is publicly accessible.');
        } else if (error.message.includes('Invalid GitHub URL')) {
          throw new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo).');
        } else {
          throw new Error(`Analysis failed: ${error.message}`);
        }
      }
      
      throw new Error('Failed to analyze protocol due to an unexpected error');
    }
  }

  private generateSummary(repoData: ProcessedRepository, docsData: DocumentContent): ProtocolSummary {
    console.log('📝 AnalysisEngine: Starting generateSummary...');
    console.log('📊 Input data for summary:', {
      repoName: repoData.name,
      contractsCount: repoData.contractAnalysis.length,
      docsContentLength: docsData.content.length
    });
    
    const contractCount = repoData.contractAnalysis.length;
    const totalFunctions = repoData.contractAnalysis.reduce((sum, contract) => sum + contract.functions.length, 0);
    const avgComplexity = repoData.contractAnalysis.reduce((sum, contract) => sum + contract.complexity, 0) / contractCount || 0;
    
    console.log('🔢 Summary calculations:', {
      contractCount,
      totalFunctions,
      avgComplexity
    });
    
    // Determine protocol category based on contracts and documentation
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
    
    const result = {
      name: repoData.name,
      description: repoData.description,
      category,
      complexityScore: Math.round(avgComplexity * 10) / 10,
      overview,
      keyFeatures,
      web3Fundamentals,
      economicModel
    };
    
    console.log('✅ AnalysisEngine: generateSummary completed successfully');
    return result;
  }

  private generateArchitectureAnalysis(repoData: ProcessedRepository): ArchitectureAnalysis {
    console.log('🏗️ AnalysisEngine: Starting generateArchitectureAnalysis...');
    console.log('📊 Input data for architecture:', {
      contractsCount: repoData.contractAnalysis.length,
      dependenciesCount: repoData.dependencies.length
    });
    
    // Analyze core contracts
    console.log('🔍 Analyzing core contracts...');
    const coreContracts = repoData.contractAnalysis.map(contract => ({
      name: contract.contractName,
      description: this.generateContractDescription(contract),
      functions: contract.functions.length,
      complexity: contract.complexity,
      role: this.determineContractRole(contract)
    }));
    console.log('📋 Core contracts analyzed:', coreContracts.length);
    
    // Generate Mermaid.js diagrams
    console.log('📊 Generating data flow diagram...');
    const dataFlow = this.generateDataFlowDiagram(repoData.contractAnalysis);
    console.log('✅ Data flow diagram generated, length:', dataFlow.length);
    
    console.log('🔄 Generating interaction diagram...');
    const interactionDiagram = this.generateInteractionDiagram(repoData.contractAnalysis);
    console.log('✅ Interaction diagram generated, length:', interactionDiagram.length);
    
    console.log('🌳 Generating inheritance diagram...');
    const inheritanceDiagram = this.generateInheritanceDiagram(repoData.contractAnalysis);
    console.log('✅ Inheritance diagram generated, length:', inheritanceDiagram.length);
    
    // Identify design patterns
    console.log('🎨 Identifying design patterns...');
    const designPatterns = this.identifyDesignPatterns(repoData.contractAnalysis);
    console.log('✅ Design patterns identified:', designPatterns);
    
    // Analyze gas optimization
    console.log('⛽ Analyzing gas optimization...');
    const gasOptimization = this.analyzeGasOptimization(repoData.contractAnalysis);
    console.log('✅ Gas optimization analyzed:', gasOptimization);
    
    const result = {
      coreContracts,
      dependencies: repoData.dependencies,
      dataFlow,
      interactionDiagram,
      inheritanceDiagram,
      designPatterns,
      gasOptimization
    };
    
    console.log('✅ AnalysisEngine: generateArchitectureAnalysis completed successfully');
    return result;
  }

  private generateSecurityAnalysis(repoData: ProcessedRepository, docsData: DocumentContent): SecurityAnalysis {
    console.log('🔒 AnalysisEngine: Starting generateSecurityAnalysis...');
    console.log('📊 Input data for security:', {
      contractsCount: repoData.contractAnalysis.length,
      docsContentLength: docsData.content.length
    });
    
    // Calculate security rating
    console.log('📊 Calculating security rating...');
    const rating = this.calculateSecurityRating(repoData.contractAnalysis);
    console.log('✅ Security rating calculated:', rating);
    
    // Generate business logic explanation
    console.log('💼 Generating business logic explanation...');
    const businessLogic = this.generateBusinessLogicExplanation(repoData, docsData);
    console.log('✅ Business logic explanation generated, length:', businessLogic.length);
    
    // Identify strengths
    console.log('💪 Identifying security strengths...');
    const strengths = this.identifySecurityStrengths(repoData.contractAnalysis);
    console.log('✅ Security strengths identified:', strengths.length, 'items');
    
    // Identify vulnerabilities
    console.log('⚠️ Identifying vulnerabilities...');
    const vulnerabilities = this.identifyVulnerabilities(repoData.contractAnalysis);
    console.log('✅ Vulnerabilities identified:', vulnerabilities.length, 'items');
    
    // Generate recommendations
    console.log('💡 Generating security recommendations...');
    const recommendations = this.generateSecurityRecommendations(vulnerabilities);
    console.log('✅ Security recommendations generated:', recommendations.length, 'items');
    
    // Check audit status
    console.log('🔍 Checking audit status...');
    const auditStatus = this.checkAuditStatus(repoData, docsData);
    console.log('✅ Audit status checked:', auditStatus);
    
    const result = {
      rating,
      businessLogic,
      strengths,
      vulnerabilities,
      recommendations,
      auditStatus
    };
    
    console.log('✅ AnalysisEngine: generateSecurityAnalysis completed successfully');
    return result;
  }

  private determineProtocolCategory(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const content = (docsData.content + ' ' + repoData.description).toLowerCase();
    
    if (content.includes('dex') || content.includes('exchange') || content.includes('swap')) {
      return 'Decentralized Exchange (DEX)';
    } else if (content.includes('lending') || content.includes('borrow')) {
      return 'Lending Protocol';
    } else if (content.includes('derivative') || content.includes('futures') || content.includes('perpetual')) {
      return 'Derivatives Trading';
    } else if (content.includes('yield') || content.includes('farming') || content.includes('staking')) {
      return 'Yield Farming';
    } else if (content.includes('governance') || content.includes('dao')) {
      return 'Governance Protocol';
    } else if (content.includes('bridge') || content.includes('cross-chain')) {
      return 'Cross-Chain Bridge';
    } else if (content.includes('nft') || content.includes('collectible')) {
      return 'NFT Protocol';
    } else {
      return 'DeFi Protocol';
    }
  }

  private generateOverview(repoData: ProcessedRepository, docsData: DocumentContent, category: string): string {
    const contractCount = repoData.contractAnalysis.length;
    const hasGovernance = repoData.contractAnalysis.some(c => c.contractName.toLowerCase().includes('governance'));
    const hasToken = repoData.contractAnalysis.some(c => c.contractName.toLowerCase().includes('token'));
    
    return `
The ${repoData.name} represents a sophisticated ${category.toLowerCase()} built on blockchain technology. The protocol implements ${contractCount} core smart contracts with advanced ${category.toLowerCase()} mechanisms.

## Key Architectural Components:
- **Smart Contract System**: ${contractCount} interconnected contracts managing core protocol logic
- **Decentralized Architecture**: Trustless execution without intermediaries
${hasGovernance ? '- **Governance System**: Decentralized parameter management and protocol upgrades' : ''}
${hasToken ? '- **Token Integration**: Native token for protocol operations and incentives' : ''}
- **Security Framework**: Multi-layered security with access controls and validation

## Web3 Protocol Fundamentals:
Web3 protocols are decentralized systems that operate on blockchain networks, enabling trustless interactions without intermediaries. The ${repoData.name} exemplifies this by:

1. **Decentralization**: No single point of control, distributed across network participants
2. **Transparency**: All transactions and logic are publicly verifiable on-chain
3. **Composability**: Can interact with other DeFi protocols seamlessly
4. **Permissionless**: Anyone can participate without requiring approval
5. **Immutability**: Protocol rules are enforced by blockchain consensus

The smart contract architecture follows modern design patterns with clear separation of concerns, ensuring maintainability and upgradability while preserving decentralization principles.
    `.trim();
  }

  private extractKeyFeatures(repoData: ProcessedRepository, docsData: DocumentContent): string[] {
    const features: string[] = [];
    const content = docsData.content.toLowerCase();
    
    // Extract features based on contract analysis and documentation
    if (repoData.contractAnalysis.some(c => c.functions.some(f => f.name.includes('swap')))) {
      features.push('Token Swapping');
    }
    if (repoData.contractAnalysis.some(c => c.functions.some(f => f.name.includes('stake')))) {
      features.push('Staking Mechanism');
    }
    if (repoData.contractAnalysis.some(c => c.functions.some(f => f.name.includes('governance')))) {
      features.push('Decentralized Governance');
    }
    if (content.includes('liquidity')) {
      features.push('Liquidity Management');
    }
    if (content.includes('yield')) {
      features.push('Yield Generation');
    }
    if (content.includes('oracle')) {
      features.push('Oracle Integration');
    }
    
    return features.length > 0 ? features : ['Smart Contract Automation', 'Decentralized Operations', 'Blockchain Integration'];
  }

  private generateWeb3Fundamentals(category: string): string {
    return `
Web3 protocols represent the next evolution of internet infrastructure, built on blockchain technology to enable decentralized applications (dApps). As a ${category}, this protocol demonstrates key Web3 principles:

**Decentralization**: Unlike traditional centralized systems, Web3 protocols distribute control across network participants, eliminating single points of failure and censorship risks.

**Trustless Interactions**: Smart contracts automatically execute agreements without requiring trust between parties, using cryptographic proofs and blockchain consensus.

**Composability**: Web3 protocols can seamlessly interact with each other, creating a composable ecosystem where protocols build upon each other's functionality.

**Transparency**: All protocol operations are recorded on-chain, providing complete transparency and auditability of all transactions and state changes.

**Permissionless Innovation**: Anyone can interact with or build upon Web3 protocols without requiring permission from centralized authorities.
    `.trim();
  }

  private analyzeEconomicModel(docsData: DocumentContent): EconomicModel {
    const content = docsData.content.toLowerCase();
    
    const tokenomics = [];
    const feeStructure = [];
    const incentives = [];
    let governance = 'Token-based governance system';
    
    // Extract economic information from documentation
    if (content.includes('fee')) {
      feeStructure.push('Transaction fees for protocol usage');
    }
    if (content.includes('reward')) {
      incentives.push('Rewards for protocol participation');
    }
    if (content.includes('token')) {
      tokenomics.push('Native token for protocol operations');
    }
    
    return {
      tokenomics: tokenomics.length > 0 ? tokenomics : ['Utility token for protocol access'],
      feeStructure: feeStructure.length > 0 ? feeStructure : ['Standard protocol fees'],
      incentives: incentives.length > 0 ? incentives : ['Participation incentives'],
      governance
    };
  }

  private generateContractDescription(contract: ContractAnalysis): string {
    const role = this.determineContractRole(contract);
    return `${role} with ${contract.functions.length} functions and complexity score of ${contract.complexity.toFixed(1)}`;
  }

  private determineContractRole(contract: ContractAnalysis): string {
    const name = contract.contractName.toLowerCase();
    
    if (name.includes('token')) return 'Token management contract';
    if (name.includes('governance')) return 'Governance and voting contract';
    if (name.includes('vault') || name.includes('pool')) return 'Asset management contract';
    if (name.includes('router') || name.includes('exchange')) return 'Trading logic contract';
    if (name.includes('factory')) return 'Contract deployment factory';
    if (name.includes('oracle')) return 'Price feed oracle contract';
    if (name.includes('staking')) return 'Staking rewards contract';
    
    return 'Core protocol contract';
  }

  private generateDataFlowDiagram(contracts: ContractAnalysis[]): string {
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
      const contractName = contract.contractName.replace(/[^a-zA-Z0-9]/g, '');
      mermaidCode += `    Entry --> ${nodeId}[📄 ${contractName}]\n`;
      
      // Add function flows for complex contracts
      if (contract.functions.length > 5) {
        mermaidCode += `    ${nodeId} --> ${nodeId}_Logic[⚙️ Business Logic]\n`;
        mermaidCode += `    ${nodeId}_Logic --> ${nodeId}_State[💾 State Updates]\n`;
      }
    });
    
    // Add external interactions
    mermaidCode += '    C0 --> External[🌐 External Calls]\n';
    mermaidCode += '    External --> Events[📡 Event Emission]\n';
    
    return mermaidCode;
  }

  private generateInteractionDiagram(contracts: ContractAnalysis[]): string {
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
      const contractName = contract.contractName.replace(/[^a-zA-Z0-9]/g, '');
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

  private identifyDesignPatterns(contracts: ContractAnalysis[]): string[] {
    const patterns: string[] = [];
    
    // Check for common patterns based on contract structure
    if (contracts.some(c => c.contractName.includes('Factory'))) {
      patterns.push('Factory Pattern');
    }
    if (contracts.some(c => c.modifiers.length > 0)) {
      patterns.push('Access Control Pattern');
    }
    if (contracts.some(c => c.functions.some(f => f.name.includes('pause')))) {
      patterns.push('Circuit Breaker Pattern');
    }
    if (contracts.some(c => c.inheritance.length > 0)) {
      patterns.push('Inheritance Pattern');
    }
    if (contracts.some(c => c.functions.some(f => f.name.includes('proxy') || f.name.includes('delegate')))) {
      patterns.push('Proxy Pattern');
    }
    if (contracts.some(c => c.contractName.toLowerCase().includes('registry'))) {
      patterns.push('Registry Pattern');
    }
    
    return patterns.length > 0 ? patterns : ['Modular Architecture', 'Separation of Concerns'];
  }

  private analyzeGasOptimization(contracts: ContractAnalysis[]): GasAnalysis {
    const totalFunctions = contracts.reduce((sum, c) => sum + c.functions.length, 0);
    const avgComplexity = contracts.reduce((sum, c) => sum + c.complexity, 0) / contracts.length;
    
    // Simple heuristic for gas efficiency
    const efficiency = Math.max(1, Math.min(10, 10 - avgComplexity));
    
    const optimizations = [
      'Use of efficient data structures',
      'Batch operations where possible',
      'Optimized storage patterns'
    ];
    
    // Add specific optimizations based on contract analysis
    if (contracts.some(c => c.functions.some(f => f.name.includes('batch')))) {
      optimizations.push('Batch function implementations detected');
    }
    if (contracts.some(c => c.modifiers.length > 0)) {
      optimizations.push('Modifier usage for code reusability');
    }
    
    const concerns = [];
    if (avgComplexity > 7) {
      concerns.push('High complexity may lead to increased gas costs');
    }
    if (totalFunctions > 50) {
      concerns.push('Large number of functions may impact deployment costs');
    }
    if (contracts.some(c => c.functions.some(f => f.name.includes('loop')))) {
      concerns.push('Potential loop operations may cause gas limit issues');
    }
    
    return {
      efficiency: Math.round(efficiency * 10) / 10,
      optimizations,
      concerns
    };
  }

  private calculateSecurityRating(contracts: ContractAnalysis[]): string {
    let score = 8; // Base score
    
    // Adjust based on various factors
    const hasModifiers = contracts.some(c => c.modifiers.length > 0);
    const hasEvents = contracts.some(c => c.events.length > 0);
    const avgComplexity = contracts.reduce((sum, c) => sum + c.complexity, 0) / contracts.length;
    const hasAccessControl = contracts.some(c => 
      c.modifiers.some(m => m.name.toLowerCase().includes('only')) ||
      c.functions.some(f => f.modifiers.some(mod => mod.toLowerCase().includes('only')))
    );
    
    if (hasModifiers) score += 0.5;
    if (hasEvents) score += 0.3;
    if (hasAccessControl) score += 0.7;
    if (avgComplexity > 8) score -= 1;
    if (contracts.some(c => c.functions.some(f => f.name.includes('pause')))) score += 0.5;
    
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'A-';
    if (score >= 6) return 'B+';
    return 'B';
  }

  private generateBusinessLogicExplanation(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const category = this.determineProtocolCategory(repoData, docsData);
    
    return `
The ${repoData.name}'s core business logic revolves around ${category.toLowerCase()} with sophisticated smart contract automation. The system enables users to interact with decentralized financial primitives while maintaining protocol security and efficiency through:

• **Automated Execution**: Smart contracts handle all business logic without human intervention
• **State Management**: Comprehensive tracking of user positions and protocol state
• **Access Control**: Role-based permissions ensuring only authorized operations
• **Event Logging**: Complete audit trail of all protocol interactions
• **Economic Incentives**: Aligned incentives for all protocol participants

The protocol architecture ensures trustless operation while maintaining flexibility for future upgrades and parameter adjustments through decentralized governance mechanisms.
    `.trim();
  }

  private identifySecurityStrengths(contracts: ContractAnalysis[]): string[] {
    const strengths: string[] = [];
    
    if (contracts.some(c => c.modifiers.length > 0)) {
      strengths.push('Comprehensive access control implementation with role-based permissions');
    }
    if (contracts.some(c => c.functions.some(f => f.modifiers.length > 0))) {
      strengths.push('Function-level security modifiers for critical operations');
    }
    if (contracts.some(c => c.events.length > 0)) {
      strengths.push('Comprehensive event logging for audit trails and monitoring');
    }
    if (contracts.some(c => c.functions.some(f => f.name.includes('pause')))) {
      strengths.push('Emergency pause mechanisms for protocol-wide risk mitigation');
    }
    if (contracts.some(c => c.inheritance.length > 0)) {
      strengths.push('Modular inheritance structure promoting code reusability and security');
    }
    if (contracts.some(c => c.functions.some(f => f.name.includes('validate')))) {
      strengths.push('Input validation mechanisms for data integrity');
    }
    
    return strengths.length > 0 ? strengths : [
      'Modular contract architecture for maintainability',
      'Standard security practices implementation',
      'Clear separation of concerns in contract design'
    ];
  }

  private identifyVulnerabilities(contracts: ContractAnalysis[]): string[] {
    const vulnerabilities: string[] = [];
    
    // Check for potential issues based on contract analysis
    const avgComplexity = contracts.reduce((sum, c) => sum + c.complexity, 0) / contracts.length;
    
    if (avgComplexity > 8) {
      vulnerabilities.push('High contract complexity may increase attack surface');
    }
    
    if (contracts.some(c => c.functions.some(f => f.name.includes('call')))) {
      vulnerabilities.push('External calls present potential reentrancy risks');
    }
    
    if (!contracts.some(c => c.functions.some(f => f.name.includes('pause')))) {
      vulnerabilities.push('Lack of emergency pause mechanism for critical situations');
    }
    
    if (contracts.some(c => c.functions.some(f => f.stateMutability === 'payable' && f.modifiers.length === 0))) {
      vulnerabilities.push('Payable functions without proper access control modifiers');
    }
    
    if (!contracts.some(c => c.modifiers.some(m => m.name.toLowerCase().includes('reentrancy')))) {
      vulnerabilities.push('No explicit reentrancy protection detected');
    }
    
    return vulnerabilities.length > 0 ? vulnerabilities : [
      'Standard smart contract risks apply',
      'Oracle dependency risks if using external price feeds',
      'Governance centralization risks during initial phases'
    ];
  }

  private generateSecurityRecommendations(vulnerabilities: string[]): string[] {
    const recommendations: string[] = [];
    
    vulnerabilities.forEach(vuln => {
      if (vuln.includes('complexity')) {
        recommendations.push('Consider breaking down complex contracts into smaller, focused modules');
      }
      if (vuln.includes('reentrancy')) {
        recommendations.push('Implement reentrancy guards on all external call functions');
      }
      if (vuln.includes('pause')) {
        recommendations.push('Add emergency pause functionality for critical protocol functions');
      }
      if (vuln.includes('payable')) {
        recommendations.push('Add proper access control modifiers to all payable functions');
      }
      if (vuln.includes('protection')) {
        recommendations.push('Implement explicit reentrancy protection using OpenZeppelin ReentrancyGuard');
      }
    });
    
    // Add general recommendations
    recommendations.push('Conduct comprehensive security audits before mainnet deployment');
    recommendations.push('Implement gradual rollout with monitoring and circuit breakers');
    recommendations.push('Establish bug bounty program for ongoing security assessment');
    recommendations.push('Use formal verification tools for critical contract functions');
    
    return recommendations;
  }

  private checkAuditStatus(repoData: ProcessedRepository, docsData: DocumentContent): string {
    const content = (docsData.content + ' ' + repoData.description).toLowerCase();
    
    if (content.includes('audit') && content.includes('complete')) {
      return 'Security audit completed by recognized auditing firm';
    } else if (content.includes('audit')) {
      return 'Security audit in progress or planned';
    } else if (content.includes('certik') || content.includes('consensys') || content.includes('openzeppelin')) {
      return 'Professional security audit mentioned in documentation';
    } else {
      return 'No public audit information available - recommend professional security audit';
    }
  }
}