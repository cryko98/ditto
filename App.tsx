import React, { useState } from 'react';
import { generateWebPage } from './services/geminiService';
import { DittoLogo } from './components/DittoLogo';
import { TabOption } from './types';
import { Code, Eye, Zap, AlertCircle, Copy, Check } from 'lucide-react';

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f3e8ff; 
            color: #6b21a8;
            font-family: sans-serif;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(107, 33, 168, 0.1);
        }
        h1 { margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hi! I'm Ditto.</h1>
        <p>Tell me what to build in the box above!</p>
    </div>
</body>
</html>`;

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.PREVIEW);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Switch to preview automatically when generating to show the result immediately
    setActiveTab(TabOption.PREVIEW);

    try {
      const generatedCode = await generateWebPage(prompt);
      setCode(generatedCode);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const handleCopyCa = () => {
    navigator.clipboard.writeText("6VKDRsckuBSk3rFnsvoHV9hrPKnzNHRSCfrS91Cupump");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-ditto-bg text-gray-100 overflow-hidden font-sans">
      
      {/* Global Header */}
      <header className="h-16 flex-none bg-ditto-bg border-b border-ditto-dark flex items-center justify-between px-4 md:px-6 relative z-30 shadow-md">
        <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black text-ditto-light tracking-tighter drop-shadow-sm animate-floating">$DITTO</span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={handleCopyCa}
              className="flex items-center gap-2 bg-ditto-surface/50 px-3 py-1.5 rounded-lg border border-ditto-dark/50 text-[10px] md:text-xs font-mono text-ditto-light/90 hover:bg-ditto-surface/80 transition-all cursor-pointer group active:scale-95" 
              title="Copy CA"
            >
                <span className="opacity-50 font-bold uppercase select-none">ca:</span>
                <span className="truncate max-w-[100px] md:max-w-none select-all">6VKDRsckuBSk3rFnsvoHV9hrPKnzNHRSCfrS91Cupump</span>
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                )}
            </button>
             
            <a 
              href="https://x.com/i/communities/1994612116247232835" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all hover:scale-110"
              title="Join our Community on X"
            >
                <XLogo className="w-4 h-4 md:w-5 md:h-5" />
            </a>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      
        {/* Sidebar / Input Area */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-ditto-surface border-r border-ditto-dark flex flex-col relative z-10 shadow-xl">
          <div className="p-6 flex flex-col items-center border-b border-ditto-dark bg-ditto-bg/50 backdrop-blur-sm">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-ditto-light opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
              <DittoLogo className="w-24 h-24 md:w-32 md:h-32 relative z-10 animate-blob" />
            </div>
            <h1 className="text-2xl font-bold mt-4 tracking-tight text-white">Ditto</h1>
            <p className="text-ditto-light text-sm text-center mt-1 opacity-80">
              Transform ideas into code using Ditto Agent
            </p>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <label htmlFor="prompt" className="text-sm font-semibold text-ditto-light uppercase tracking-wider">
                Describe your app
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., A landing page for a coffee shop with a hero image, a menu section, and a contact form with a dark theme."
                className="w-full h-48 bg-ditto-bg border border-ditto-dark rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ditto-light/50 focus:border-transparent transition-all placeholder-gray-500 resize-none shadow-inner"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`
                group relative w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 overflow-hidden transition-all transform
                ${isLoading || !prompt.trim() 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-ditto-DEFAULT to-fuchsia-600 text-white hover:scale-[1.02] active:scale-[0.98] animate-jelly hover:shadow-ditto-DEFAULT/50'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:fill-current" />
                  <span>Transform!</span>
                </>
              )}
            </button>
            
            <div className="text-xs text-center text-gray-500 mt-2">
              Tip: Press <kbd className="bg-ditto-bg px-1 rounded border border-ditto-dark">Ctrl + Enter</kbd> to generate
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-ditto-dark text-center">
              <p className="text-xs text-gray-500">Powered by Ditto Agent</p>
          </div>
        </aside>

        {/* Main Content / Output Area */}
        <main className="flex-1 flex flex-col h-full relative bg-gray-900">
          
          {/* Toolbar */}
          <div className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
            <div className="flex bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab(TabOption.PREVIEW)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === TabOption.PREVIEW 
                    ? 'bg-ditto-bg text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab(TabOption.CODE)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === TabOption.CODE 
                    ? 'bg-ditto-bg text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </div>
            
            {activeTab === TabOption.PREVIEW && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Preview
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 relative w-full h-full overflow-hidden">
            
            {/* Preview Tab */}
            <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${activeTab === TabOption.PREVIEW ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <iframe
                  title="Preview"
                  srcDoc={code}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts" 
                />
            </div>

            {/* Code Tab */}
            <div className={`absolute inset-0 w-full h-full bg-[#1e1e1e] transition-opacity duration-300 overflow-auto ${activeTab === TabOption.CODE ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}