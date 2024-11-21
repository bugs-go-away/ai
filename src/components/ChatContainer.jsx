import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Beaker, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ScoreContainer from './ScoreContainer';

const CalculatingScore = () => {
  return (
    <div className='bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full mx-4'>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative'>
          <div className='absolute inset-0 bg-blue-500/20 animate-ping rounded-full' />
          <Loader2 className='w-12 h-12 text-blue-500 animate-spin' />
        </div>
        <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-200'>
          Calculating Score
        </h2>
        <p className='text-slate-600 dark:text-slate-400 text-center'>
          Analyzing your conversation and preparing feedback...
        </p>
      </div>
    </div>
  );
};

const TypingIndicator = ({ opponent }) => (
  <div className='flex items-end space-x-2 justify-start'>
    <div className='flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700'>
      <img
        src={opponent?.profileImage || `/default.png`}
        alt={opponent?.name}
        className='w-full h-full object-cover'
      />
    </div>
    <div className='rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-bl-none'>
      <div className='flex space-x-1 items-center min-h-[1.25rem]'>
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

const Message = ({ message, opponent }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex items-end space-x-2 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className='flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700'>
          <img
            src={opponent?.profileImage || `/default.png`}
            alt={opponent?.name}
            className='w-full h-full object-cover'
          />
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-2 max-w-[80%] transition-all duration-200 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : message.sender === 'system'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
        }`}
      >
        <p className='text-sm leading-relaxed'>{message.text}</p>
      </div>
    </div>
  );
};

const ChatContainer = ({ username, opponent, onReset }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [gameScore, setGameScore] = useState({ score: 0, feedback: '' });
  const [isTestMode, setIsTestMode] = useState(false);
  const messagesEndRef = useRef(null);
  const userMessageCount = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, isTyping]);

  const testScore = (score) => {
    setGameEnded(true);
    setIsCalculatingScore(true);
    setTimeout(() => {
      setGameScore({
        score: score,
        feedback: `This is a test feedback message for score ${score}. ${
          score >= 8
            ? 'Excellent work!'
            : score >= 6
            ? 'Good effort!'
            : 'Keep practicing!'
        } This is additional feedback text to test how longer feedback messages appear in the scoring overlay.`,
      });
      setIsCalculatingScore(false);
    }, 1500);
  };

  const sendMessageToServer = async (messageData) => {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/message?username=${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.endMessage && data.endMessage.didEnd) {
        setGameScore({
          score: data.endMessage.score || 0,
          feedback: data.endMessage.feedback || 'Game completed!',
        });
        setIsCalculatingScore(false);
      }

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

      userMessageCount.current += 1;

      // Check if this is the 6th message
      if (userMessageCount.current === 6) {
        setGameEnded(true);
        setIsCalculatingScore(true);
      }

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage('');
      setIsTyping(true);

      const messageData = {
        newMessage: inputMessage,
      };

      const serverResponse = await sendMessageToServer(messageData);
      setIsTyping(false);

      if (!serverResponse) {
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
        userMessageCount.current -= 1; // Decrement count if message failed
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: serverResponse.id || Date.now(),
            text: serverResponse.response.message.content,
            sender: 'server',
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

  const resetGame = () => {
    setGameEnded(false);
    setIsCalculatingScore(false);
    setGameScore({ score: 0, feedback: '' });
    setMessages([]);
    setInputMessage('');
    setIsTyping(false);
    userMessageCount.current = 0;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4'>
      <Toaster />
      <div className='text-center mb-8 animate-fade-in'>
        {opponent && (
          <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200'>
            Chatting with {opponent.name} - {opponent.type} Conversation
          </h2>
        )}

        <button
          onClick={() => setIsTestMode(!isTestMode)}
          className='mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
        >
          <Beaker size={16} />
          {isTestMode ? 'Hide Test Panel' : 'Show Test Panel'}
        </button>
      </div>

      {isTestMode && (
        <div className='mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700'>
          <div className='flex gap-2 flex-wrap'>
            <button
              onClick={() => testScore(9.5)}
              className='px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600'
            >
              Test High Score (9.5)
            </button>
            <button
              onClick={() => testScore(7.5)}
              className='px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600'
            >
              Test Medium Score (7.5)
            </button>
            <button
              onClick={() => testScore(4.5)}
              className='px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
            >
              Test Low Score (4.5)
            </button>
            <button
              onClick={resetGame}
              className='px-3 py-1 bg-slate-500 text-white rounded-lg hover:bg-slate-600'
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      <div className='relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-lg flex flex-col h-[600px] border border-slate-200 dark:border-slate-700'>
        {gameEnded && (
          <div className='absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl'>
            {isCalculatingScore ? (
              <CalculatingScore />
            ) : (
              <div className='w-full max-w-3xl mx-4'>
                <ScoreContainer
                  score={gameScore.score}
                  feedback={gameScore.feedback}
                  onNewConversation={onReset}
                />
              </div>
            )}
          </div>
        )}

        <div
          className='flex-1 overflow-y-auto mb-4 space-y-4 pr-4 scroll-smooth'
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(100,116,139,0.2) transparent',
          }}
        >
          {messages.map((message) => (
            <Message key={message.id} message={message} opponent={opponent} />
          ))}
          {isTyping && <TypingIndicator opponent={opponent} />}
          <div ref={messagesEndRef} />
        </div>

        <div className='flex gap-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl'>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${opponent ? opponent.name : ''}...`}
            className='flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none text-sm p-2 focus:outline-none h-8 max-h-8 leading-tight'
            style={{ overflow: 'auto' }}
            disabled={gameEnded}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || gameEnded}
            className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg px-3 py-1 transition-colors duration-200 flex items-center justify-center'
            aria-label='Send message'
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
