import React from 'react';

interface InteractiveOption {
  text: string;
  value: string;
  icon?: string;
  description?: string;
}

interface InteractiveMessageProps {
  content: string;
  options?: InteractiveOption[];
  onOptionClick?: (value: string) => void;
  segments?: Array<{
    name: string;
    size: string;
    avgIncome: string;
    painPoint: string;
    percentage: number;
    icon: string;
  }>;
  competitors?: Array<{
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
    pricing: string;
  }>;
  features?: {
    mustHave: string[];
    niceToHave: string[];
  };
  techStack?: {
    frontend: string;
    backend: string;
    database: string;
    payments: string;
  };
}

export const InteractiveMessage: React.FC<InteractiveMessageProps> = ({
  content,
  options,
  onOptionClick,
  segments,
  competitors,
  features,
  techStack
}) => {
  // Parse content for special formatting
  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Highlight headers with emojis
      if (line.includes('💰') || line.includes('🎯') || line.includes('🏆') || line.includes('🚀') || line.includes('📋')) {
        return (
          <div key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {line}
          </div>
        );
      }
      
      // Format bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="ml-4 text-gray-700 mb-1">
            {line}
          </div>
        );
      }
      
      // Format numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={idx} className="ml-4 text-gray-700 mb-1">
            {line}
          </div>
        );
      }
      
      // Regular text
      return line.trim() ? (
        <div key={idx} className="text-gray-700 mb-2">
          {line}
        </div>
      ) : null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Main content */}
      <div>{renderContent()}</div>
      
      {/* Interactive User Segments */}
      {segments && segments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {segments.map((segment, idx) => (
            <button
              key={idx}
              onClick={() => onOptionClick?.(segment.name)}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{segment.icon}</span>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  {segment.size}
                </span>
              </div>
              <div className="font-semibold text-gray-900 mb-1">{segment.name}</div>
              <div className="text-sm text-gray-600 mb-2">Avg: {segment.avgIncome}</div>
              <div className="text-xs">
                <span className="text-red-600 font-bold">{segment.percentage}%</span>
                <span className="text-gray-600 ml-1">{segment.painPoint}</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to select this segment →
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Competitive Landscape Cards */}
      {competitors && competitors.length > 0 && (
        <div className="space-y-3 mt-4">
          {competitors.map((comp, idx) => (
            <div key={idx} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-lg font-semibold text-gray-900">{comp.name}</span>
                  <div className="text-sm text-gray-500 mt-1">{comp.pricing}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{comp.marketShare}%</div>
                  <div className="text-xs text-gray-500">market share</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium text-green-700 mb-1">Strengths</div>
                  {comp.strengths.map((s, i) => (
                    <div key={i} className="text-xs text-gray-600">✓ {s}</div>
                  ))}
                </div>
                <div>
                  <div className="font-medium text-red-700 mb-1">Weaknesses</div>
                  {comp.weaknesses.map((w, i) => (
                    <div key={i} className="text-xs text-gray-600">✗ {w}</div>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{width: `${comp.marketShare}%`}}
                />
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
            <div className="font-semibold text-green-800 mb-1">🎯 Market Opportunity</div>
            <div className="text-sm text-green-700">
              Position as a mobile-first, design-focused solution in the underserved segment
            </div>
          </div>
        </div>
      )}
      
      {/* MVP Features Cards */}
      {features && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="text-xl mr-2">⭐</span> Must-Have Features
            </div>
            {features.mustHave.map((feature, idx) => (
              <div key={idx} className="flex items-start mb-2">
                <span className="text-blue-600 mr-2">▸</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="font-semibold text-purple-900 mb-3 flex items-center">
              <span className="text-xl mr-2">✨</span> Nice-to-Have Features
            </div>
            {features.niceToHave.map((feature, idx) => (
              <div key={idx} className="flex items-start mb-2">
                <span className="text-purple-600 mr-2">▸</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tech Stack Visual */}
      {techStack && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 text-white mt-4">
          <div className="font-semibold mb-3">🛠 Technical Stack</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Frontend</div>
              <div className="bg-blue-600 rounded px-2 py-1 text-sm font-medium">{techStack.frontend}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Backend</div>
              <div className="bg-green-600 rounded px-2 py-1 text-sm font-medium">{techStack.backend}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Database</div>
              <div className="bg-purple-600 rounded px-2 py-1 text-sm font-medium">{techStack.database}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Payments</div>
              <div className="bg-yellow-600 rounded px-2 py-1 text-sm font-medium">{techStack.payments}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Action Options */}
      {options && options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionClick?.(option.value)}
              className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center mb-1">
                {option.icon && <span className="text-xl mr-2">{option.icon}</span>}
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {option.text}
                </span>
              </div>
              {option.description && (
                <div className="text-xs text-gray-500">{option.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};