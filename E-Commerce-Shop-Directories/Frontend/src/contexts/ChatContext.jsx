import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { AIAssistant } from '../services/AIAssistant';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userLanguage, setUserLanguage] = useState('en');
  const [aiAssistant, setAiAssistant] = useState(null);

  // Auto-detect user language
  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language || navigator.userLanguage;
      const supportedLanguages = ['en', 'bn', 'hi'];
      const detectedLang = supportedLanguages.find(lang => 
        browserLang.toLowerCase().startsWith(lang)
      ) || 'en';
      setUserLanguage(detectedLang);
    };

    detectLanguage();
  }, []);

  // Initialize AI Assistant
  useEffect(() => {
    const assistant = new AIAssistant(userLanguage, user);
    setAiAssistant(assistant);
  }, [userLanguage, user]);

  const getWelcomeMessage = useCallback(() => {
    const messages = {
      en: user 
        ? `Hello ${user.name}! 👋 I'm your AI shopping assistant. I can help you find products, track orders, and answer any questions. How can I assist you today?`
        : "Hello! 👋 Welcome to our store. I'm your AI shopping assistant. I can help you discover products, compare prices, and provide instant support. How can I help you today?",
      bn: user
        ? `হ্যালো ${user.name}! 👋 আমি আপনার AI শপিং সহায়ক। আমি পণ্য খুঁজতে, অর্ডার ট্র্যাক করতে এবং যেকোনো প্রশ্নের উত্তর দিতে সাহায্য করতে পারি। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি?`
        : "হ্যালো! 👋 আমাদের দোকানে স্বাগতম। আমি আপনার AI শপিং সহায়ক। আমি পণ্য আবিষ্কার করতে, দাম তুলনা করতে এবং তাৎক্ষণিক সহায়তা প্রদান করতে সাহায্য করতে পারি। আমি কীভাবে আপনাকে সাহায্য করতে পারি?",
      hi: user
        ? `नमस्ते ${user.name}! 👋 मैं आपका AI शॉपिंग असिस्टेंट हूं। मैं उत्पाद खोजने, ऑर्डर ट्रैक करने और किसी भी प्रश्न का उत्तर देने में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?`
        : "नमस्ते! 👋 हमारे स्टोर में आपका स्वागत है। मैं आपका AI शॉपिंग असिस्टेंट हूं। मैं उत्पादों की खोज करने, कीमतों की तुलना करने और तत्काल सहायता प्रदान करने में मदद कर सकता हूं। मैं आपकी कैसे मदद कर सकता हूं?"
    };
    return messages[userLanguage] || messages.en;
  }, [user, userLanguage]);

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: Date.now(),
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }]);
  }, [user, userLanguage, getWelcomeMessage]);

  const addMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (message.sender === 'ai' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const sendMessage = async (text, type = 'text') => {
    // Add user message
    addMessage({
      text,
      sender: 'user',
      type
    });

    // Show typing indicator
    setIsTyping(true);

    try {
      // Use AI Assistant for response
      if (aiAssistant) {
        const aiResponse = await aiAssistant.generateResponse(text, {
          currentPage: window.location.pathname,
          sessionId,
          timestamp: new Date()
        });
        
        setIsTyping(false);
        addMessage({
          text: aiResponse,
          sender: 'ai',
          type: 'text'
        });
      } else {
        // Fallback response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsTyping(false);
        addMessage({
          text: getErrorMessage(),
          sender: 'ai',
          type: 'text'
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      addMessage({
        text: getErrorMessage(),
        sender: 'ai',
        type: 'text'
      });
    }
  };

  const getErrorMessage = () => {
    const messages = {
      en: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
      bn: "আমি দুঃখিত, কিন্তু আমি কিছু প্রযুক্তিগত সমস্যার সম্মুখীন হচ্ছি। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।",
      hi: "मुझे खेद है, लेकिन मुझे कुछ तकनीकी कठिनाइयों का सामना करना पड़ रहा है। कृपया एक क्षण में फिर से प्रयास करें।"
    };
    return messages[userLanguage] || messages.en;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const clearMessages = () => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: Date.now(),
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const value = {
    isOpen,
    messages,
    isTyping,
    unreadCount,
    sessionId,
    userLanguage,
    setUserLanguage,
    toggleChat,
    sendMessage,
    addMessage,
    clearMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
