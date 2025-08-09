import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import './ChatWidget.css';

const ChatWidget = () => {
  const { 
    isOpen, 
    messages, 
    isTyping, 
    unreadCount, 
    toggleChat, 
    sendMessage, 
    clearMessages,
    userLanguage,
    setUserLanguage
  } = useChat();
  
  const { user } = useAuth();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Add checkout page class to body for special styling
  useEffect(() => {
    const isCheckoutPage = location.pathname.includes('/checkout');
    if (isCheckoutPage) {
      document.body.classList.add('checkout-page');
    } else {
      document.body.classList.remove('checkout-page');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('checkout-page');
    };
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      en: '🇺🇸',
      bn: '🇧🇩',
      hi: '🇮🇳'
    };
    return icons[lang] || '🌐';
  };

  const getLanguageName = (lang) => {
    const names = {
      en: 'English',
      bn: 'বাংলা',
      hi: 'हिंदी'
    };
    return names[lang] || lang;
  };

  const quickReplies = {
    en: [
      "Show me popular products",
      "Track my order",
      "Shipping policy",
      "Return policy",
      "Payment methods",
      "Size guide",
      "Check stock availability",
      "Warranty information",
      "Store locations",
      "Bulk order inquiry",
      "Technical specifications",
      "Account help",
      "Contact support"
    ],
    bn: [
      "জনপ্রিয় পণ্য দেখান",
      "আমার অর্ডার ট্র্যাক করুন",
      "শিপিং নীতি",
      "রিটার্ন নীতি",
      "পেমেন্ট পদ্ধতি",
      "সাইজ গাইড",
      "স্টক চেক করুন",
      "ওয়ারেন্টি তথ্য",
      "দোকানের ঠিকানা",
      "বাল্ক অর্ডার",
      "প্রযুক্তিগত তথ্য",
      "অ্যাকাউন্ট সাহায্য",
      "সাপোর্ট যোগাযোগ"
    ],
    hi: [
      "लोकप्रिय उत्पाद दिखाएं",
      "मेरा ऑर्डर ट्रैक करें",
      "शिपिंग नीति",
      "वापसी नीति",
      "भुगतान के तरीके",
      "साइज़ गाइड",
      "स्टॉक उपलब्धता",
      "वारंटी जानकारी",
      "स्टोर का स्थान",
      "बल्क ऑर्डर पूछताछ",
      "तकनीकी विनिर्देश",
      "खाता सहायता",
      "सहायता संपर्क"
    ]
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`chat-toggle ${isOpen ? 'chat-open' : ''}`} onClick={toggleChat}>
        <div className="chat-toggle-icon">
          {isOpen ? (
            <i className="fas fa-times"></i>
          ) : (
            <>
              <i className="fas fa-comments"></i>
              {unreadCount > 0 && (
                <span className="chat-unread-badge">{unreadCount}</span>
              )}
            </>
          )}
        </div>
        <div className="chat-toggle-pulse"></div>
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'chat-window-open' : ''}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="chat-header-text">
              <h6 className="chat-title">AI Shopping Assistant</h6>
              <p className="chat-status">
                <span className="status-indicator"></span>
                Online • Instant replies
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            {/* Language Selector */}
            <div className="language-selector">
              <button
                className="language-toggle"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                {getLanguageIcon(userLanguage)}
              </button>
              {showLanguageSelector && (
                <div className="language-dropdown">
                  {['en', 'bn', 'hi'].map(lang => (
                    <button
                      key={lang}
                      className={`language-option ${lang === userLanguage ? 'active' : ''}`}
                      onClick={() => {
                        setUserLanguage(lang);
                        setShowLanguageSelector(false);
                      }}
                    >
                      {getLanguageIcon(lang)} {getLanguageName(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Clear Chat */}
            <button className="chat-action-btn" onClick={clearMessages} title="Clear chat">
              <i className="fas fa-trash"></i>
            </button>
            
            {/* Minimize */}
            <button className="chat-action-btn" onClick={toggleChat} title="Close chat">
              <i className="fas fa-minus"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}-message`}>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="message ai-message typing-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 1 && !isTyping && (
          <div className="quick-replies">
            <p className="quick-replies-title">Quick actions:</p>
            <div className="quick-replies-grid">
              {quickReplies[userLanguage]?.slice(0, 6).map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => sendMessage(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input">
          <div className="chat-input-container">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                userLanguage === 'bn' ? 'একটি বার্তা টাইপ করুন...' :
                userLanguage === 'hi' ? 'एक संदेश टाइप करें...' :
                'Type a message...'
              }
              className="chat-input-field"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="chat-send-btn"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <div className="chat-input-footer">
            <p className="chat-disclaimer">
              {userLanguage === 'bn' ? 'AI দ্বারা চালিত • তাৎক্ষণিক সহায়তা' :
               userLanguage === 'hi' ? 'AI द्वारा संचालित • तत्काल सहायता' :
               'Powered by AI • Instant assistance'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      {isOpen && <div className="chat-overlay" onClick={toggleChat}></div>}
    </>
  );
};

export default ChatWidget;
