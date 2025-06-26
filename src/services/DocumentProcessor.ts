import { Octokit } from '@octokit/rest';
import { marked } from 'marked';
import * as cheerio from 'cheerio';
import { LLMAdapter } from './LLMAdapter';
import type {
  GitHubFile,
  ProcessedRepository,
  ContractAnalysis,
  FunctionInfo,
  EventInfo,
  ModifierInfo,
  DocumentContent,
  DocumentSection
} from './types';

export class DocumentProcessor {
  private octokit: Octokit;
  private llmAdapter?: LLMAdapter;
  private llmEnabled: boolean;
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  constructor(githubToken?: string, llmAdapter?: LLMAdapter) {
    console.log('📂 DocumentProcessor: Initializing document processor...');
    
    // Initialize with authentication if token is provided to avoid rate limits
    this.octokit = new Octokit({
      auth: githubToken
    });

    // Initialize LLM capabilities if adapter is provided
    if (llmAdapter) {
      this.llmAdapter = llmAdapter;
      this.llmEnabled = true;
      console.log('🤖 DocumentProcessor: LLM-powered content extraction enabled');
    } else {
      this.llmEnabled = false;
      console.log('💡 DocumentProcessor: Using base content extraction (LLM disabled)');
    }
    
    console.log(`✅ DocumentProcessor: Initialized with LLM ${this.llmEnabled ? 'enabled' : 'disabled'}`);
  }

  // ... [rest of the class implementation remains exactly the same]
}