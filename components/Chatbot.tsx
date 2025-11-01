
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { translations } from '../constants';
import { SendIcon, UserIcon, BotIcon } from './Icons';
import Markdown from 'react-markdown';

const Chatbot: React.FC<{ language: Language }> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendChatMessage(input);
    const modelMessage: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col items-center p-4">
      <div className="w-full max-w-3xl h-full flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>}
                <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5" /></div>}
              </div>
            ))}
            {isLoading && (
               <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>
                 <div className="max-w-md p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none flex items-center">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s] mx-1"></div>
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.askMe}
              className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
