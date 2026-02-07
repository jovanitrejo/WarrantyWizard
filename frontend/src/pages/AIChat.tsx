import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hello! I\'m your WarrantyWizard AI assistant, powered by Grainger!\n\nI can help you:\n🔍 Find warranty information\n📅 Check expiration dates\n💰 View coverage values\n📋 File warranty claims\n\nTry asking: "Which items expire next month?" or "How many active warranties do I have?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <h1>🤖 AI Chat Assistant</h1>
        <p>Powered by Grainger - Ask me anything about your warranties</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <div className="message-content">
              <span className="typing-indicator">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Which items expire next month?"
          className="chat-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="chat-send-btn">
          Send
        </button>
      </form>

      <div className="chat-suggestions">
        <p>Try asking:</p>
        <div className="suggestion-chips">
          <button onClick={() => setInput('Which items expire next month?')} className="suggestion-chip">
            Which items expire next month?
          </button>
          <button onClick={() => setInput('How many active warranties do I have?')} className="suggestion-chip">
            How many active warranties do I have?
          </button>
          <button onClick={() => setInput('What is my total coverage value?')} className="suggestion-chip">
            What is my total coverage value?
          </button>
          <button onClick={() => setInput('How do I file a claim?')} className="suggestion-chip">
            How do I file a claim?
          </button>
        </div>
      </div>
    </div>
  );
}

