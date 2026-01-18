import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // CRITICAL IMPORT
import { Send, X, Sparkles, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface ChatOverlayProps {
  plantName: string;
  plantType: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function ChatOverlay({ plantName, plantType, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'ai', 
      text: `Hi! I'm your specialized assistant for ${plantName}. Ask me about watering, sun, or pests!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, plantType, plantName })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: "Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- THE PORTAL FIX ---
  // Ensure we mount to document.body to escape the parent container's stacking context
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ zIndex: 2147483647 }} // "Nuclear" Z-Index: Max value possible
    >
      <Card 
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        // INLINE STYLES: Forces height and flex behavior regardless of Tailwind config
        style={{ 
          height: '650px', 
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* HEADER (Fixed Top) */}
        <div className="bg-green-600 p-4 flex justify-between items-center text-white flex-none z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">GrowAssistant AI</h3>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Expert on {plantName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MESSAGE AREA (Scrollable Middle) */}
        <div 
          className="bg-gray-50 p-4 space-y-4"
          // INLINE STYLES: Forces scrolling behavior
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            minHeight: 0 // Crucial for flex nested scrolling
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT (Fixed Bottom) */}
        <div className="p-4 bg-white border-t border-gray-100 flex-none z-10">
           <div className="flex gap-2">
             <Input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask a question..."
               className="flex-1"
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <Button onClick={handleSend} disabled={!input.trim()} className="bg-green-600 w-12 px-0">
               <Send className="w-5 h-5" />
             </Button>
           </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}