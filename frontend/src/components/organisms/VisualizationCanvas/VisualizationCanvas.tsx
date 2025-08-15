import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/utils';
import { Spinner } from '@/components/atoms/Spinner';
import type { VisualizationData, MarketAnalysisData, MarketOpportunity } from '@/types';

export interface VisualizationCanvasProps {
  data: VisualizationData | null;
  type: 'market-analysis' | 'user-journey' | 'competitive-matrix' | 'progress-chart' | 'feature-impact';
  interactive?: boolean;
  onDataPointClick?: (dataPoint: any) => void;
  className?: string;
  loading?: boolean;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  data,
  type,
  interactive = true,
  onDataPointClick,
  className,
  loading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle container resize
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render visualization when data or dimensions change
  useEffect(() => {
    if (!svgRef.current || !data || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    try {
      switch (type) {
        case 'market-analysis':
          renderMarketBubbleChart(svg, data.data as MarketAnalysisData, dimensions, {
            interactive,
            onDataPointClick
          });
          break;
        case 'user-journey':
          renderUserJourneyFlow(svg, data.data, dimensions, {
            interactive,
            onDataPointClick
          });
          break;
        case 'competitive-matrix':
          renderCompetitiveMatrix(svg, data.data, dimensions, {
            interactive,
            onDataPointClick
          });
          break;
        case 'progress-chart':
          renderProgressChart(svg, data.data, dimensions, {
            interactive,
            onDataPointClick
          });
          break;
        case 'feature-impact':
          renderFeatureImpact(svg, data.data, dimensions, {
            interactive,
            onDataPointClick
          });
          break;
      }
    } catch (error) {
      console.error('Error rendering visualization:', error);
    }
  }, [data, type, dimensions, interactive, onDataPointClick]);

  if (loading || !data) {
    return (
      <div
        ref={containerRef}
        className={cn("w-full h-full min-h-[400px] bg-white rounded-lg border flex items-center justify-center", className)}
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="text-gray-500 text-sm">
            {loading ? 'Generating visualization...' : 'No data available'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full min-h-[400px] bg-white rounded-lg border relative", className)}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      />
    </div>
  );
};

// Market Bubble Chart Implementation
function renderMarketBubbleChart(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: MarketAnalysisData,
  dimensions: { width: number; height: number },
  options: { interactive: boolean; onDataPointClick?: (dataPoint: any) => void }
) {
  const { width, height } = dimensions;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data.opportunities, d => d.competition) as [number, number])
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data.opportunities, d => d.growthRate) as [number, number])
    .range([innerHeight, 0])
    .nice();

  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(data.opportunities, d => d.marketSize) as [number, number])
    .range([15, 60]);

  const colorScale = d3.scaleOrdinal()
    .domain(data.opportunities.map(d => d.category))
    .range(d3.schemeSet3);

  // Container
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Grid lines
  g.selectAll(".grid-line-x")
    .data(xScale.ticks())
    .enter()
    .append("line")
    .attr("class", "grid-line-x")
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "#f0f0f0")
    .attr("stroke-width", 1);

  g.selectAll(".grid-line-y")
    .data(yScale.ticks())
    .enter()
    .append("line")
    .attr("class", "grid-line-y")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "#f0f0f0")
    .attr("stroke-width", 1);

  // Axes
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 40)
    .attr("fill", "#374151")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Competition Level");

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -innerHeight / 2)
    .attr("fill", "#374151")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Growth Rate (%)");

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "visualization-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "1000");

  // Bubbles
  const bubbles = g.selectAll(".bubble")
    .data(data.opportunities)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.competition))
    .attr("cy", d => yScale(d.growthRate))
    .attr("r", 0)
    .attr("fill", d => colorScale(d.category) as string)
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", options.interactive ? "pointer" : "default");

  // Animate bubble appearance
  bubbles.transition()
    .duration(1000)
    .delay((_, i) => i * 100)
    .attr("r", d => sizeScale(d.marketSize));

  // Interactive features
  if (options.interactive) {
    bubbles
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 4)
          .attr("opacity", 1);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);

        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Market Size: $${d.marketSize}M<br/>
          Growth Rate: ${d.growthRate}%<br/>
          Competition: ${d.competition}/10<br/>
          Category: ${d.category}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 2)
          .attr("opacity", 0.7);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        if (options.onDataPointClick) {
          options.onDataPointClick(d);
        }
      });
  }

  // Labels for largest opportunities
  const largestOpportunities = data.opportunities
    .sort((a, b) => b.marketSize - a.marketSize)
    .slice(0, 5);

  g.selectAll(".bubble-label")
    .data(largestOpportunities)
    .enter()
    .append("text")
    .attr("class", "bubble-label")
    .attr("x", d => xScale(d.competition))
    .attr("y", d => yScale(d.growthRate))
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "600")
    .style("fill", "white")
    .style("pointer-events", "none")
    .text(d => d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name)
    .style("opacity", 0)
    .transition()
    .delay((_, i) => i * 100 + 1200)
    .duration(500)
    .style("opacity", 1);

  // Legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 150}, 20)`);

  const categories = [...new Set(data.opportunities.map(d => d.category))];
  
  legend.selectAll(".legend-item")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (_, i) => `translate(0, ${i * 20})`)
    .each(function(d) {
      const item = d3.select(this);
      
      item.append("circle")
        .attr("r", 6)
        .attr("fill", colorScale(d) as string);
        
      item.append("text")
        .attr("x", 12)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "#374151")
        .text(d);
    });

  // Cleanup tooltip on component unmount
  return () => {
    tooltip.remove();
  };
}

// Placeholder implementations for other visualization types
function renderUserJourneyFlow(svg: any, data: any, dimensions: any, options: any) {
  // Implementation for user journey visualization
  console.log('User journey visualization not yet implemented');
}

function renderCompetitiveMatrix(svg: any, data: any, dimensions: any, options: any) {
  // Implementation for competitive matrix visualization
  console.log('Competitive matrix visualization not yet implemented');
}

function renderProgressChart(svg: any, data: any, dimensions: any, options: any) {
  // Implementation for progress chart visualization
  console.log('Progress chart visualization not yet implemented');
}

function renderFeatureImpact(svg: any, data: any, dimensions: any, options: any) {
  // Implementation for feature impact visualization
  console.log('Feature impact visualization not yet implemented');
}

VisualizationCanvas.displayName = 'VisualizationCanvas';

export { VisualizationCanvas };