import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ragApi } from '../services/api';

interface AskMatterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCitation: (key: string) => void;
  isDockedMode?: boolean;
  matterTitle?: string;
  matterId?: number;
}

export function AskMatterDrawer({
  isOpen,
  onClose,
  onOpenCitation,
  isDockedMode = false,
  matterTitle,
  matterId,
}: AskMatterDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsLoading(true);

    try {
      if (!matterId) {
        throw new Error('No matter selected. Open a matter to use the AI assistant.');
      }

      const response = await ragApi.chat(matterId, textToSend);
      const data = response.data;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supportBadge: data.confidence,
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${err?.response?.data?.error || err?.message || 'An error occurred while processing your query.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supportBadge: 'Partially Supported'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const renderFormattedText = (text: string) => {
    // Replace citation patterns like [Doc X, p.Y] with interactive clickable buttons
    const parts = text.split(/(\[Doc\s+\d+,\s*p\.\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[Doc\s+(\d+),\s*p\.(\d+)\]/);
      if (match) {
        const cleanKey = `Doc ${match[1]}, p.${match[2]}`;
        return (
          <button
            key={index}
            onClick={() => onOpenCitation(cleanKey)}
            className="inline-flex items-center gap-1 text-[#2D5A27] bg-[#2D5A27]/10 hover:bg-[#2D5A27]/20 border border-[#2D5A27]/20 font-semibold px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer select-text mx-0.5"
            title={`Click to view verified source citation: ${cleanKey}`}
          >
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">description</span>
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen && !isDockedMode) return null;

  const content = (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-[#0A192F] text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-blue-400" aria-hidden="true">forum</span>
          <h3 className="font-heading text-base font-bold tracking-wide">
            Ask this Matter
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
              title="Close panel"
              aria-label="Close panel"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {isDockedMode ? 'open_in_full' : 'close'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Grounding Banner */}
      <div className="bg-[#F0F4F8] border-b border-gray-200 py-1.5 px-4 text-[11px] font-semibold text-[#115fd4] flex items-center justify-center gap-1.5 shrink-0 uppercase tracking-wider">
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">lock</span>
        <span>Responses limited strictly to 42 indexed documents</span>
      </div>

      {/* Chat Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F0F2F5]/40 text-sm">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 animate-slide-up mt-8">
            <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center mb-5 shadow-md">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">psychology</span>
            </div>
            <p className="font-semibold text-gray-900 text-lg mb-1">Matter Intelligence</p>
            <p className="text-sm text-gray-500 max-w-xs mb-8">
              Ask questions to extract facts, identify contradictions, and find exact precedents across all indexed documents.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => handleSend('Summarize the key arguments presented by the plaintiff.')}
                className="text-xs bg-white border border-gray-200 p-3 rounded-md text-gray-700 hover:border-gray-400 hover:shadow-sm text-left transition-all cursor-pointer font-medium"
              >
                Summarize key arguments
              </button>
              <button
                onClick={() => handleSend('What is the definition of Confidential Information in the NDA?')}
                className="text-xs bg-white border border-gray-200 p-3 rounded-md text-gray-700 hover:border-gray-400 hover:shadow-sm text-left transition-all cursor-pointer font-medium"
              >
                Find "Confidential Information" definition
              </button>
              <button
                onClick={() => handleSend('Are there any contradictions regarding the timeline of events?')}
                className="text-xs bg-white border border-gray-200 p-3 rounded-md text-gray-700 hover:border-gray-400 hover:shadow-sm text-left transition-all cursor-pointer font-medium"
              >
                Analyze timeline contradictions
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.sender === 'user' ? (
                <>
                  <span className="text-[10px] text-gray-400 mb-1 mr-1 uppercase font-semibold">You</span>
                  <div className="bg-[#E5E7EB] text-[#1A1A1A] text-[13px] leading-relaxed px-3.5 py-2.5 rounded-lg rounded-tr-xs max-w-[88%] border border-gray-300/60 shadow-xs">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 mr-1">{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-1 ml-0.5">
                    <span className="material-symbols-outlined text-[15px] text-[#2D5A27]" aria-hidden="true">visibility</span>
                    <span className="text-[11px] text-[#0A192F] uppercase font-bold tracking-wide">G&amp;S AI</span>
                  </div>
                  <div className="bg-white text-[#1A1A1A] text-[13px] leading-relaxed px-3.5 py-3 rounded-lg rounded-tl-xs max-w-[92%] shadow-xs border border-gray-200 space-y-2">
                    {msg.supportBadge && (
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${msg.supportBadge === 'Partially Supported'
                            ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                            : 'bg-green-50 text-[#2D5A27] border border-green-200'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                          {msg.supportBadge === 'Partially Supported' ? 'warning' : 'verified'}
                        </span>
                        {msg.supportBadge}
                      </div>
                    )}
                    <div className="whitespace-pre-line">{renderFormattedText(msg.text)}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 ml-1">{msg.timestamp}</span>
                </>
              )}
            </div>
          ))
        )}

        {/* AI Loading State */}
        {isLoading && (
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center gap-1.5 mb-1 ml-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#2D5A27] animate-pulse" aria-hidden="true">visibility</span>
              <span className="text-[11px] text-[#0A192F] uppercase font-bold tracking-wide">G&amp;S AI</span>
            </div>
            <div className="bg-white flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg rounded-tl-xs shadow-xs border border-gray-200 min-w-[75px]">
              <div className="w-2 h-2 bg-[#0A192F] rounded-full animate-bounce-subtle"></div>
              <div className="w-2 h-2 bg-[#0A192F] rounded-full animate-bounce-subtle" style={{ animationDelay: '-0.16s' }}></div>
              <div className="w-2 h-2 bg-[#0A192F] rounded-full animate-bounce-subtle" style={{ animationDelay: '-0.32s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Area */}
      <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            id="ask-matter-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            className="w-full h-[44px] pl-3 pr-11 text-[13px] bg-white border border-gray-300 rounded text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F] transition-all shadow-xs"
            placeholder="Ask about precedents, dates, or facts..."
            type="text"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1.5 flex items-center justify-center w-8 h-8 rounded bg-[#0A192F] text-white hover:bg-[#115fd4] disabled:opacity-40 transition-colors focus:outline-none cursor-pointer"
            aria-label="Send Query"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_upward</span>
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="text-[11px] text-gray-500 hover:text-[#0A192F] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">history</span>
            Clear Chat
          </button>
          <p className="text-[10px] text-gray-400">Powered by Legal-LLM Core</p>
        </div>
      </div>
    </div>
  );

  // If in slide-over drawer mode (full drawer)
  if (!isDockedMode) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
        <div className="flex-1 hidden md:block" onClick={onClose} />
        <aside
          id="ask-matter-slideover"
          className="w-full md:w-[420px] bg-white shadow-2xl h-full flex flex-col border-l border-gray-200 transform transition-transform duration-300"
        >
          {content}
        </aside>
      </div>
    );
  }

  // Docked mode in 3-column dashboard
  return (
    <div className="w-full bg-white rounded shadow-xs border border-gray-200 flex flex-col h-[580px] shrink-0 sticky top-6 overflow-hidden">
      {content}
    </div>
  );
}
