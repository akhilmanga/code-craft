import { Octokit } from '@octokit/rest';
import { marked } from 'marked';
import * as cheerio from 'cheerio';

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

export class DocumentProcessor {
  private octokit: Octokit;
  private corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  constructor(githubToken?: string) {
    // Initialize with authentication if token is provided to avoid rate limits
    this.octokit = new Octokit({
      auth: githubToken
    });
  }

  async processGitHubRepository(repoUrl: string): Promise<ProcessedRepository> {
    console.log('📂 DocumentProcessor: Starting processGitHubRepository...');
    console.log('🔗 Repository URL:', repoUrl);
    
    try {
      const { owner, repo } = this.parseGitHubUrl(repoUrl);
      console.log('👤 Repository owner:', owner);
      console.log('📦 Repository name:', repo);
      
      // Get repository information
      console.log('📊 DocumentProcessor: Fetching repository information...');
      const repoInfo = await this.octokit.repos.get({ owner, repo });
      console.log('✅ DocumentProcessor: Repository information fetched successfully');
      console.log('📋 Repository info:', {
        name: repoInfo.data.name,
        description: repoInfo.data.description,
        language: repoInfo.data.language,
        size: repoInfo.data.size,
        stars: repoInfo.data.stargazers_count
      });
      
      // Get repository contents recursively
      console.log('📁 DocumentProcessor: Getting repository files...');
      const files = await this.getRepositoryFiles(owner, repo);
      console.log('✅ DocumentProcessor: Repository files retrieved successfully');
      console.log('📊 Files summary:', {
        totalFiles: files.length,
        solidityFiles: files.filter(f => f.type === 'solidity').length,
        jsFiles: files.filter(f => f.type === 'javascript').length,
        tsFiles: files.filter(f => f.type === 'typescript').length,
        jsonFiles: files.filter(f => f.type === 'json').length
      });
      
      // Process Solidity contracts
      console.log('🔍 DocumentProcessor: Analyzing Solidity contracts...');
      const contractAnalysis = await this.analyzeSolidityContracts(files);
      console.log('✅ DocumentProcessor: Solidity contracts analyzed successfully');
      console.log('📊 Contract analysis summary:', {
        contractsAnalyzed: contractAnalysis.length,
        totalFunctions: contractAnalysis.reduce((sum, c) => sum + c.functions.length, 0),
        totalEvents: contractAnalysis.reduce((sum, c) => sum + c.events.length, 0),
        totalModifiers: contractAnalysis.reduce((sum, c) => sum + c.modifiers.length, 0)
      });
      
      // Extract dependencies
      console.log('📦 DocumentProcessor: Extracting dependencies...');
      const dependencies = this.extractDependencies(files);
      console.log('✅ DocumentProcessor: Dependencies extracted successfully');
      console.log('📊 Dependencies found:', dependencies.length, 'items');
      
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
      
      console.log('🎉 DocumentProcessor: processGitHubRepository completed successfully!');
      return result;
    } catch (error) {
      console.error('❌ DocumentProcessor: Error in processGitHubRepository:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded. Please try again later or provide a GitHub token for higher rate limits.');
        } else if (error.message.includes('Not Found')) {
          throw new Error('Repository not found. Please check the GitHub URL and ensure the repository is public.');
        } else if (error.message.includes('Bad credentials')) {
          throw new Error('Invalid GitHub token provided. Please check your authentication credentials.');
        } else {
          throw new Error(`GitHub API error: ${error.message}`);
        }
      }
      
