import React from 'react';
import { Code, Shield, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
              <Code className="w-8 h-8 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h1 className="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors duration-300">
              Code Craft
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors duration-300 relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors duration-300 relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors duration-300 relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-white/60" />
            <Zap className="w-5 h-5 text-white/60 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;