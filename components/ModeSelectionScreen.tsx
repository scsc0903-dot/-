
import React from 'react';
import type { GameMode } from '../types';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-4xl w-full border border-emerald-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
          모드 선택
        </h2>
        <p className="text-gray-600 mb-8">
          원하는 시뮬레이션 난이도를 선택하세요.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normal Mode */}
          <button 
            onClick={() => onSelectMode('normal')}
            className="group relative overflow-hidden bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🌿</span>
              <h3 className="text-2xl font-bold text-blue-800 mb-2">평화 모드</h3>
              <p className="text-blue-700/80 text-sm leading-relaxed">
                외부 재난 없이 안정적인 환경에서 생태계 균형을 맞춥니다. 
                <br/>
                <strong>초보자에게 추천합니다.</strong>
              </p>
            </div>
          </button>

          {/* Hard Mode */}
          <button 
            onClick={() => onSelectMode('hard')}
            className="group relative overflow-hidden bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-200 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🔥</span>
              <h3 className="text-2xl font-bold text-red-800 mb-2">기후 위기 모드</h3>
              <p className="text-red-700/80 text-sm leading-relaxed">
                가뭄, 산불, 전염병 등 예측 불가능한 재난이 닥쳐옵니다.
                <br/>
                <strong>진정한 도전을 원하시나요?</strong>
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionScreen;
