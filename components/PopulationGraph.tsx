
import React from 'react';
import { ORGANISM_CONFIGS, GOLDEN_RATIO } from '../constants';
import type { OrganismType, GamePhase } from '../types';

interface PopulationGraphProps {
  gamePhase: GamePhase;
  populations: Record<OrganismType, number>;
  populationHistory?: Record<OrganismType, number>[];
  showTarget?: boolean;
}

const LINE_COLORS: Record<OrganismType, string> = {
  producer: '#22c55e', // green-500
  primary: '#eab308', // yellow-500
  secondary: '#ef4444', // red-500
  decomposer: '#8b5cf6', // violet-500
};

const MAX_Y_AXIS = 200;

const Legend: React.FC = () => (
    <div className="flex justify-center gap-3 mb-2 text-xs">
        {ORGANISM_CONFIGS.map(config => (
            <div key={config.id} className="flex items-center gap-1">
                <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: LINE_COLORS[config.id] }}
                ></div>
                <span className="text-gray-600 font-medium">{config.name}</span>
            </div>
        ))}
    </div>
);

const BarChart: React.FC<{ populations: Record<OrganismType, number>; showTarget?: boolean }> = ({ populations, showTarget }) => (
    <div className="flex-grow flex justify-around items-end gap-4 px-2 pb-2">
    {ORGANISM_CONFIGS.map(config => {
      const value = populations[config.id];
      const target = GOLDEN_RATIO[config.id];
      
      // Clamp bar height
      const clampedValue = Math.min(value, MAX_Y_AXIS * 1.2);
      const barHeight = `${(clampedValue / MAX_Y_AXIS) * 100}%`;
      const targetLineOffset = `${100 - (target / MAX_Y_AXIS) * 100}%`;

      return (
        <div key={config.id} className="h-full w-full flex flex-col items-center justify-end relative">
           <div className="w-full h-full flex items-end justify-center relative bg-gray-50/50 rounded-t-md">
             <div
               className="w-3/4 max-w-[40px] bg-gray-200 rounded-t-md relative graph-bar shadow-sm"
               style={{ 
                 height: barHeight,
                 backgroundColor: LINE_COLORS[config.id]
                }}
             ></div>
             {showTarget && (
                <div 
                    className="absolute w-full border-t-2 border-dashed border-gray-400/60"
                    style={{ top: targetLineOffset }}
                ></div>
             )}
           </div>
        </div>
      );
    })}
  </div>
);

const LineChart: React.FC<{ history: Record<OrganismType, number>[] }> = ({ history }) => {
    if (!history || history.length < 2) return <div className="w-full h-full flex items-center justify-center text-gray-500">데이터 로딩 중...</div>;

    const svgWidth = 400;
    const svgHeight = 150;
    const padding = 10;

    // Grid lines
    const gridLines = [];
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (svgHeight - 2 * padding);
        gridLines.push(
            <line 
                key={i} 
                x1={0} 
                y1={y} 
                x2={svgWidth} 
                y2={y} 
                stroke="#e5e7eb" 
                strokeWidth="1" 
            />
        );
    }

    const paths = (Object.keys(history[0]) as OrganismType[]).map(organism => {
        const points = history.map((snapshot, i) => {
            const x = (i / (history.length - 1)) * svgWidth;
            const rawY = snapshot[organism];
            // Dynamic scale clamping for display logic
            const clampedY = Math.min(rawY, 250); 
            const y = svgHeight - padding - (clampedY / 250) * (svgHeight - 2 * padding);
            return `${x},${y}`;
        }).join(' ');
        
        return (
            <polyline 
                key={organism} 
                points={points} 
                fill="none" 
                stroke={LINE_COLORS[organism]} 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
            />
        );
    });

    return (
        <div className="w-full h-full flex justify-center items-center bg-white/40 rounded-lg overflow-hidden relative">
             <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full">
                <rect width="100%" height="100%" fill="rgba(255,255,255,0.3)" />
                {gridLines}
                {paths}
            </svg>
        </div>
    );
}


const PopulationGraph: React.FC<PopulationGraphProps> = ({ gamePhase, populations, populationHistory = [], showTarget = false }) => {
  const isLineChartMode = gamePhase === 'simulating' || gamePhase === 'result';

  return (
    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl shadow-inner border border-gray-200/50 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-1 px-1">
        <h3 className="text-sm font-bold text-gray-700">
            {gamePhase === 'configuring' && "개체수 조정"}
            {(gamePhase === 'simulating' || gamePhase === 'result') && "생태계 변화 그래프"}
        </h3>
        {(gamePhase === 'simulating' || gamePhase === 'result') && <Legend />}
      </div>
      
      {isLineChartMode ? (
        <LineChart history={populationHistory} />
      ) : (
        <BarChart populations={populations} showTarget={showTarget} />
      )}
    </div>
  );
};

export default PopulationGraph;
