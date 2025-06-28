import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black dark:bg-gray-950 text-white py-16 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Code Craft</h3>
            <p className="text-gray-400 dark:text-gray-500 leading-relaxed transition-colors duration-300">
              Advanced AI platform for Web3 protocol analysis and security research.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500 transition-colors duration-300">
              <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Protocol Analysis</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Smart Contract Visualization</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Security Assessment</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Architecture Diagrams</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/akhil_manga" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/akhilmanga/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:akhilmanga1234@proton.me" className="p-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center transition-colors duration-300">
          <p className="text-gray-400 dark:text-gray-500 text-sm transition-colors duration-300">
            © 2025 Code Craft. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;