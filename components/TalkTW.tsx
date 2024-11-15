
'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, BotIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const TalktoWebsite: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [mode, setMode] = useState<'r' | 's'>('r');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [storedSummary, setStoredSummary] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const sampleQuestions: string[] = [
    "Who is the competition of this website?",
    "What is the revenue model of this website?",
    "Who are the alternatives to this website?",
    "How does this website engage with its users?",
    "Are there any user feedback or reviews available for this website?",
    "What community or social features does this website provide?",
    "What technologies used to build this website?"
  ];
    const handleInitialRequest = async (input: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/jina', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ mode, input, language: 'en' }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching data.');
      }

      setMessages(prev => [
        ...prev,
        { type: 'bot', content: `Summary: ${data.insights}` },
      ]);

      const openAIResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ summary: data.insights }), 
      });

      const openAIData = await openAIResponse.json();

      if (!openAIResponse.ok) {
        throw new Error(openAIData.message || 'Error fetching context from OpenAI.');
      }

      setStoredSummary(openAIData.storedSummary);

    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setMessages(prev => [...prev, { type: 'bot', content: 'An error occurred while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpRequest = async (question: string) => {
    setIsLoading(true);
    setError('');

    try {
      const openAIResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ question, storedSummary }),
      });

      const openAIData = await openAIResponse.json();

      if (!openAIResponse.ok) {
        throw new Error(openAIData.message || 'Error fetching answer from OpenAI.');
      }

      setMessages(prev => [
        ...prev,
        { type: 'bot', content: `${openAIData.answer}` },
      ]);

    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setMessages(prev => [...prev, { type: 'bot', content: 'An error occurred while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    if (storedSummary) {
      await handleFollowUpRequest(inputMessage);
    } else {
      await handleInitialRequest(inputMessage);
    }

    setInputMessage('');
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ... (keep all the existing functions: handleInitialRequest, handleFollowUpRequest, handleSubmit, useEffect)

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0A101F] to-[#1A2035] text-white font-sans">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0D1424] p-6 rounded-t-2xl flex items-center shadow-lg"
        >
          <BotIcon className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Talk to Website</h2>
            <p className="text-sm text-gray-400">Enter a URL and ask questions!</p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1629] rounded-b-2xl shadow-inner" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.type === 'user' ? 'bg-blue-500' : 'bg-[#1E293B]'} rounded-2xl p-4 shadow-md`}>
                {/* <Markdown text={message.content} /> */}
                <Markdown>{message.content}</Markdown>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[#1E293B] rounded-2xl p-4 shadow-md">
                <p className="flex items-center">
                  <span className="mr-2">Analyzing</span>
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-[#0D1424] rounded-2xl mt-6 shadow-lg">
          <div className="flex flex-wrap gap-3 mb-4">
            {sampleQuestions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1E293B] py-2 px-4 rounded-full text-sm hover:bg-blue-500 transition-colors duration-200"
                onClick={() => handleFollowUpRequest(question)}
                disabled={!storedSummary || isLoading}
              >
                {question}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={mode === 'r' ? 'Enter website URL' : 'Enter search query'}
              className="w-full bg-[#1E293B] py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 p-3 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
              disabled={isLoading}
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </form>
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalktoWebsite;
