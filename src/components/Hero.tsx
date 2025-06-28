import React from 'react';
import { Brain, Cpu, Lock } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-6 pt-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/5 dark:bg-white/3 rounded-full blur-3xl"></div>
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 relative z-10">
            Decode Web3
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 dark:from-gray-100 dark:to-gray-500">
              Protocol
            </span>
          </h2>
        </div>
        
        <p className="text-xl text-white/70 dark:text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto transition-colors duration-300">
          Advanced AI-powered analysis platform for security researchers to understand, 
          visualize, and audit complex Web3 protocols with clarity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group p-6 rounded-xl bg-white/5 dark:bg-white/3 backdrop-blur-sm border border-white/10 dark:border-gray-800/50 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300">
            <Brain className="w-12 h-12 text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
            <p className="text-white/60 dark:text-gray-400 text-sm transition-colors duration-300">Deep learning models analyze protocol complexity</p>
          </div>
          
          <div className="group p-6 rounded-xl bg-white/5 dark:bg-white/3 backdrop-blur-sm border border-white/10 dark:border-gray-800/50 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300">
            <Cpu className="w-12 h-12 text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Visualization</h3>
            <p className="text-white/60 dark:text-gray-400 text-sm transition-colors duration-300">Interactive diagrams reveal contract architecture</p>
          </div>
          
          <div className="group p-6 rounded-xl bg-white/5 dark:bg-white/3 backdrop-blur-sm border border-white/10 dark:border-gray-800/50 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300">
            <Lock className="w-12 h-12 text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg font-semibold text-white mb-2">Security Focus</h3>
            <p className="text-white/60 dark:text-gray-400 text-sm transition-colors duration-300">Built specifically for security researchers</p>
          </div>
        </div>
        
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 dark:border-gray-400/30 rounded-full mx-auto transition-colors duration-300">
            <div className="w-1 h-3 bg-white/60 dark:bg-gray-400/60 rounded-full mx-auto mt-2 animate-pulse transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;