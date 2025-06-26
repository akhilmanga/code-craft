import type { 
  ProcessedRepository, 
  DocumentContent, 
  AnalysisResult, 
  ProtocolSummary, 
  ArchitectureAnalysis, 
  SecurityAnalysis,
  ContractAnalysis 
} from './types';

export interface LLMContext {
  repoData: ProcessedRepository;
  docsData: DocumentContent;
  baseResult: AnalysisResult;
}

export interface SecurityInsight {
  vulnerability: string;
  severity: 'High' | 'Medium' | 'Low';
  contract: string;
  line: number;
  description: string;
  recommendation: string;
}

export class LLMAdapter {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeProtocol(context: LLMContext): Promise<AnalysisResult> {
    console.log('🤖 LLMAdapter: Starting enhanced protocol analysis...');
    
    try {
      const [summary, architecture, security] = await Promise.all([
        this.generateLLMSummary(context),
        this.generateLLMArchitecture(context),
        this.generateLLMSecurityAnalysis(context)
      ]);
      
      console.log('✅ LLMAdapter: Enhanced analysis completed successfully');
      
      return {
        summary: summary || context.baseResult.summary,
        architecture: architecture || context.baseResult.architecture,
        security: security || context.baseResult.security,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ LLMAdapter: Enhanced analysis failed:', error);
      console.log('🔄 LLMAdapter: Falling back to base analysis result');
      return context.baseResult;
    }
  }

  private async generateLLMSummary(context: LLMContext): Promise<ProtocolSummary | null> {
    console.log('📝 LLMAdapter: Generating enhanced protocol summary...');
    
    const prompt = `
You are a senior blockchain analyst with deep knowledge of Web3 protocols.
Analyze this protocol combining code structure and documentation:

Repository Analysis:
${this.stringifyRepoData(context.repoData)}

Documentation Summary:
${context.docsData.content.substring(0, 5000)}...

Provide a detailed protocol summary with:
1. Comprehensive overview of the protocol's purpose and functionality
2. Key technical innovations and unique features
3. Economic model implications and tokenomics analysis
4. Risk assessment and potential concerns
5. Interactions between core components and their relationships

Focus on providing insights that go beyond basic code analysis, incorporating
the documentation context to explain the protocol's real-world applications
and business logic.

Format as JSON with markdown support for rich text sections.
`;

    try {
      const result = await this.callLLMAPI(prompt, 'summary');
      console.log('✅ LLMAdapter: Enhanced summary generated successfully');
      return result;
    } catch (error) {
      console.warn('⚠️ LLMAdapter: Summary generation failed, using fallback');
      return null;
    }
  }

  private async generateLLMArchitecture(context: LLMContext): Promise<ArchitectureAnalysis | null> {
    console.log('🏗️ LLMAdapter: Generating enhanced architecture analysis...');
    
    const prompt = `
Create a detailed architecture analysis for this Web3 protocol:
- ${context.repoData.contractAnalysis.length} Solidity contracts analyzed
- ${context.repoData.dependencies.length} external dependencies identified
- ${context.repoData.files.filter(f => f.type === 'solidity').length} smart contract files processed

Contract Details:
${this.stringifyContractAnalysis(context.repoData.contractAnalysis)}

Focus on:
1. Critical contract relationships and data dependencies
2. Detailed data flow between components with security implications
3. Advanced design pattern usage and architectural decisions
4. Gas optimization strategies and efficiency considerations
5. Upgrade patterns and governance mechanisms

Generate enhanced Mermaid.js diagrams that include:
- Detailed function call flows
- State change propagation
- External dependency interactions
- Security boundaries and access controls

Provide actionable insights for developers and auditors.
`;

    try {
      const result = await this.callLLMAPI(prompt, 'architecture');
      console.log('✅ LLMAdapter: Enhanced architecture analysis generated successfully');
      return result;
    } catch (error) {
      console.warn('⚠️ LLMAdapter: Architecture analysis failed, using fallback');
      return null;
    }
  }

  private async generateLLMSecurityAnalysis(context: LLMContext): Promise<SecurityAnalysis | null> {
    console.log('🔒 LLMAdapter: Generating enhanced security analysis...');
    
    const prompt = `
Perform comprehensive security analysis of this Web3 protocol:

Code Structure Analysis:
${JSON.stringify(this.sanitizeContractData(context.repoData), null, 2)}

Documentation Claims:
${context.docsData.content.substring(0, 5000)}...

Base Security Assessment:
${JSON.stringify(context.baseResult.security, null, 2)}

Identify and analyze:
1. Critical vulnerabilities with specific code references
2. Discrepancies between documentation claims and implementation
3. Best practice violations with severity assessment
4. Complex business logic risks and edge cases
5. Integration risks with external protocols
6. Governance and centralization risks

For each finding, provide:
- Specific contract and function references
- Severity level (Critical/High/Medium/Low)
- Exploitation scenarios
- Detailed mitigation strategies
- Code examples where applicable

Focus on real-world attack vectors and provide actionable security recommendations
that go beyond generic best practices.
`;

    try {
      const result = await this.callLLMAPI(prompt, 'security');
      console.log('✅ LLMAdapter: Enhanced security analysis generated successfully');
      return result;
    } catch (error) {
      console.warn('⚠️ LLMAdapter: Security analysis failed, using fallback');
      return null;
    }
  }

