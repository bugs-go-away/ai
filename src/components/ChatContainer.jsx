import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TypingIndicator = () => (
  <div className='flex items-end space-x-2 justify-start'>
    <div className='rounded-2xl px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-bl-none'>
      <div className='flex space-x-1'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className='w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce'
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username] = useState('user');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, isTyping]);

  const sendMessageToServer = async (messageData) => {
    try {
      const response = await fetch('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.', {
        duration: 1000,
        position: 'top-right',
        style: {
          backgroundColor: '#f87171',
          color: 'white',
        },
      });
      return null;
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
      };

      // Optimistically update UI
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage('');
      setIsTyping(true);

      // Send message to server
      const messageData = {
        username: username,
        message: inputMessage,
        timestamp: new Date().toISOString(),
      };

      const response = await sendMessageToServer(messageData);
      setIsTyping(false);

      if (!response) {
        // Remove the failed message from UI
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      } else {
        // Add server response to messages
        setMessages((prev) => [
          ...prev,
          {
            id: response.id || Date.now(),
            text: response.message,
            sender: 'server',
            timestamp: response.timestamp,
          },
        ]);
      }
    }
  }, [inputMessage, username]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4'>
			<Toaster />
      <div className='text-center mb-8 animate-fade-in'>
      </div>

      <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-lg flex flex-col h-[600px] border border-slate-200 dark:border-slate-700'>
        <div
          className='flex-1 overflow-y-auto mb-4 space-y-4 pr-4 scroll-smooth'
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(100,116,139,0.2) transparent',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end space-x-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] transition-all duration-200 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                <p className='text-sm leading-relaxed'>{message.text}</p>
              </div>
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className='flex gap-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl'>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type your message...'
            className='flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none text-sm p-2 focus:outline-none h-8 max-h-8 leading-tight'
            style={{ overflow: 'auto' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg px-3 py-1 transition-colors duration-200 flex items-center justify-center'
            aria-label='Send message'
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
