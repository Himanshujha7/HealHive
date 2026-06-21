import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <button
          className="flex-shrink-0 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-full p-2 hover:bg-emerald-50 dark:hover:bg-slate-800"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows="1"
          maxLength={500}
          disabled={isLoading}
          className="flex-1 border border-emerald-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm disabled:bg-slate-50 dark:disabled:bg-slate-850 disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-slate-500"
        />

        <button
          className="flex-shrink-0 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-full p-2 hover:bg-emerald-50 dark:hover:bg-slate-800"
          aria-label="Add emoji"
        >
          <Smile size={20} />
        </button>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white rounded-full p-2 transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>

      <div className="text-right text-xs text-slate-400 dark:text-slate-500 mt-1">
        {message.length}/500
      </div>
    </div>
  );
};

export default ChatInput;
