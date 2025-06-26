// Centralized type definitions for all services
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
  visibility: string;
  stateMutability: string;
  parameters: string[];
  returns: string[];
  modifiers: string[];
}

export interface EventInfo {
  name: string;
  parameters: string[];
}

export interface ModifierInfo {
  name: string;
  parameters: string[];
}

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
  level: number;
}