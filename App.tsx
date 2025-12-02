import React, { useState, useRef, useEffect } from 'react';
import { generateWebPage, generateDittoImage, generateBullishTweet } from './services/geminiService';
import { DittoLogo } from './components/DittoLogo';
import { TabOption, ChatMessage } from './types';
import { Code, Eye, Zap, AlertCircle, Copy, Check, Send, Image as ImageIcon, Sparkles, Download, Share2, ClipboardCopy, AlertTriangle } from 'lucide-react';

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
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
        <p>Tell me what to build in the chat on the left!</p>
    </div>
</body>
</html>`;

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

export default function App() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm Ditto. Describe the website or app you want me to build!", type: 'text' }
  ]);
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [tweetText, setTweetText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.PREVIEW);
  const [isCaCopied, setIsCaCopied] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, type: 'text' }]);
    setIsLoading(true);

    try {
      if (isImageMode) {
        // Image Generation Mode
        const imageUrl = await generateDittoImage(userMessage);
        setGeneratedImageUrl(imageUrl);
        setActiveTab(TabOption.IMAGE);
        
        // Generate tweet text concurrently
        const tweet = await generateBullishTweet(userMessage);
        setTweetText(tweet);

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I've generated a new image based on your request. Check the Image tab to download and share!", 
          type: 'text' 
        }]);
      } else {
        // Code Generation Mode
        setActiveTab(TabOption.PREVIEW);
        const generatedCode = await generateWebPage(userMessage, code);
        setCode(generatedCode);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I've updated the code based on your request! Let me know if you want any changes.", 
          type: 'text' 
        }]);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error occurred.";
      console.error(err);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isImageMode 
          ? `Image generation failed: ${errorMessage}` 
          : `Code generation failed: ${errorMessage}`, 
        type: 'text' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCa = () => {
    navigator.clipboard.writeText("6VKDRsckuBSk3rFnsvoHV9hrPKnzNHRSCfrS91Cupump");
    setIsCaCopied(true);
    setTimeout(() => setIsCaCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!generatedImageUrl) return;
    try {
      // Fetch the image as a blob
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      setIsImageCopied(true);
      setTimeout(() => setIsImageCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy image:", error);
      alert("Failed to copy image to clipboard. Please use Download instead.");
    }
  };

  const handleShareTweet = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-ditto-bg text-gray-100 overflow-hidden font-sans">
      
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
                {isCaCopied ? (
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
      
        {/* Sidebar / Chat Area */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-ditto-surface border-r border-ditto-dark flex flex-col relative z-20 shadow-xl h-[40vh] md:h-auto">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center gap-3 border-b border-ditto-dark bg-ditto-bg/50 backdrop-blur-sm shrink-0">
            <div className="relative group w-10 h-10">
              <div className="absolute inset-0 bg-ditto-light opacity-20 blur-md rounded-full"></div>
              <DittoLogo className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Ditto Agent</h1>
              <p className="text-xs text-ditto-light opacity-80">Frontend & Image Gen</p>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-ditto-dark scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] rounded-2xl p-2.5 shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-ditto-DEFAULT text-white rounded-tr-sm' 
                      : 'bg-ditto-bg border border-ditto-dark text-gray-200 rounded-tl-sm'
                    }
                  `}
                >
                  <p className="px-1.5 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-ditto-bg border border-ditto-dark px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-ditto-light rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-ditto-light rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-ditto-light rounded-full animate-bounce"></div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-ditto-surface border-t border-ditto-dark shrink-0">
            <div className="flex gap-2 mb-2">
              <button 
                 onClick={() => setIsImageMode(false)}
                 className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${!isImageMode ? 'bg-ditto-DEFAULT text-white shadow-md' : 'bg-ditto-bg/50 text-gray-400 hover:bg-ditto-bg hover:text-white'}`}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
              <button 
                 onClick={() => setIsImageMode(true)}
                 className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all ${isImageMode ? 'bg-pink-500 text-white shadow-md' : 'bg-ditto-bg/50 text-gray-400 hover:bg-ditto-bg hover:text-white'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Images
              </button>
            </div>

            <div className={`relative flex items-end gap-2 bg-ditto-bg p-2 rounded-xl border transition-all shadow-inner ${isImageMode ? 'border-pink-500/50 ring-1 ring-pink-500/20' : 'border-ditto-dark focus-within:border-ditto-light/50 focus-within:ring-1 focus-within:ring-ditto-light/30'}`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isImageMode ? "Ditto eating pizza..." : "Make the background blue..."}
                className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 pl-2"
                style={{ height: 'auto', overflow: 'hidden' }}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`
                  mb-1 p-2 rounded-lg transition-all
                  ${isLoading || !input.trim() 
                    ? 'bg-ditto-dark/50 text-gray-500 cursor-not-allowed' 
                    : isImageMode 
                        ? 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95 shadow-lg'
                        : 'bg-ditto-DEFAULT text-white hover:bg-fuchsia-600 active:scale-95 shadow-lg'
                  }
                `}
              >
                {isImageMode ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-500 mt-2">
              {isImageMode ? "Generating images may take a few seconds." : "Ditto can make mistakes. Check the code."}
            </div>
          </div>
        </aside>

        {/* Main Content / Output Area */}
        <main className="flex-1 flex flex-col h-full relative bg-gray-900 overflow-hidden">
          
          {/* Toolbar */}
          <div className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 shrink-0">
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
              <button
                onClick={() => setActiveTab(TabOption.IMAGE)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === TabOption.IMAGE 
                    ? 'bg-ditto-bg text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
            </div>
            
            {activeTab === TabOption.PREVIEW && (
              <div className="hidden md:flex text-xs text-gray-500 items-center gap-1">
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
            <div className={`absolute inset-0 w-full h-full bg-[#1e1e1e] transition-opacity duration-300 ${activeTab === TabOption.CODE ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative w-full h-full overflow-auto">
                 <button
                    onClick={handleCopyCode}
                    className="absolute top-4 right-4 p-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-md shadow-lg transition-all z-20 backdrop-blur-sm border border-gray-600"
                    title="Copy Code"
                  >
                    {isCodeCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="p-4 pt-12 text-sm font-mono text-gray-300 leading-relaxed">
                    <code>{code}</code>
                  </pre>
              </div>
            </div>

            {/* Image Tab */}
            <div className={`absolute inset-0 w-full h-full bg-[#1e1e1e] overflow-y-auto transition-opacity duration-300 ${activeTab === TabOption.IMAGE ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
               <div className="min-h-full flex flex-col items-center justify-center p-8 pb-32">
                   {generatedImageUrl ? (
                     <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                        <img 
                          src={generatedImageUrl} 
                          alt="Generated Result" 
                          className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-2xl border border-white/10" 
                        />
                        
                        <div className="flex gap-3 w-full">
                           <button 
                            onClick={handleCopyImage}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all shadow-lg font-medium active:scale-95"
                          >
                            {isImageCopied ? <Check className="w-5 h-5 text-green-400" /> : <ClipboardCopy className="w-5 h-5" />}
                            {isImageCopied ? "Copied" : "Copy Image"}
                          </button>
                           <a 
                            href={generatedImageUrl} 
                            download="ditto-generated.png"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ditto-DEFAULT hover:bg-fuchsia-600 text-white rounded-xl transition-all shadow-lg font-medium hover:scale-105 active:scale-95"
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </a>
                        </div>

                        {/* Tweet Preview Card */}
                        <div className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-xl">
                           <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs uppercase font-bold tracking-wider">
                              <XLogo className="w-4 h-4" />
                              Tweet Preview
                           </div>
                           <textarea 
                              value={tweetText}
                              onChange={(e) => setTweetText(e.target.value)}
                              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-ditto-light focus:border-ditto-light transition-all resize-none min-h-[100px]"
                           />
                           
                           {/* Prominent Warning */}
                           <div className="mt-3 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              <div className="text-xs text-amber-200">
                                 <strong className="block text-amber-500 mb-1">IMAGE NOT ATTACHED!</strong>
                                 X (Twitter) does not allow us to attach images automatically. You must <strong className="text-white underline decoration-amber-500">Copy</strong> or <strong className="text-white underline decoration-amber-500">Download</strong> the image above and paste it into the tweet yourself!
                              </div>
                           </div>

                           <div className="flex items-center justify-end">
                              <button 
                                onClick={handleShareTweet}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
                              >
                                <Share2 className="w-4 h-4" />
                                Post on X
                              </button>
                           </div>
                        </div>

                     </div>
                   ) : (
                     <div className="text-gray-500 flex flex-col items-center gap-4">
                        <ImageIcon className="w-16 h-16 opacity-20" />
                        <p>No image generated yet. Switch to "Images" mode in the chat to create one!</p>
                     </div>
                   )}
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}