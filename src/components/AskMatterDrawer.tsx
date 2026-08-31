import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { initialChatMessages, sampleCitations } from '../data/mockData';

interface AskMatterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCitation: (key: string) => void;
  isDockedMode?: boolean;
}

export function AskMatterDrawer({
  isOpen,
  onClose,
  onOpenCitation,
  isDockedMode = false,
}: AskMatterDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (queryText?: string) => {
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

    // Simulate grounded legal LLM response
    setTimeout(() => {
      let aiResponseText = '';
      let badge: 'Partially Supported' | 'High Confidence' | 'Conflict Detected' | undefined = 'High Confidence';
      let docCitations: Array<{ label: string; docNum: number; page: number; docName: string }> = [];

      const lower = textToSend.toLowerCase();
      if (lower.includes('nda') || lower.includes('confidential') || lower.includes('clause')) {
        aiResponseText = 'According to Clause 1.2 of the NDA [Doc 2, p.1], Confidential Information is defined as "any and all technical and non-technical information including patent, copyright, trade secret, and proprietary information, techniques, sketches, drawings, models, inventions, know-how, processes, apparatus, equipment, algorithms..."';
        docCitations = [{ label: '[Doc 2, p.1]', docNum: 2, page: 1, docName: 'Signed NDA' }];
      } else if (lower.includes('precedent') || lower.includes('kesavananda') || lower.includes('case law')) {
        aiResponseText = 'The plaintiff primarily relies on Kesavananda Bharati v. State of Kerala for the basic structure doctrine to argue against recent statutory amendments [Doc 3, p.14]. They further cite L. Chandra Kumar v. Union of India to defend the jurisdiction of the High Courts under Article 226 [Doc 12, p.4].';
        docCitations = [
          { label: '[Doc 3, p.14]', docNum: 3, page: 14, docName: 'Summary Judgment Memo' },
          { label: '[Doc 12, p.4]', docNum: 12, page: 4, docName: 'Jurisdictional Submissions' }
        ];
      } else if (lower.includes('damage') || lower.includes('quantification') || lower.includes('amount')) {
        aiResponseText = 'Damages are claimed under Section 73 of the Indian Contract Act for an estimated loss of INR 48.5 Crores resulting from vendor breach. [Doc 7, p.4] System flags that supporting invoices for indirect loss are partially missing.';
        badge = 'Partially Supported';
        docCitations = [{ label: '[Doc 7, p.4]', docNum: 7, page: 4, docName: 'Damages Assessment Brief' }];
      } else if (lower.includes('rejoinder') || lower.includes('opposing') || lower.includes('affidavit')) {
        aiResponseText = 'A document titled "Rejoinder Affidavit" is present in the index [Doc 1, p.2], but the actual physical file appears to be missing from the uploaded matter corpus. Opposing counsel was scheduled to file by October 12th.';
        badge = 'Partially Supported';
        docCitations = [{ label: '[Doc 1, p.2]', docNum: 1, page: 2, docName: 'Index List' }];
      } else {
        aiResponseText = `Based on cross-referencing the 42 indexed documents in matter G&S-2023-14, the records indicate that the arbitration timeline began with the initial notice on August 05, 2023 [Doc 4, p.12]. Further evidentiary disclosures are scheduled before the next hearing date.`;
        docCitations = [{ label: '[Doc 4, p.12]', docNum: 4, page: 12, docName: "Plaintiff's Brief v2" }];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supportBadge: badge,
        citations: docCitations
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 900);
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
            <span className="material-symbols-outlined text-[13px]">description</span>
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
          <span className="material-symbols-outlined text-[20px] text-blue-400">forum</span>
          <h3 className="font-heading text-base font-bold tracking-wide">
            Ask this Matter
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              title="Close panel"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDockedMode ? 'open_in_full' : 'close'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Grounding Banner */}
      <div className="bg-[#F0F4F8] border-b border-gray-200 py-1.5 px-4 text-[11px] font-semibold text-[#115fd4] flex items-center justify-center gap-1.5 shrink-0 uppercase tracking-wider">
        <span className="material-symbols-outlined text-[14px]">lock</span>
        <span>Responses limited strictly to 42 indexed documents</span>
      </div>

      {/* Chat Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F0F2F5]/40 text-sm">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">gavel</span>
            <p className="font-semibold text-gray-700">Matter Intelligence Assistant</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Query facts, precedent citations, inconsistencies, and exact clauses across all 42 indexed documents.
            </p>
            <div className="mt-4 flex flex-col gap-1.5 w-full max-w-xs text-left">
              <button
                onClick={() => handleSend('What is the definition of Confidential Information?')}
                className="text-xs bg-white border border-gray-200 p-2 rounded text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors"
              >
                🔍 Definition of Confidential Info in NDA
              </button>
              <button
                onClick={() => handleSend('What are the key precedents cited by plaintiff?')}
                className="text-xs bg-white border border-gray-200 p-2 rounded text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors"
              >
                ⚖️ Key precedents cited by plaintiff
              </button>
              <button
                onClick={() => handleSend('Did the opposing counsel file the rejoinder?')}
                className="text-xs bg-white border border-gray-200 p-2 rounded text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors"
              >
                ⚠️ Rejoinder filing status check
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
                    <span className="material-symbols-outlined text-[15px] text-[#2D5A27]">gavel</span>
                    <span className="text-[11px] text-[#0A192F] uppercase font-bold tracking-wide">G&amp;S AI</span>
                  </div>
                  <div className="bg-white text-[#1A1A1A] text-[13px] leading-relaxed px-3.5 py-3 rounded-lg rounded-tl-xs max-w-[92%] shadow-xs border border-gray-200 space-y-2">
                    {msg.supportBadge && (
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          msg.supportBadge === 'Partially Supported'
                            ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                            : 'bg-green-50 text-[#2D5A27] border border-green-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
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
              <span className="material-symbols-outlined text-[15px] text-[#2D5A27] animate-pulse">gavel</span>
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
            className="absolute right-1.5 flex items-center justify-center w-8 h-8 rounded bg-[#0A192F] text-white hover:bg-[#115fd4] disabled:opacity-40 transition-colors focus:outline-none"
            aria-label="Send Query"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="text-[11px] text-gray-500 hover:text-[#0A192F] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">history</span>
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