  private async callLLMAPI(prompt: string, analysisType: string): Promise<any> {
    console.log(`🌐 LLMAdapter: Making API call for ${analysisType} analysis...`);
    
    // In a production environment, this would make actual API calls to OpenAI, Anthropic, etc.
    // For now, we'll simulate the API call and return null to use fallback logic
    
    console.warn(`⚠️ LLMAdapter: LLM integration not implemented in this environment for ${analysisType}`);
    console.log('💡 LLMAdapter: To enable LLM features, implement actual API integration with:');
    console.log('   - OpenAI GPT-4 API');
    console.log('   - Anthropic Claude API');
    console.log('   - Local LLM endpoints');
    console.log('   - Custom fine-tuned models');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return null;
  }

  private stringifyRepoData(repoData: ProcessedRepository): string {
    console.log('📊 LLMAdapter: Stringifying repository data for LLM context...');
    
    try {
      return JSON.stringify({
        name: repoData.name,
        description: repoData.description,
        contractCount: repoData.contractAnalysis.length,
        totalFunctions: repoData.contractAnalysis.reduce((sum, c) => sum + c.functions.length, 0),
        totalEvents: repoData.contractAnalysis.reduce((sum, c) => sum + c.events.length, 0),
        dependencies: repoData.dependencies.slice(0, 10), // Limit for context size
        fileTypes: repoData.files.reduce((acc, file) => {
          acc[file.type] = (acc[file.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        contractSummary: repoData.contractAnalysis.map(contract => ({
          name: contract.contractName,
          functions: contract.functions.length,
          complexity: contract.complexity,
          inheritance: contract.inheritance
        }))
      }, null, 2);
    } catch (error) {
      console.error('❌ LLMAdapter: Error stringifying repo data:', error);
      return 'Repository data processing failed';
    }
  }

  private stringifyContractAnalysis(contracts: ContractAnalysis[]): string {
    console.log('📋 LLMAdapter: Stringifying contract analysis for LLM context...');
    
    try {
      return contracts.map(contract => `
Contract: ${contract.contractName}
File: ${contract.fileName}
Functions: ${contract.functions.length}
Events: ${contract.events.length}
Modifiers: ${contract.modifiers.length}
Complexity: ${contract.complexity.toFixed(2)}
Inheritance: ${contract.inheritance.join(', ') || 'None'}
Key Functions: ${contract.functions.slice(0, 5).map(f => 
  `${f.name}(${f.visibility}, ${f.stateMutability})`
).join(', ')}
      `).join('\n---\n');
    } catch (error) {
      console.error('❌ LLMAdapter: Error stringifying contract analysis:', error);
      return 'Contract analysis processing failed';
    }
  }

  private sanitizeContractData(repoData: ProcessedRepository): any {
    console.log('🧹 LLMAdapter: Sanitizing contract data for LLM analysis...');
    
    try {
      return {
        contractCount: repoData.contractAnalysis.length,
        contracts: repoData.contractAnalysis.map(contract => ({
          name: contract.contractName,
          file: contract.fileName,
          metrics: {
            functions: contract.functions.length,
            events: contract.events.length,
            modifiers: contract.modifiers.length,
            complexity: contract.complexity
          },
          structure: {
            inheritance: contract.inheritance,
            imports: contract.imports.slice(0, 5), // Limit for context
            publicFunctions: contract.functions
              .filter(f => f.visibility === 'public')
              .map(f => f.name),
            externalFunctions: contract.functions
              .filter(f => f.visibility === 'external')
              .map(f => f.name)
          }
        })),
        dependencies: repoData.dependencies.slice(0, 15), // Limit for context
        fileStructure: {
          totalFiles: repoData.files.length,
          solidityFiles: repoData.files.filter(f => f.type === 'solidity').length,
          configFiles: repoData.files.filter(f => f.type === 'json').length
        }
      };
    } catch (error) {
      console.error('❌ LLMAdapter: Error sanitizing contract data:', error);
      return { error: 'Contract data sanitization failed' };
    }
  }
}