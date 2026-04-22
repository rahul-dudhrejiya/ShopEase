// AI Shopping Assistant Widget
// Floating chat button on every page

import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import API from '../../api/axios.js';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I am ShopEase AI Assistant. How can I help you find the perfect product today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    setLoading(true);
    try {
      const { data } = await API.post('/ai/search', {
        message: userMessage
      });

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble right now. Please try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden">

          {/* HEADER */}
          <div className="bg-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-white" />
              <div>
                <p className="text-white font-semibold text-sm">
                  ShopEase AI
                </p>
                <p className="text-blue-200 text-xs">
                  Always here to help!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QUICK SUGGESTIONS */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {['Best phones under ₹20000', 'Top rated products', 'Shoes for running'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setInput(suggestion); }}
                className="text-xs bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-4 border-t dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 text-sm px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AIChatWidget;