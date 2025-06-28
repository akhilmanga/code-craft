import type { 
  ProcessedRepository, 
  DocumentContent, 
  AnalysisResult, 
  ProtocolSummary, 
  ArchitectureAnalysis, 
  SecurityAnalysis,
  ContractAnalysis,
  VulnerabilityDetail
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
You are a senior blockchain analyst with deep knowledge of Web3 protocols, DeFi mechanisms, and smart contract architecture.

Analyze this protocol combining code structure and documentation:

Repository Analysis:
${this.stringifyRepoData(context.repoData)}

Documentation Summary:
${context.docsData.content.substring(0, 5000)}...

Provide a comprehensive protocol summary with detailed explanations:

1. **Overview**: Write a thorough 3-4 paragraph overview explaining:
   - The protocol's core purpose and value proposition
   - How it fits into the broader DeFi/Web3 ecosystem
   - Key technical innovations and differentiators
   - Target users and use cases

2. **Key Features**: Extract and explain 5-8 key features with technical details

3. **Web3 Fundamentals**: Provide a detailed explanation (3-4 paragraphs) covering:
   - Blockchain fundamentals relevant to this protocol
   - DeFi concepts like liquidity, yield farming, AMMs, lending/borrowing
   - Token standards (ERC-20, ERC-721, etc.) used
   - Consensus mechanisms and gas optimization strategies
   - Interoperability and cross-chain considerations

4. **Economic Model**: Provide detailed analysis of:
   - Tokenomics: Token utility, supply mechanisms, distribution
   - Fee Structure: All types of fees and how they're calculated
   - Incentives: Reward mechanisms, yield generation, staking
   - Governance: Decision-making processes and token voting

5. **Risk Assessment**: Comprehensive risk analysis covering:
   - Technical risks (smart contract bugs, oracle failures)
   - Economic risks (token volatility, liquidity risks)
   - Governance risks (centralization, attack vectors)
   - Regulatory and compliance considerations

Return a JSON object with the following structure:
{
  "name": "Protocol Name",
  "description": "Brief description",
  "category": "DeFi Protocol",
  "complexityScore": 7.5,
  "overview": "Detailed 3-4 paragraph overview...",
  "keyFeatures": ["Feature 1 with technical details", "Feature 2 with technical details"],
  "web3Fundamentals": "Detailed 3-4 paragraph explanation of Web3/DeFi concepts...",
  "economicModel": {
    "tokenomics": ["Detailed tokenomics explanation 1", "Detailed tokenomics explanation 2"],
    "feeStructure": ["Detailed fee structure 1", "Detailed fee structure 2"],
    "incentives": ["Detailed incentive mechanism 1", "Detailed incentive mechanism 2"],
    "governance": "Detailed governance model description"
  },
  "riskAssessment": "Comprehensive risk analysis covering technical, economic, governance, and regulatory risks..."
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
Create a detailed smart contract architecture analysis for this Web3 protocol:
- ${context.repoData.contractAnalysis.length} Solidity contracts analyzed
- ${context.repoData.dependencies.length} external dependencies identified
- ${context.repoData.files.filter(f => f.type === 'solidity').length} smart contract files processed

Contract Details:
${this.stringifyContractAnalysis(context.repoData.contractAnalysis)}

Generate detailed Mermaid.js diagrams for smart contract architecture:

1. **Data Flow Diagram**: Create a flowchart using 'graph TD' syntax showing:
   - User interactions with the protocol
   - Data flow between smart contracts
   - External protocol integrations
   - State changes and storage updates

2. **Interaction Sequence Diagram**: Create a sequence diagram showing:
   - Step-by-step function call sequences
   - Cross-contract interactions
   - External protocol calls
   - Event emissions and state changes

3. **Contract Inheritance Diagram**: Create a class diagram showing:
   - Contract inheritance relationships
   - Interface implementations
   - Key functions and modifiers
   - Access control patterns

Focus on:
- Critical contract relationships and dependencies
- Security boundaries and access controls
- Gas optimization patterns
- Upgrade mechanisms and proxy patterns
- External protocol integrations

Return a JSON object with the following structure:
{
  "coreContracts": [
    {
      "name": "ContractName",
      "description": "Detailed contract description with purpose and key functions",
      "functions": 10,
      "complexity": 7.5,
      "role": "Specific role in the protocol architecture"
    }
  ],
  "dependencies": ["dependency1", "dependency2"],
  "dataFlow": "graph TD\\n    A[Users] --> B[MainContract]\\n    B --> C[VaultContract]\\n    C --> D[TokenContract]",
  "interactionDiagram": "sequenceDiagram\\n    participant U as User\\n    participant M as MainContract\\n    participant V as Vault\\n    U->>M: deposit()\\n    M->>V: updateBalance()",
  "inheritanceDiagram": "classDiagram\\n    class BaseContract {\\n        +onlyOwner()\\n        +pause()\\n    }\\n    BaseContract <|-- MainContract",
  "designPatterns": ["Factory Pattern", "Proxy Pattern", "Access Control"],
  "gasOptimization": {
    "efficiency": 8.0,
    "optimizations": ["Batch operations implemented", "Storage packing used"],
    "concerns": ["Complex loops in critical functions", "Multiple external calls"]
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
Perform comprehensive security analysis of this Web3 protocol with detailed vulnerability assessment:

Code Structure Analysis:
${JSON.stringify(this.sanitizeContractData(context.repoData), null, 2)}

Documentation Claims:
${context.docsData.content.substring(0, 5000)}...

Base Security Assessment:
${JSON.stringify(context.baseResult.security, null, 2)}

Provide detailed security analysis with:

1. **Vulnerability Details**: For each vulnerability found, provide:
   - Specific name and description
   - Severity level (Critical/High/Medium/Low)
   - Exploitability assessment (High/Medium/Low)
   - Category (e.g., "Reentrancy", "Access Control", "Oracle Manipulation")
   - Detailed mitigation strategies
   - Code references where applicable
   - Whether documentation accurately reflects the implementation

2. **Documentation-Code Mismatches**: Identify discrepancies between:
   - Documented security features vs actual implementation
   - Claimed functionality vs code behavior
   - Missing security measures mentioned in docs

3. **Risk Scoring**: Assign risk scores based on:
   - Potential impact on protocol and users
   - Likelihood of exploitation
   - Ease of exploitation
   - Financial impact potential

4. **Contextual Explanations**: Explain vulnerabilities in the context of:
   - This specific protocol's business logic
   - Real-world attack scenarios
   - Historical precedents in similar protocols

Return a JSON object with the following structure:
{
  "rating": "B+",
  "businessLogic": "Detailed business logic analysis with security implications...",
  "strengths": ["Comprehensive access control implementation", "Emergency pause mechanisms"],
  "vulnerabilities": [
    {
      "name": "Reentrancy Vulnerability in Withdrawal Function",
      "description": "The withdraw function in Contract.sol does not follow checks-effects-interactions pattern...",
      "severity": "High",
      "exploitability": "Medium",
      "category": "Reentrancy",
      "mitigation": "Implement ReentrancyGuard modifier and follow CEI pattern...",
      "codeReference": "Contract.sol:line 45-60",
      "docMismatch": false,
      "citation": "Based on analysis of function call patterns and state changes"
    }
  ],
  "recommendations": ["Implement comprehensive reentrancy protection", "Add time delays for critical operations"],
  "auditStatus": "No public audit information available",
  "documentationCodeMismatches": ["Documentation claims automatic slashing but no slashing mechanism found in code"]
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
          model: 'llama-3.3-70b',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Web3 protocol analyst and security researcher. Always respond with valid JSON objects as requested. Provide detailed, technical analysis with specific examples and actionable insights.'
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