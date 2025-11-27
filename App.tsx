
import React, { useState, useCallback, useRef } from 'react';
import ResultModal from './components/ResultModal';
import EcosystemVisualizer from './components/EcosystemVisualizer';
import PopulationGraph from './components/PopulationGraph';
import IntroScreen from './components/IntroScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import OrganismControl from './components/OrganismControl';
import EventNotification from './components/EventNotification';
import GameManual from './components/GameManual';
import { ORGANISM_CONFIGS, GOLDEN_RATIO, SUCCESS_TOLERANCE } from './constants';
import type { OrganismType, GameStatus, GamePhase, SimulationEvent, GameMode } from './types';

// Modified: Not the golden ratio anymore. User must find it.
const INITIAL_POPULATIONS: Record<OrganismType, number> = {
  producer: 50,
  primary: 30,
  secondary: 10,
  decomposer: 20,
};

const ZERO_POPULATIONS: Record<OrganismType, number> = {
  producer: 0,
  primary: 0,
  secondary: 0,
  decomposer: 0,
};

const NORMAL_DURATION = 10000; // 10 seconds for normal mode
const HARD_DURATION = 20000;   // 20 seconds for hard mode
const SIMULATION_STEPS = 100; 

function App() {
  const [populations, setPopulations] = useState<Record<OrganismType, number>>(ZERO_POPULATIONS);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [resultStatus, setResultStatus] = useState<GameStatus>('playing');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [populationHistory, setPopulationHistory] = useState<Record<OrganismType, number>[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [showManual, setShowManual] = useState(false);
  
  // New state to track if user has failed at least once
  const [hasFailed, setHasFailed] = useState(false);
  
  const simulationInterval = useRef<number | null>(null);
  const eventTimeout = useRef<number | null>(null);

  const handlePopulationChange = useCallback((organism: OrganismType, value: number) => {
    if (gamePhase === 'configuring') {
      setPopulations(prev => ({ ...prev, [organism]: value }));
    }
  }, [gamePhase]);

  const startSimulation = () => {
    setGamePhase('simulating');
    setCurrentEvent(null);
    
    const initialSnapshot = { ...populations };
    const history: Record<OrganismType, number>[] = [initialSnapshot];
    setPopulationHistory(history);

    let step = 0;
    let disasterHasOccurred = false;

    // Set duration based on game mode
    const duration = gameMode === 'normal' ? NORMAL_DURATION : HARD_DURATION;

    simulationInterval.current = window.setInterval(() => {
      step++;
      // Get previous state
      const prev = history[history.length - 1];
      
      // Use floating point for calculation
      let P = prev.producer;
      let C1 = prev.primary;
      let C2 = prev.secondary;
      let D = prev.decomposer;
      
      // --- Disaster Event Logic (Only in Hard Mode) ---
      // DIFFICULTY TUNING: Stop disasters after 70% to allow recovery.
      if (gameMode === 'hard' && !disasterHasOccurred && step > SIMULATION_STEPS * 0.2 && step < SIMULATION_STEPS * 0.7) {
         if (Math.random() < 0.05) { // 5% chance per step in the danger window
             disasterHasOccurred = true;
             const rand = Math.random();
             let event: SimulationEvent;

             // Reduced penalties for better playability
             if (rand < 0.25) {
                 event = { type: 'drought', name: '극심한 가뭄', description: '비가 오지 않아 식물이 말라 죽습니다!' };
                 P = Math.floor(P * 0.85); // 15% loss
             } else if (rand < 0.5) {
                 event = { type: 'flood', name: '대홍수 발생', description: '불어난 물이 지표면을 휩쓸고 지나갑니다!' };
                 P = Math.floor(P * 0.9); 
                 D = Math.floor(D * 0.8);
             } else if (rand < 0.75) {
                 event = { type: 'typhoon', name: '강력한 태풍', description: '강풍이 생태계 전체를 강타합니다!' };
                 P = Math.floor(P * 0.9);
                 C1 = Math.floor(C1 * 0.9);
                 C2 = Math.floor(C2 * 0.95);
             } else {
                 event = { type: 'invasive', name: '외래종 유입', description: '천적이 없는 외래종이 토종 생물을 위협합니다!' };
                 C1 = Math.floor(C1 * 0.85);
                 C2 = Math.floor(C2 * 0.95);
             }

             setCurrentEvent(event);
             if (eventTimeout.current) clearTimeout(eventTimeout.current);
             eventTimeout.current = window.setTimeout(() => setCurrentEvent(null), 4000);
         }
      }

      // --- SIMULATION LOGIC ---
      
      // 1. Producer
      const pGrowth = 0.2 * P * (1 - P / 500);
      const pLoss = 0.32 * C1;
      const dP = pGrowth - pLoss;

      // 2. Primary Consumer
      const c1Growth = 0.1 * C1 * (P / 100); 
      const c1Loss = 0.5 * C2;
      const dC1 = c1Growth - c1Loss;

      // 3. Secondary Consumer
      const c2Growth = 0.1 * C2 * (C1 / 50);
      const c2Death = 0.1 * C2;
      const dC2 = c2Growth - c2Death;

      // 4. Decomposer
      const targetD = (P + C1 + C2) * 0.15;
      const dD = (targetD - D) * 0.1;

      // Apply changes
      P += dP;
      C1 += dC1;
      C2 += dC2;
      D += dD;

      // Construct new state
      const newPopulations = {
        producer: Math.max(0, Math.min(500, Math.round(P))),
        primary: Math.max(0, Math.min(300, Math.round(C1))),
        secondary: Math.max(0, Math.min(100, Math.round(C2))),
        decomposer: Math.max(0, Math.min(200, Math.round(D))),
      };

      setPopulations(newPopulations);
      history.push(newPopulations);
      setPopulationHistory([...history]);

      if (step >= SIMULATION_STEPS) {
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        setGamePhase('result');
        setCurrentEvent(null);

        // Check Success Logic
        const hasExtinction = 
            newPopulations.producer <= 5 || 
            newPopulations.primary <= 5 || 
            newPopulations.secondary <= 1;

        let isSuccess = false;

        if (gameMode === 'hard') {
            // HARD MODE WIN CONDITION: SURVIVAL IS VICTORY
            // If nothing went extinct, you win regardless of the exact ratio.
            if (!hasExtinction) {
                isSuccess = true;
                setFeedbackMessage("대재앙 속에서도 생태계가 살아남았습니다! 끈질긴 생명력의 승리입니다.");
            } else {
                isSuccess = false;
            }
        } else {
            // NORMAL MODE WIN CONDITION: BALANCE
            const finalTotalDiff = 
                Math.abs(newPopulations.producer - GOLDEN_RATIO.producer) +
                Math.abs(newPopulations.primary - GOLDEN_RATIO.primary) +
                Math.abs(newPopulations.secondary - GOLDEN_RATIO.secondary);
            
            if (!hasExtinction && finalTotalDiff <= SUCCESS_TOLERANCE * 2) {
                isSuccess = true;
                setFeedbackMessage("완벽합니다! 모든 생물이 조화롭게 공존하고 있습니다.");
            }
        }

        if (isSuccess) {
            setResultStatus('success');
        } else {
            setResultStatus('failure');
            setHasFailed(true);
            
            // Failure Feedback
            if (newPopulations.producer <= 5) {
                setFeedbackMessage("실패: 풀이 멸종했습니다. 기후 위기 때는 생산자를 더 많이 심어 대비하세요.");
            } else if (newPopulations.primary <= 5) {
                setFeedbackMessage("실패: 토끼가 멸종했습니다. 여우가 너무 많거나 먹이가 부족했습니다.");
            } else if (newPopulations.secondary <= 1) {
                setFeedbackMessage("실패: 여우가 굶어 죽었습니다. 먹이사슬 기초가 튼튼해야 합니다.");
            } else {
                setFeedbackMessage(`균형이 무너졌습니다. ${gameMode === 'hard' ? '기후 위기 모드에서는 멸종하지 않는 것이 목표입니다.' : '생산자 > 1차 > 2차 소비자 순서의 피라미드를 기억하세요.'}`);
            }
        }
      }
    }, duration / SIMULATION_STEPS);
  };

  const handleRetry = useCallback(() => {
    if (resultStatus === 'success') {
        setPopulations(INITIAL_POPULATIONS);
        setResultStatus('playing');
        setFeedbackMessage('');
        setPopulationHistory([]);
        setCurrentEvent(null);
        setGamePhase('intro');
        setHasFailed(false);
    } else {
        setResultStatus('playing');
        setFeedbackMessage('');
        setPopulationHistory([]);
        setCurrentEvent(null);
        setGamePhase('configuring');
    }
  }, [resultStatus]);

  const handleIntroStart = useCallback(() => {
    setGamePhase('mode-select');
  }, []);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setPopulations(INITIAL_POPULATIONS);
    setGamePhase('configuring');
    setHasFailed(false);
  }, []);

  if (gamePhase === 'intro') {
    return <IntroScreen onStart={handleIntroStart} />;
  }
  
  if (gamePhase === 'mode-select') {
    return <ModeSelectionScreen onSelectMode={handleModeSelect} />;
  }

  const isUIActive = gamePhase === 'configuring';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 flex items-center justify-center p-4 lg:p-6 transition-colors duration-1000">
      <GameManual isOpen={showManual} onClose={() => setShowManual(false)} />

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto h-[90vh] relative">
        {/* Visualizer Section */}
        <div className="w-full h-full min-h-[300px] lg:min-h-0 relative">
           <EventNotification event={currentEvent} />
           <EcosystemVisualizer populations={populations} currentEvent={currentEvent} />
           
           <div className="absolute top-2 right-2 flex gap-2 z-20">
             {gameMode === 'hard' && (
               <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md font-bold flex items-center gap-1">
                  🔥 기후 위기 모드 (생존 목표)
               </div>
             )}
             {gameMode === 'normal' && (
               <div className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md font-bold flex items-center gap-1">
                  🌿 평화 모드 (균형 목표)
               </div>
             )}
           </div>
        </div>
        
        {/* Controls Section */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/60 flex flex-col gap-4 h-full relative">
          
          <button 
            onClick={() => setShowManual(true)}
            className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
          >
            📘 매뉴얼
          </button>

          <div className="space-y-4 flex-shrink-0 mt-6">
            {ORGANISM_CONFIGS.map(config => (
              <OrganismControl
                key={config.id}
                config={config}
                value={populations[config.id]}
                onChange={(value) => handlePopulationChange(config.id, value)}
                disabled={!isUIActive}
              />
            ))}
          </div>
          <div className="flex-grow min-h-0"> 
            <PopulationGraph 
                gamePhase={gamePhase} 
                populations={populations} 
                populationHistory={populationHistory}
                showTarget={hasFailed} 
            />
          </div>
          <button
            onClick={startSimulation}
            disabled={!isUIActive}
            className="w-full bg-emerald-600 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:scale-100 disabled:hover:scale-100 flex-shrink-0"
          >
            {isUIActive ? "시뮬레이션 시작" : "생태계 변화 관찰 중..."}
          </button>
        </div>
      </main>
      
      {gamePhase === 'result' && (
        <ResultModal 
          status={resultStatus} 
          onRetry={handleRetry} 
          feedback={feedbackMessage}
          populationHistory={populationHistory}
          populations={populations}
          gameMode={gameMode} // Pass game mode to show specific tips
        />
      )}
    </div>
  );
}

export default App;
