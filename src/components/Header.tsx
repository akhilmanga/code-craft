import React from 'react';
import { Code, Shield, Zap, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 dark:bg-gray-950/90 backdrop-blur-xl border-b border-white/10 dark:border-gray-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-white/60" />
              <Zap className="w-5 h-5 text-white/60 animate-pulse" />
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 transition-all duration-300 group"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Moon className="w-5 h-5 text-white group-hover:text-yellow-300 transition-colors duration-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Sun className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors duration-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;