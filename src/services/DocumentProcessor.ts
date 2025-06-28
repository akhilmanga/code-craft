import { Octokit } from '@octokit/rest';
import { marked } from 'marked';
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
    ' https://corsproxy.io/?',
    ' https://cors-anywhere.herokuapp.com/ ',
    'https://thingproxy.freeboard.io/fetch/ '
  ];

  constructor(githubToken?: string, llmAdapter?: LLMAdapter) {
    console.log('📂 DocumentProcessor: Initializing document processor...');
    
    // Initialize Octokit with optional GitHub token
    this.octokit = new Octokit({
      auth: githubToken ? `token ${githubToken}` : undefined
    });
    
    // LLM Integration Setup
    this.llmEnabled = false;
    if (llmAdapter && import.meta.env.VITE_LLM_ENABLED === 'true') {
      try {
        console.log('🤖 DocumentProcessor: Initializing LLM adapter...');
        this.llmAdapter = llmAdapter;
        this.llmEnabled = true;
        console.log('✅ DocumentProcessor: LLM adapter initialized successfully');
      } catch (error) {
        console.warn('⚠️ DocumentProcessor: Failed to initialize LLMAdapter:', error);
        this.llmEnabled = false;
      }
    } else {
      this.llmEnabled = false;
      if (!llmAdapter) {
        console.log('💡 DocumentProcessor: No LLM adapter provided, using base analysis only');
      }
      if (import.meta.env.VITE_LLM_ENABLED !== 'true') {
        console.log('💡 DocumentProcessor: LLM features disabled via environment variable');
      }
    }

    console.log(`🎯 DocumentProcessor: Initialized with LLM ${this.llmEnabled ? 'enabled' : 'disabled'}`);
  }

  async processGitHubRepository(githubUrl: string): Promise<ProcessedRepository> {
    console.log(`📁 DocumentProcessor: Processing GitHub repository: ${githubUrl}`);
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\/|$)/);
    
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }
    
    const owner = match[1];
    const repo = match[2];
    
    console.log(`🔍 DocumentProcessor: Fetching repository info for ${owner}/${repo}...`);
    const repoInfo = await this.octokit.repos.get({ owner, repo });
    
    console.log('📁 DocumentProcessor: Getting repository files...');
    const files = await this.getRepositoryFiles(owner, repo, repoInfo.data.default_branch);
    console.log(`✅ DocumentProcessor: Retrieved ${files.length} files successfully`);
    console.log('📊 File summary:', {
      solidityFiles: files.filter(f => f.type === 'solidity').length,
      jsFiles: files.filter(f => f.type === 'javascript').length,
      tsFiles: files.filter(f => f.type === 'typescript').length,
      jsonFiles: files.filter(f => f.type === 'json').length
    });

    console.log('🔍 DocumentProcessor: Analyzing Solidity contracts...');
    const contractAnalysis = await this.analyzeSolidityContracts(files);
    console.log(`✅ DocumentProcessor: Analyzed ${contractAnalysis.length} Solidity contracts`);

    console.log('📦 DocumentProcessor: Extracting dependencies...');
    const dependencies = this.extractDependencies(files);
    console.log(`✅ DocumentProcessor: Found ${dependencies.length} dependencies`);

    console.log('🏗️ DocumentProcessor: Building file structure...');
    const structure = await this.buildFileStructure(files);
    console.log('✅ DocumentProcessor: File structure built successfully');

    const result = {
      name: repoInfo.data.name,
      description: repoInfo.data.description || '',
      files,
      structure,
      dependencies,
      contractAnalysis
    };

    console.log('🎉 DocumentProcessor: Repository processing completed successfully!');
    return result;
  }

  private async getRepositoryFiles(owner: string, repo: string, defaultBranch: string): Promise<GitHubFile[]> {
    console.log(`📁 DocumentProcessor: Getting files for ${owner}/${repo}...`);
    const files: GitHubFile[] = [];
    const seenPaths = new Set<string>();
    
    try {
      const { data: tree } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: true
      });

      const items = Array.isArray(tree.tree) ? tree.tree : [];

      for (const item of items) {
        if (item.type === 'blob') {
          const path = item.path || '';
          
          // Skip files that don't match common patterns
          if (!this.isRelevantFile(path)) continue;
          
          // Skip duplicate files
          if (seenPaths.has(path)) continue;
          seenPaths.add(path);
          
          const content = await this.getFileContent(owner, repo, path);
          
          files.push({
            name: path.split('/').pop() || 'unknown',
            path,
            content,
            type: this.getFileType(path)
          });
        }
      }
    } catch (error) {
      console.error('❌ DocumentProcessor: Error getting repository files:', error);
      // Re-throw rate limit errors
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw error;
      }
    }

    return files;
  }

  private isRelevantFile(path: string): boolean {
    // Filter out irrelevant files
    const ignoredDirs = ['test', 'tests', 'script', 'scripts', 'node_modules'];
    const ignoredExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.lock'];
    
    // Skip if matches ignored directories
    if (ignoredDirs.some(dir => path.includes(dir))) return false;
    
    // Skip if matches ignored extensions
    if (ignoredExts.some(ext => path.endsWith(ext))) return false;
    
    // Include files that look like Solidity or documentation
    if (path.endsWith('.sol') || path.endsWith('.md') || path.includes('readme') || path.includes('doc')) {
      return true;
    }
    
    // Include files in relevant directories
    if (path.split('/').some(part => part === 'contracts' || part === 'src')) {
      return true;
    }
    
    return false;
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    console.log(`📄 DocumentProcessor: Getting content for file: ${path}`);
    
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });
      
      if ('content' in data && data.content) {
        // Use browser-native atob() for base64 decoding
        try {
          const content = atob(data.content.replace(/\s/g, ''));
          console.log(`✅ DocumentProcessor: Content retrieved for ${path}, length: ${content.length}`);
          return content;
        } catch (decodeError) {
          console.warn(`⚠️ Failed to decode base64 content for ${path}:`, decodeError);
          return '';
        }
      }
      
      console.log(`⚠️ No content found for file: ${path}`);
    } catch (error) {
      console.error(`❌ DocumentProcessor: Error getting content for ${path}:`, error);
      // Re-throw rate limit errors
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw error;
      }
    }
    
    return '';
  }

  private getFileType(fileName: string): GitHubFile['type'] {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'sol':
        return 'solidity';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'md':
        return 'markdown';
      case 'json':
        return 'json';
      default:
        return 'other';
    }
  }

  private extractDependencies(files: GitHubFile[]): string[] {
    console.log('📦 DocumentProcessor: Extracting dependencies...');
    const dependencies = new Set<string>();
    
    // Look for import statements
    files.forEach(file => {
      if (file.type === 'solidity') {
        const importMatches = file.content.match(/import.*from.*$/gm) || [];
        
        importMatches.forEach(match => {
          const dependency = match.replace(/^import.*from\s*['"](.*)['"];?$/gm, '$1');
          if (dependency && !dependency.startsWith('.')) { // Skip local imports
            dependencies.add(dependency);
          }
        });
      }
    });
    
    console.log(`✅ DocumentProcessor: Extracted ${dependencies.size} dependencies`);
    return Array.from(dependencies);
  }

  private async analyzeSolidityContracts(files: GitHubFile[]): Promise<ContractAnalysis[]> {
    console.log('🔍 DocumentProcessor: Analyzing Solidity contracts...');
    const analyses: ContractAnalysis[] = [];
    
    for (const file of files) {
      if (file.type === 'solidity') {
        const result = this.parseSolidityContract(file);
        if (result) {
          analyses.push(result);
        }
      }
    }
    
    console.log('✅ DocumentProcessor: Solidity contract analysis completed');
    console.log('📊 Contract analysis summary:', {
      contractsAnalyzed: analyses.length,
      totalFunctions: analyses.reduce((sum, c) => sum + c.functions.length, 0),
      totalEvents: analyses.reduce((sum, c) => sum + c.events.length, 0),
      totalModifiers: analyses.reduce((sum, c) => sum + c.modifiers.length, 0)
    });
    
    return analyses;
  }

  private parseSolidityContract(file: GitHubFile): ContractAnalysis | null {
    console.log(`🔍 DocumentProcessor: Parsing Solidity contract: ${file.name}`);
    
    try {
      const content = file.content;
      
      // Extract contract name
      const contractMatch = content.match(/contract\s+(\w+)/);
      if (!contractMatch) {
        console.log(`⚠️ No contract declaration found in ${file.name}`);
        return null;
      }
      const contractName = contractMatch[1];
      
      // Extract functions
      const functions = this.extractFunctions(content);
      
      // Extract events
      const events = this.extractEvents(content);
      
      // Extract modifiers
      const modifiers = this.extractModifiers(content);
      
      // Extract imports
      const imports = this.extractImports(content);
      
      // Extract inheritance
      const inheritance = this.extractInheritance(content);
      
      // Calculate complexity
      const complexity = this.calculateContractComplexity(content);
      
      const result: ContractAnalysis = {
        fileName: file.name,
        contractName,
        functions,
        events,
        modifiers,
        imports,
        inheritance,
        complexity
      };
      
      console.log(`✅ DocumentProcessor: Successfully parsed contract ${contractName}`);
      return result;
    } catch (error) {
      console.error(`❌ DocumentProcessor: Error parsing Solidity contract ${file.name}:`, error);
      return null;
    }
  }

  private extractFunctions(content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*(public|private|internal|external)?\s*(view|pure|payable)?/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        visibility: match[3] || 'external',
        stateMutability: match[4] || 'nonpayable',
        parameters: this.extractParameters(match[2]),
        returns: this.extractReturns(content, match.index),
        modifiers: this.extractFunctionModifiers(content, match.index)
      });
    }
    
    return functions;
  }

  private extractEvents(content: string): EventInfo[] {
    const events: EventInfo[] = [];
    const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    
    while ((match = eventRegex.exec(content)) !== null) {
      events.push({
        name: match[1],
        parameters: this.extractParameters(match[2])
      });
    }
    
    return events;
  }

  private extractModifiers(content: string): ModifierInfo[] {
    const modifiers: ModifierInfo[] = [];
    const modifierRegex = /modifier\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    
    while ((match = modifierRegex.exec(content)) !== null) {
      modifiers.push({
        name: match[1],
        parameters: this.extractParameters(match[2])
      });
    }
    
    return modifiers;
  }

  private extractImports(content: string): string[] {
    const importMatches = content.match(/import.*from.*$/gm) || [];
    return importMatches.map(match => 
      match.replace(/^import.*from\s*['"](.*)['"].*$/gm, '$1')
    );
  }

  private extractInheritance(content: string): string[] {
    const inheritance: string[] = [];
    const contractMatch = content.match(/contract\s+\w+\s+is\s+([\w,\s]+)/);
    
    if (contractMatch && contractMatch[1]) {
      inheritance.push(...contractMatch[1].split(',').map(c => c.trim()));
    }
    
    return inheritance;
  }

  private calculateContractComplexity(content: string): number {
    const functionCount = (content.match(/function\s+/g) || []).length;
    const modifierCount = (content.match(/modifier\s+/g) || []).length;
    const ifCount = (content.match(/if\s*\(/g) || []).length;
    const loopCount = (content.match(/(for|while|do)\s*\(/g) || []).length;
    
    // Complexity score based on contract size and logic depth
    const complexity = 3 + 
      (functionCount * 0.5) + 
      (modifierCount * 0.3) + 
      (ifCount * 0.2) + 
      (loopCount * 0.4);
    
    return Math.min(10, Math.round(complexity * 10) / 10);
  }

  private extractParameters(paramStr: string): string[] {
    if (!paramStr) return [];
    return paramStr.split(',').map(p => p.trim()).filter(p => p);
  }

  private extractReturns(content: string, functionStartIndex: number): string[] {
    const returnRegex = /returns\s*\(([^)]*)\)/;
    const functionContent = content.slice(functionStartIndex);
    const returnMatch = functionContent.match(returnRegex);
    
    if (returnMatch && returnMatch[1]) {
      return returnMatch[1].split(',').map(p => p.trim()).filter(p => p);
    }
    
    return [];
  }

  private extractFunctionModifiers(content: string, functionStartIndex: number): string[] {
    const modifierRegex = /(\w+)\s*\([^)]*\)*\s*{/;
    const functionContent = content.slice(functionStartIndex);
    const modifierMatches = functionContent.match(modifierRegex);
    
    if (modifierMatches && modifierMatches[1]) {
      return [modifierMatches[1]];
    }
    
    return [];
  }

  private async buildFileStructure(files: GitHubFile[]): Promise<any> {
    console.log('🏗️ DocumentProcessor: Building file structure...');
    const structure: any = {};
    
    for (const file of files) {
      const pathParts = file.path.split('/');
      let current = structure;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      const fileName = pathParts[pathParts.length - 1];
      current[fileName] = {
        type: file.type,
        size: file.content.length
      };
    }
    
    console.log('✅ DocumentProcessor: buildFileStructure completed successfully');
    return structure;
  }

  async processDocumentationUrl(docUrl: string): Promise<DocumentContent> {
    console.log(`📘 DocumentProcessor: Processing documentation URL: ${docUrl}`);
    
    let html = '';
    let attempts = 0;
    let lastError: Error | null = null;
    
    for (const proxy of this.corsProxies) {
      attempts++;
      console.log(`🌐 Trying proxy ${attempts}/${this.corsProxies.length}: ${proxy}`);
      
      try {
        const proxyUrl = this.buildProxyUrl(proxy, docUrl);
        const response = await fetch(proxyUrl, { timeout: 15000 });
        
        if (response.ok) {
          html = await response.text();
          console.log(`✅ DocumentProcessor: Content retrieved from ${proxyUrl}`);
          break;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Proxy ${proxy} failed:`, error);
      }
    }
    
    if (!html || html.trim().length < 100) {
      console.warn('⚠️ DocumentProcessor: No substantial content found, falling back to body');
      try {
        const response = await fetch(docUrl, { timeout: 15000 });
        html = await response.text();
      } catch (error) {
        console.error('❌ DocumentProcessor: Fallback content retrieval failed:', error);
        return this.createFallbackDocumentation(docUrl);
      }
    }
    
    console.log('📊 Document content length:', html.length);
    return this.parseDocumentationContent(html, docUrl);
  }

  private buildProxyUrl(proxy: string, targetUrl: string): string {
    if (proxy.includes('allorigins')) {
      return proxy + encodeURIComponent(targetUrl);
    } else if (proxy.includes('corsproxy.io')) {
      return proxy + encodeURIComponent(targetUrl);
    } else {
      return proxy + targetUrl;
    }
  }

  private createFallbackDocumentation(url: string): DocumentContent {
    console.log('📄 DocumentProcessor: Creating fallback documentation');
    return {
      title: this.extractTitleFromUrl(url),
      content: 'No content was extracted from the documentation URL.',
      sections: [],
      links: [],
      images: []
    };
  }

  private async parseDocumentationContent(html: string, originalUrl: string): Promise<DocumentContent> {
    console.log('🔍 DocumentProcessor: Parsing documentation content...');
    console.log('📊 HTML content length:', html.length);
    
    try {
      // Extract title from HTML without cheerio
      const title = this.extractTitleFromHtml(html) || this.extractTitleFromUrl(originalUrl);
      console.log('✅ Title extracted:', title);
      
      // Extract main content using simple text extraction
      console.log('📖 DocumentProcessor: Extracting main content...');
      const content = this.extractTextContent(html);
      console.log('📊 Content length:', content.length);
      
      // Extract sections using simple regex patterns
      console.log('📑 DocumentProcessor: Extracting sections...');
      const sections = this.extractSectionsFromText(content);
      console.log(`✅ Sections extracted: ${sections.length} sections`);
      
      // Extract links using regex
      console.log('🔗 DocumentProcessor: Extracting links...');
      const links = this.extractLinksFromHtml(html);
      console.log('✅ Links extracted:', links.length, 'links');
      
      // Extract images using regex
      console.log('🖼️ DocumentProcessor: Extracting images...');
      const images = this.extractImagesFromHtml(html);
      console.log('✅ Images extracted:', images.length, 'images');
      
      const result = {
        title,
        content: this.cleanText(content),
        sections,
        links,
        images
      };
      
      console.log('🎉 DocumentProcessor: parseDocumentationContent completed successfully!');
      console.log('📊 Final documentation summary:', {
        title: result.title,
        contentLength: result.content.length,
        sectionsCount: result.sections.length,
        linksCount: result.links.length,
        imagesCount: result.images.length
      });
      
      return result;
    } catch (error) {
      console.error('❌ DocumentProcessor: Error parsing documentation content:', error);
      throw new Error(`Failed to parse documentation content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTitleFromHtml(html: string): string | null {
    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Extract from first h1 tag
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    return null;
  }

  private extractTextContent(html: string): string {
    // Remove script and style tags
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    content = content.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");
    
    return content;
  }

  private extractSectionsFromText(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Simple pattern to find headings in text
    const lines = content.split('\n');
    let currentSection: DocumentSection | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Check if line looks like a heading (all caps, short, or ends with colon)
      const isHeading = trimmedLine.length < 100 && 
        (trimmedLine === trimmedLine.toUpperCase() || 
         trimmedLine.endsWith(':') ||
         /^[A-Z][a-z\s]+$/.test(trimmedLine));
      
      if (isHeading && trimmedLine.length > 3) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: trimmedLine.replace(/:$/, ''),
          content: '',
          level: 2 // Default level
        };
      } else if (currentSection && trimmedLine.length > 10) {
        // Add content to current section
        currentSection.content += (currentSection.content ? ' ' : '') + trimmedLine;
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections.slice(0, 20); // Limit to 20 sections
  }

  private extractLinksFromHtml(html: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href && (href.startsWith('http') || href.startsWith('/'))) {
        links.push(href);
      }
    }
    
    return [...new Set(links)].slice(0, 50); // Remove duplicates and limit to 50
  }

  private extractImagesFromHtml(html: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src && (src.startsWith('http') || src.startsWith('/'))) {
        images.push(src);
      }
    }
    
    return [...new Set(images)].slice(0, 20); // Remove duplicates and limit to 20
  }

  private extractTitleFromUrl(url: string): string {
    const path = url.replace(/^https?:\/\/[^\/]+/i, '');
    return path
      .replace(/^\//, '')
      .replace(/\//g, ' / ')
      .replace(/[-_]/g, ' ')
      .replace(/\.(md|html?)$/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}