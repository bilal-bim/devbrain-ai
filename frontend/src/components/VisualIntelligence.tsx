import React from 'react';

interface MarketData {
  tam?: number;
  growth?: number;
  segments?: Array<{name: string; value: number}>;
}

interface Persona {
  name: string;
  size: string;
  avgIncome: string;
  painPoint: string;
  percentage: number;
}

interface Competitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
}

interface VisualIntelligenceProps {
  stage: string;
  marketData?: MarketData;
  personas?: Persona[];
  competitors?: Competitor[];
  selectedPersona?: string;
}

export const VisualIntelligence: React.FC<VisualIntelligenceProps> = ({
  stage,
  marketData,
  personas,
  competitors,
  selectedPersona
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      
      {/* Market Analysis */}
      {stage === 'idea_capture' && marketData && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💰</span> Market Analysis
          </h4>
          
          {marketData.tam && (
            <div className="mb-4">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(marketData.tam)}
              </div>
              <div className="text-sm text-gray-500">Total Addressable Market</div>
            </div>
          )}
          
          {marketData.growth && (
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold text-green-600">
                  {marketData.growth}%
                </span>
                <span className="ml-2 text-sm text-gray-500">Annual Growth</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{width: `${Math.min(marketData.growth * 2, 100)}%`}}
                />
              </div>
            </div>
          )}
          
          {marketData.segments && marketData.segments.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Market Segments</div>
              {marketData.segments.map((segment, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-sm">{segment.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(segment.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* User Personas */}
      {stage === 'persona_discovery' && personas && personas.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🎯</span> Target Personas
          </h4>
          
          <div className="space-y-3">
            {personas.map((persona, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedPersona === persona.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-800">{persona.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Size: {persona.size}</div>
                  <div>Avg Income: {persona.avgIncome}</div>
                  <div className="mt-2">
                    <span className="text-red-600 font-medium">{persona.percentage}%</span>
                    <span className="ml-1">{persona.painPoint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Competitive Landscape */}
      {stage === 'competitive_analysis' && competitors && competitors.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🏆</span> Competitive Landscape
          </h4>
          
          <div className="space-y-3">
            {competitors.map((comp, idx) => (
              <div key={idx} className="pb-3 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-800">{comp.name}</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {comp.marketShare}% share
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <span className="text-green-600">✓</span> {comp.strengths.join(', ')}
                  </div>
                  <div className="mb-1">
                    <span className="text-red-600">✗</span> {comp.weaknesses.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">Pricing: {comp.pricing}</div>
                </div>
                
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{width: `${comp.marketShare}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800">Market Opportunity</div>
            <div className="text-xs text-green-600 mt-1">
              Mobile-first, design-focused solution for creative freelancers
            </div>
          </div>
        </div>
      )}
      
      {/* Default State */}
      {!marketData && !personas && !competitors && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm text-gray-600">
              Visual insights will appear here as you describe your idea
            </p>
          </div>
        </div>
      )}
    </div>
  );
};