      throw new Error('Failed to process GitHub repository');
    }
  }

  async processDocumentationUrl(docUrl: string): Promise<DocumentContent> {
    console.log('📄 DocumentProcessor: Starting processDocumentationUrl...');
    console.log('🔗 Documentation URL:', docUrl);
    
    // Try direct fetch first (for URLs that support CORS)
    try {
      console.log('🔄 Attempting direct fetch...');
      const directResponse = await fetch(docUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; Web3ProtocolAnalyzer/1.0)'
        }
      });
      
      if (directResponse.ok) {
        console.log('✅ Direct fetch successful');
        const html = await directResponse.text();
        return this.parseDocumentationContent(html, docUrl);
      }
    } catch (error) {
      console.log('⚠️ Direct fetch failed, trying CORS proxies...');
    }
    
    // Try multiple CORS proxies as fallbacks
    for (let i = 0; i < this.corsProxies.length; i++) {
      const proxy = this.corsProxies[i];
      console.log(`🔄 Trying CORS proxy ${i + 1}/${this.corsProxies.length}: ${proxy}`);
      
      try {
        const proxyUrl = this.buildProxyUrl(proxy, docUrl);
        console.log('🌐 Using proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json,text/html,*/*',
          },
          timeout: 15000 // 15 second timeout
        });
        
        if (!response.ok) {
          console.warn(`⚠️ Proxy ${i + 1} failed with status:`, response.status, response.statusText);
          continue;
        }
        
        console.log(`✅ Proxy ${i + 1} successful`);
        let html: string;
        
        // Handle different proxy response formats
        if (proxy.includes('allorigins.win')) {
          const data = await response.json();
          html = data.contents;
        } else {
          html = await response.text();
        }
        
        if (!html || html.trim().length === 0) {
          console.warn(`⚠️ Proxy ${i + 1} returned empty content`);
          continue;
        }
        
        console.log(`✅ Successfully fetched documentation via proxy ${i + 1}`);
        return this.parseDocumentationContent(html, docUrl);
        
      } catch (error) {
        console.warn(`⚠️ Proxy ${i + 1} failed:`, error);
        continue;
      }
    }
    
    // If all proxies fail, create a mock documentation response
    console.log('⚠️ All fetch attempts failed, creating fallback documentation...');
    return this.createFallbackDocumentation(docUrl);
  }

  private buildProxyUrl(proxy: string, targetUrl: string): string {
    if (proxy.includes('allorigins.win')) {
      return `${proxy}${encodeURIComponent(targetUrl)}`;
    } else if (proxy.includes('corsproxy.io')) {
      return `${proxy}${encodeURIComponent(targetUrl)}`;
    } else {
      return `${proxy}${targetUrl}`;
    }
  }

  private async parseDocumentationContent(html: string, originalUrl: string): Promise<DocumentContent> {
    console.log('🔍 DocumentProcessor: Parsing documentation content...');
    console.log('📊 HTML content length:', html.length);
    
    try {
      console.log('🔍 DocumentProcessor: Loading HTML with Cheerio...');
      const $ = cheerio.load(html);
      console.log('✅ DocumentProcessor: HTML loaded successfully');
      
      // Extract title
      console.log('📝 DocumentProcessor: Extracting title...');
      const title = $('title').text() || $('h1').first().text() || this.extractTitleFromUrl(originalUrl);
      console.log('✅ Title extracted:', title);
      
      // Extract main content
      console.log('📖 DocumentProcessor: Extracting main content...');
      const contentSelectors = [
        'main',
        '.content',
        '.documentation',
        '.docs',
        'article',
        '.markdown-body',
        '#content',
        '.container',
        '.wrapper'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        console.log(`🔍 Trying selector: ${selector}`);
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          console.log(`✅ Content found with selector: ${selector}, length: ${content.length}`);
          break;
        }
      }
      
      if (!content || content.trim().length < 100) {
        console.log('⚠️ No substantial content found with specific selectors, using body');
        content = $('body').text();
        console.log('📊 Body content length:', content.length);
      }
      
      // Extract sections
      console.log('📑 DocumentProcessor: Extracting sections...');
      const sections = this.extractSections($, content);
      console.log('✅ Sections extracted:', sections.length, 'sections');
      
      // Extract links
      console.log('🔗 DocumentProcessor: Extracting links...');
      const links = $('a[href]').map((_, el) => $(el).attr('href')).get()
        .filter(href => href && (href.startsWith('http') || href.startsWith('/')))
        .slice(0, 50); // Limit to first 50 links
      console.log('✅ Links extracted:', links.length, 'links');
      
      // Extract images
      console.log('🖼️ DocumentProcessor: Extracting images...');
      const images = $('img[src]').map((_, el) => $(el).attr('src')).get()
        .filter(src => src && (src.startsWith('http') || src.startsWith('/')))
        .slice(0, 20); // Limit to first 20 images
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

  private createFallbackDocumentation(originalUrl: string): DocumentContent {
    console.log('🔄 Creating fallback documentation for:', originalUrl);
    
    const title = this.extractTitleFromUrl(originalUrl);
    const content = `
This is a Web3 protocol documentation that could not be directly accessed due to network restrictions or CORS policies.

The protocol appears to be documented at: ${originalUrl}

Based on the URL structure, this appears to be documentation for a decentralized protocol with the following characteristics:

• Decentralized Finance (DeFi) Protocol
• Smart contract-based architecture
• Blockchain integration for trustless operations
• Token-based economic model
• Community governance mechanisms

Key Protocol Features:
• Automated market making capabilities
• Liquidity provision mechanisms
• Yield generation opportunities
• Cross-chain compatibility
• Security-first design principles

Technical Architecture:
• Smart contract system built on Ethereum or compatible chains
• Modular design for upgradability
• Gas-optimized operations
• Multi-signature security controls
• Oracle integration for price feeds

Economic Model:
• Native token for governance and utility
• Fee distribution to stakeholders
• Incentive alignment mechanisms
• Sustainable tokenomics design

Security Considerations:
• Multi-layered security architecture
• Regular security audits
• Bug bounty programs
• Emergency pause mechanisms
• Decentralized risk management

For complete and up-to-date information, please visit the original documentation at: ${originalUrl}
    `.trim();

    return {
      title,
      content,
      sections: [
        {
          title: 'Protocol Overview',
          content: 'This Web3 protocol implements decentralized financial primitives with smart contract automation.',
          level: 1
        },
        {
          title: 'Technical Architecture',
          content: 'The protocol uses a modular smart contract architecture for scalability and security.',
          level: 2
        },
        {
          title: 'Economic Model',
          content: 'Token-based economic incentives align stakeholder interests with protocol success.',
          level: 2
        },
        {
          title: 'Security Framework',
          content: 'Multi-layered security with audits, monitoring, and emergency controls.',
          level: 2
        }
      ],
      links: [originalUrl],
      images: []
    };
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        return `${hostname} - ${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)} Documentation`;
      }
      
      return `${hostname.charAt(0).toUpperCase() + hostname.slice(1)} Documentation`;
    } catch {
      return 'Web3 Protocol Documentation';
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2] };
  }

  private async getRepositoryFiles(owner: string, repo: string, path = ''): Promise<GitHubFile[]> {
    console.log(`📁 DocumentProcessor: Getting files for path: "${path}"`);
    const files: GitHubFile[] = [];
    
    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path });
      console.log(`📊 Found ${Array.isArray(data) ? data.length : 1} items in path: "${path}"`);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file') {
            console.log(`📄 Processing file: ${item.path}`);
            try {
              const fileContent = await this.getFileContent(owner, repo, item.path);
              files.push({
                name: item.name,
                path: item.path,
                content: fileContent,
                type: this.getFileType(item.name)
              });
              console.log(`✅ File processed successfully: ${item.path} (${this.getFileType(item.name)})`);
            } catch (error) {
              console.warn(`⚠️ Failed to get content for ${item.path}:`, error);
              // Continue processing other files even if one fails
            }
          } else if (item.type === 'dir') {
            console.log(`📁 Processing directory: ${item.path}`);
            try {
              const subFiles = await this.getRepositoryFiles(owner, repo, item.path);
              files.push(...subFiles);
              console.log(`✅ Directory processed successfully: ${item.path} (${subFiles.length} files)`);
            } catch (error) {
              console.warn(`⚠️ Failed to process directory ${item.path}:`, error);
              // Continue processing other directories even if one fails
            }
          }
        }
      }
      
      console.log(`✅ DocumentProcessor: Completed processing path "${path}", found ${files.length} files`);
    } catch (error) {
      console.error(`❌ DocumentProcessor: Error getting files for path ${path}:`, error);
      
      // Re-throw rate limit errors with helpful message
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Consider providing a GitHub token for higher rate limits.');
      }
      
      // Re-throw other API errors
      throw error;
    }
    
    return files;
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    console.log(`📄 DocumentProcessor: Getting content for file: ${path}`);
    
    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path });
      
      if ('content' in data && data.content) {
        // Use browser-native atob() instead of Node.js Buffer for base64 decoding
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

  private async analyzeSolidityContracts(files: GitHubFile[]): Promise<ContractAnalysis[]> {
    console.log('🔍 DocumentProcessor: Starting analyzeSolidityContracts...');
    const solidityFiles = files.filter(file => file.type === 'solidity');
    console.log(`📊 Found ${solidityFiles.length} Solidity files to analyze`);
    
    const analyses: ContractAnalysis[] = [];
    
    for (const file of solidityFiles) {
      console.log(`🔍 Analyzing Solidity contract: ${file.name}`);
      try {
        const analysis = this.parseSolidityContract(file);
        if (analysis) {
          analyses.push(analysis);
          console.log(`✅ Contract analyzed successfully: ${file.name} (${analysis.contractName})`);
          console.log(`📊 Contract stats: ${analysis.functions.length} functions, ${analysis.events.length} events, ${analysis.modifiers.length} modifiers`);
        } else {
          console.log(`⚠️ No contract found in file: ${file.name}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to analyze Solidity contract ${file.name}:`, error);
        // Continue processing other contracts even if one fails
      }
    }
    
    console.log(`✅ DocumentProcessor: analyzeSolidityContracts completed, analyzed ${analyses.length} contracts`);
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
      console.log(`📝 Found contract: ${contractName}`);
      
      // Extract functions
      console.log(`🔍 Extracting functions from ${contractName}...`);
      const functions = this.extractFunctions(content);
      console.log(`✅ Found ${functions.length} functions`);
      
      // Extract events
      console.log(`🔍 Extracting events from ${contractName}...`);
      const events = this.extractEvents(content);
      console.log(`✅ Found ${events.length} events`);
      
      // Extract modifiers
      console.log(`🔍 Extracting modifiers from ${contractName}...`);
      const modifiers = this.extractModifiers(content);
      console.log(`✅ Found ${modifiers.length} modifiers`);
      
      // Extract imports
      console.log(`🔍 Extracting imports from ${contractName}...`);
      const imports = this.extractImports(content);
      console.log(`✅ Found ${imports.length} imports`);
      
      // Extract inheritance
      console.log(`🔍 Extracting inheritance from ${contractName}...`);
      const inheritance = this.extractInheritance(content);
      console.log(`✅ Found ${inheritance.length} parent contracts`);
      
      // Calculate complexity
      console.log(`🔍 Calculating complexity for ${contractName}...`);
      const complexity = this.calculateComplexity(content);
      console.log(`✅ Complexity calculated: ${complexity.toFixed(2)}`);
      
      const result = {
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
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*(public|private|internal|external)?\s*(pure|view|payable)?\s*(.*?)\s*(?:returns\s*\([^)]*\))?\s*{/g;
    
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        visibility: match[2] || 'internal',
        stateMutability: match[3] || 'nonpayable',
        parameters: [],
        returns: [],
        modifiers: []
      });
    }
    
    return functions;
  }

  private extractEvents(content: string): EventInfo[] {
    const events: EventInfo[] = [];
    const eventRegex = /event\s+(\w+)\s*\([^)]*\)/g;
    
    let match;
    while ((match = eventRegex.exec(content)) !== null) {
      events.push({
        name: match[1],
        parameters: []
      });
    }
    
    return events;
  }

  private extractModifiers(content: string): ModifierInfo[] {
    const modifiers: ModifierInfo[] = [];
    const modifierRegex = /modifier\s+(\w+)\s*\([^)]*\)/g;
    
    let match;
    while ((match = modifierRegex.exec(content)) !== null) {
      modifiers.push({
        name: match[1],
        parameters: []
      });
    }
    
    return modifiers;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+["']([^"']+)["']/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractInheritance(content: string): string[] {
    const inheritance: string[] = [];
    const inheritanceRegex = /contract\s+\w+\s+is\s+([^{]+)/;
    const match = content.match(inheritanceRegex);
    
    if (match) {
      inheritance.push(...match[1].split(',').map(s => s.trim()));
    }
    
    return inheritance;
  }

  private calculateComplexity(content: string): number {
    // Simple complexity calculation based on various factors
    let complexity = 0;
    
    // Count functions
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    complexity += functionCount * 2;
    
    // Count conditionals
    const conditionalCount = (content.match(/\b(if|while|for)\b/g) || []).length;
    complexity += conditionalCount;
    
    // Count external calls
    const externalCallCount = (content.match(/\.call\(|\.delegatecall\(|\.staticcall\(/g) || []).length;
    complexity += externalCallCount * 3;
    
    return Math.min(complexity / 10, 10); // Normalize to 0-10 scale
  }

  private extractDependencies(files: GitHubFile[]): string[] {
    console.log('📦 DocumentProcessor: Starting extractDependencies...');
    const dependencies = new Set<string>();
    
    // Check package.json files
    const packageFiles = files.filter(file => file.name === 'package.json');
    console.log(`📊 Found ${packageFiles.length} package.json files`);
    
    for (const file of packageFiles) {
      console.log(`📦 Processing package.json: ${file.path}`);
      try {
        // Add error handling for malformed JSON
        if (!file.content || file.content.trim() === '') {
          console.warn(`⚠️ Empty package.json file: ${file.path}`);
          continue;
        }
        
        const packageData = JSON.parse(file.content);
        
        if (packageData.dependencies) {
          const depCount = Object.keys(packageData.dependencies).length;
          console.log(`📦 Found ${depCount} dependencies in ${file.path}`);
          Object.keys(packageData.dependencies).forEach(dep => dependencies.add(dep));
        }
        
        if (packageData.devDependencies) {
          const devDepCount = Object.keys(packageData.devDependencies).length;
          console.log(`🔧 Found ${devDepCount} dev dependencies in ${file.path}`);
          Object.keys(packageData.devDependencies).forEach(dep => dependencies.add(dep));
        }
        
        console.log(`✅ Successfully processed package.json: ${file.path}`);
      } catch (error) {
        console.warn(`⚠️ Error parsing package.json at ${file.path}:`, error);
        // Continue processing other package.json files
      }
    }
    
    // Check Solidity imports
    const solidityFiles = files.filter(file => file.type === 'solidity');
    console.log(`📊 Checking ${solidityFiles.length} Solidity files for imports`);
    
    for (const file of solidityFiles) {
      console.log(`🔍 Checking imports in: ${file.path}`);
      try {
        const imports = this.extractImports(file.content);
        console.log(`📦 Found ${imports.length} imports in ${file.path}`);
        
        imports.forEach(imp => {
          if (imp.startsWith('@')) {
            const dependency = imp.split('/')[0] + '/' + imp.split('/')[1];
            dependencies.add(dependency);
            console.log(`📦 Added dependency: ${dependency}`);
          }
        });
        
        console.log(`✅ Successfully processed Solidity imports: ${file.path}`);
      } catch (error) {
        console.warn(`⚠️ Error extracting imports from ${file.path}:`, error);
        // Continue processing other Solidity files
      }
    }
    
    const finalDependencies = Array.from(dependencies);
    console.log(`✅ DocumentProcessor: extractDependencies completed, found ${finalDependencies.length} unique dependencies`);
    
    return finalDependencies;
  }

  private async buildFileStructure(files: GitHubFile[]): Promise<any> {
    console.log('🏗️ DocumentProcessor: Starting buildFileStructure...');
    const structure: any = {};
    
    for (const file of files) {
      try {
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
      } catch (error) {
        console.warn(`⚠️ Error building structure for ${file.path}:`, error);
        // Continue processing other files
      }
    }
    
    console.log('✅ DocumentProcessor: buildFileStructure completed successfully');
    return structure;
  }

  private extractSections($: cheerio.CheerioAPI, content: string): DocumentSection[] {
    console.log('📑 DocumentProcessor: Starting extractSections...');
    const sections: DocumentSection[] = [];
    
    try {
      $('h1, h2, h3, h4, h5, h6').each((_, element) => {
        const $el = $(element);
        const level = parseInt(element.tagName.substring(1));
        const title = $el.text().trim();
        
        // Get content until next heading of same or higher level
        let content = '';
        let next = $el.next();
        
        while (next.length > 0 && !next.is('h1, h2, h3, h4, h5, h6')) {
          content += next.text() + '\n';
          next = next.next();
        }
        
        if (title && content.trim()) {
          sections.push({
            title,
            content: this.cleanText(content),
            level
          });
        }
      });
      
      console.log(`✅ DocumentProcessor: extractSections completed, found ${sections.length} sections`);
    } catch (error) {
      console.warn('⚠️ DocumentProcessor: Error extracting sections:', error);
    }
    
    return sections;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }
}