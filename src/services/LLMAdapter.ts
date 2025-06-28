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
  private baseUrl: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Use custom URL from environment or fallback to OpenAI default
    this.baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    console.log('🤖 LLMAdapter: Initialized with base URL:', this.baseUrl);
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

Return a JSON object with the following structure:
{
  "name": "Protocol Name",
  "description": "Brief description",
  "category": "DeFi Protocol",
  "complexityScore": 7.5,
  "overview": "Detailed overview...",
  "keyFeatures": ["Feature 1", "Feature 2"],
  "web3Fundamentals": "Web3 fundamentals explanation...",
  "economicModel": {
    "tokenomics": ["Token role 1", "Token role 2"],
    "feeStructure": ["Fee type 1", "Fee type 2"],
    "incentives": ["Incentive 1", "Incentive 2"],
    "governance": "Governance model description"
  }
}
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

Return a JSON object with the following structure:
{
  "coreContracts": [
    {
      "name": "ContractName",
      "description": "Contract description",
      "functions": 10,
      "complexity": 7.5,
      "role": "Core Protocol Contract"
    }
  ],
  "dependencies": ["dependency1", "dependency2"],
  "dataFlow": "Mermaid.js flowchart syntax",
  "interactionDiagram": "Mermaid.js sequence diagram syntax",
  "inheritanceDiagram": "Mermaid.js class diagram syntax",
  "designPatterns": ["Pattern1", "Pattern2"],
  "gasOptimization": {
    "efficiency": 8.0,
    "optimizations": ["Optimization 1", "Optimization 2"],
    "concerns": ["Concern 1", "Concern 2"]
  }
}
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

Return a JSON object with the following structure:
{
  "rating": "B+",
  "businessLogic": "Detailed business logic analysis...",
  "strengths": ["Strength 1", "Strength 2"],
  "vulnerabilities": ["Vulnerability 1", "Vulnerability 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "auditStatus": "Audit status description"
}
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
    console.log(`🌐 LLMAdapter: Making API call for ${analysisType} analysis to ${this.baseUrl}...`);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Web3 protocol analyst. Always respond with valid JSON objects as requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      
      try {
        // Try to parse the JSON response
        const parsedResult = JSON.parse(content);
        console.log(`✅ LLMAdapter: Successfully parsed ${analysisType} response`);
        return parsedResult;
      } catch (parseError) {
        console.warn(`⚠️ LLMAdapter: Failed to parse JSON response for ${analysisType}:`, parseError);
        console.log('Raw response:', content);
        return null;
      }

    } catch (error) {
      console.error(`❌ LLMAdapter: API call failed for ${analysisType}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (error.message.includes('429')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('fetch')) {
          throw new Error(`Network error: Unable to connect to ${this.baseUrl}. Please check your internet connection and API endpoint.`);
        }
      }
      
      throw error;
    }
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