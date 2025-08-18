import React from 'react';
import DevbrainAppInteractive from './DevbrainAppInteractive';
import './styles/globals.css';

function App() {
  return <DevbrainAppInteractive />;
}

function AppOld() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [inputValue, setInputValue] = useState('');

  const handleGetStarted = () => {
    setShowChat(true);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      // Store the message before clearing
      const currentMessage = inputValue;
      const userMessage = { role: 'user', content: currentMessage };
      setMessages([...messages, userMessage]);
      setInputValue('');
      
      try {
        // Call the real backend API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${apiUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            context: messages,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const aiResponse = {
            role: 'assistant' as const,
            content: data.data.content,
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          const errorResponse = {
            role: 'assistant' as const,
            content: `Error: ${data.error}. Please check your API configuration.`,
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      } catch (error) {
        // Fallback to mock response if API fails
        const aiResponse = {
          role: 'assistant' as const,
          content: `I understand you want to build something related to "${currentMessage}". 

Note: Could not connect to backend API. Make sure:
1. Backend is running on port 3002
2. OpenAI API key is configured in backend/.env
3. CORS is properly configured`,
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🚀 DevbrainAI</h1>
              <span className="text-sm text-gray-500">AI Business Consultant</span>
            </div>
            <button 
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex">
          {/* Conversation Panel */}
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Welcome to DevbrainAI! 👋
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Tell me about your business idea, and I'll help you transform it into a deployed MVP.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <button 
                      onClick={() => setInputValue("I want to build an app for freelancers")}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition text-left"
                    >
                      <div className="font-medium text-gray-900">💼 Freelancer App</div>
                      <div className="text-sm text-gray-500 mt-1">Invoice & project management</div>
                    </button>
                    <button 
                      onClick={() => setInputValue("I need a marketplace for services")}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition text-left"
                    >
                      <div className="font-medium text-gray-900">🛍️ Marketplace</div>
                      <div className="text-sm text-gray-500 mt-1">Connect buyers & sellers</div>
                    </button>
                    <button 
                      onClick={() => setInputValue("I want to create a SaaS platform")}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition text-left"
                    >
                      <div className="font-medium text-gray-900">☁️ SaaS Platform</div>
                      <div className="text-sm text-gray-500 mt-1">Subscription-based service</div>
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl rounded-lg px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your business idea here..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Press Enter to send • Powered by OpenAI GPT-4
              </div>
            </div>
          </div>

          {/* Visualization Panel (Placeholder) */}
          <div className="hidden lg:block w-96 bg-gray-100 border-l border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Visual Intelligence</h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                Market analysis and visualizations will appear here as you describe your idea.
              </p>
              <div className="mt-4 space-y-2">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded flex items-center justify-center text-gray-500">
                  📊 Market Analysis
                </div>
                <div className="h-32 bg-gradient-to-r from-green-100 to-teal-100 rounded flex items-center justify-center text-gray-500">
                  🎯 User Personas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 DevbrainAI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your ideas into deployed MVPs with AI-powered conversation
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
            <button 
              onClick={() => alert('Learn More: DevbrainAI helps founders and developers transform business ideas into working MVPs through AI-powered conversations, visual intelligence, and automated code generation.')}
              className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-lg border border-gray-300 transition duration-200"
            >
              Learn More
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-lg font-semibold mb-2">AI Conversation</h3>
              <p className="text-gray-600 text-sm">
                Describe your idea in plain English and get expert guidance
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Visual Intelligence</h3>
              <p className="text-gray-600 text-sm">
                See market analysis and user flows build in real-time
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">MCP Context</h3>
              <p className="text-gray-600 text-sm">
                Export development-ready packages for any platform
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <div>✅ Frontend: Running on port {window.location.port}</div>
            <div>✅ Backend: Running on port 3002</div>
            <div>✅ Using OpenAI GPT-4 for real AI responses</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;