/**
 * types.ts
 * Centralized type definitions for CodeCraft - Web3 Protocol Analyzer
 * Designed for modularity, hackathon demo compatibility, and future LLM integration
 */

// -----------------------------
// 📦 Core Analysis Result
// -----------------------------
export interface AnalysisResult {
  /**
   * High-level protocol summary with technical and economic context
   */
  summary: ProtocolSummary;

  /**
   * Contract architecture and design patterns
   */
  architecture: ArchitectureAnalysis;

  /**
   * Security insights and vulnerability prioritization
   */
  security: SecurityAnalysis;

  /**
   * Timestamp of analysis completion
   */
  timestamp: string;
}

// -----------------------------
// 🧾 Protocol Summary
// -----------------------------
export interface ProtocolSummary {
  /**
   * Protocol name extracted from code or docs
   */
  name: string;

  /**
   * Short description of the protocol
   */
  description: string;

  /**
   * Category derived from documentation and contract structure
   */
  category: ProtocolCategory;

  /**
   * Complexity score (1-10) based on function count and inheritance depth
   */
  complexityScore: number;

  /**
   * Detailed overview combining code structure and documentation
   */
  overview: string;

  /**
   * Key features extracted from documentation and contract logic
   */
  keyFeatures: string[];

  /**
   * Web3 fundamentals (blockchain, token standards, etc.)
   */
  web3Fundamentals: string;

  /**
   * Economic model details extracted from documentation
   */
  economicModel: EconomicModel;

  /**
   * Risk assessment summary
   */
  riskAssessment?: string;
}

export type ProtocolCategory =
  | 'DeFi Protocol'
  | 'Lending Protocol'
  | 'Derivatives Trading'
  | 'Yield Farming'
  | 'Governance Protocol'
  | 'Cross-Chain Bridge'
  | 'NFT Protocol'
  | 'Token Management'
  | 'Risk Management'
  | 'Other';

// -----------------------------
// 💰 Economic Model
// -----------------------------
export interface EconomicModel {
  /**
   * Tokenomics (token roles and supply mechanisms)
   */
  tokenomics: string[];

  /**
   * Fee structure (transaction, liquidity, governance fees)
   */
  feeStructure: string[];

  /**
   * Incentive mechanisms (rewards, yield, staking)
   */
  incentives: string[];

  /**
   * Governance model (DAO, multisig, centralized control)
   */
  governance: string;
}

// -----------------------------
// 🏗️ Architecture Analysis
// -----------------------------
export interface ArchitectureAnalysis {
  /**
   * List of core contracts with metadata
   */
  coreContracts: ContractInfo[];

  /**
   * External dependencies (e.g., OpenZeppelin, Chainlink, Uniswap)
   */
  dependencies: string[];

  /**
   * Data flow description (high-level)
   */
  dataFlow: string;

  /**
   * Mermaid.js diagram of contract interactions
   */
  interactionDiagram: string;

  /**
   * Mermaid.js diagram of inheritance structure
   */
  inheritanceDiagram: string;

  /**
   * Design patterns used (e.g., Factory, Access Control, Proxy)
   */
  designPatterns: string[];

  /**
   * Gas optimization analysis
   */
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
  efficiency: number; // 1-10 scale
  optimizations: string[];
  concerns: string[];
}

// -----------------------------
// 🔒 Security Analysis
// -----------------------------
export interface SecurityAnalysis {
  rating: SecurityRating;
  businessLogic: string;
  strengths: string[];
  vulnerabilities: VulnerabilityDetail[];
  recommendations: string[];
  auditStatus: string;
  documentationCodeMismatches?: string[];
}

export interface VulnerabilityDetail {
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  exploitability: 'High' | 'Medium' | 'Low';
  category: string;
  mitigation: string;
  codeReference?: string;
  docMismatch?: boolean;
  citation?: string;
}

export type SecurityRating = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

// -----------------------------
// 📁 GitHub Repository
// -----------------------------
export interface GitHubFile {
  name: string;
  path: string;
  content: string;
  type: 'solidity' | 'javascript' | 'typescript' | 'markdown' | 'json' | 'other';
}

export interface ProcessedRepository {
  name: string;
  description: string;
  files: GitHubFile[];
  structure: any;
  dependencies: string[];
  contractAnalysis: ContractAnalysis[];
}

// -----------------------------
// 📄 Smart Contract Analysis
// -----------------------------
export interface ContractAnalysis {
  fileName: string;
  contractName: string;
  functions: FunctionInfo[];
  events: EventInfo[];
  modifiers: ModifierInfo[];
  imports: string[];
  inheritance: string[];
  complexity: number;
}

export interface FunctionInfo {
  name: string;
  visibility: 'public' | 'private' | 'external' | 'internal';
  stateMutability: 'view' | 'pure' | 'payable' | 'nonpayable';
  parameters: string[];
  returns: string[];
  modifiers: string[];
}

export interface ModifierInfo {
  name: string;
  parameters: string[];
}

export interface EventInfo {
  name: string;
  parameters: string[];
}

// -----------------------------
// 📚 Documentation Parsing
// -----------------------------
export interface DocumentContent {
  title: string;
  content: string;
  sections: DocumentSection[];
  links: string[];
  images: string[];
}

export interface DocumentSection {
  title: string;
  content: string;
  level: number; // 1-6 (h1-h6)
}