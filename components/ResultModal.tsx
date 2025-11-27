
import React from 'react';
import PopulationGraph from './PopulationGraph';
import type { OrganismType, GameStatus, GameMode } from '../types';
import { GOLDEN_RATIO } from '../constants';

interface ResultModalProps {
  status: GameStatus;
  onRetry: () => void;
  feedback: string;
  populationHistory: Record<OrganismType, number>[];
  populations: Record<OrganismType, number>;
  gameMode?: GameMode;
}

const ResultModal: React.FC<ResultModalProps> = ({ status, onRetry, feedback, populationHistory, populations, gameMode }) => {
  const isSuccess = status === 'success';

  // Common styles
  const backdropStyle = "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn";
  const modalBaseStyle = "bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full text-center transition-all duration-300 transform scale-100";
  const modalStyle = isSuccess ? `${modalBaseStyle} max-w-md` : `${modalBaseStyle} max-w-3xl`;
  const buttonStyle = "w-full sm:w-auto bg-emerald-600 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300";

  const successContent = {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto animate-bounce" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    title: "성공!",
    message: gameMode === 'hard' ? "생존에 성공했습니다! 재난을 이겨낸 견고한 생태계입니다." : "완벽한 황금 밸런스입니다! 생태계가 안정적으로 유지됩니다.",
  };

  const failureContent = {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto animate-pulse" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    title: "실패...",
    message: gameMode === 'hard' ? "일부 종이 멸종하여 생태계가 파괴되었습니다." : "생태계의 균형이 무너졌습니다.",
  };

  const content = isSuccess ? successContent : failureContent;
  
  return (
    <div className={backdropStyle}>
      <div className={modalStyle}>
        <div className="mb-6">
          {content.icon}
          <h2 className="text-4xl font-extrabold text-gray-800 mt-4">{content.title}</h2>
          <p className="text-lg text-gray-600 mt-2">{content.message}</p>
        </div>

        {!isSuccess && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg text-left h-full flex flex-col justify-center">
              <h3 className="font-bold text-red-950 mb-2">💡 분석 결과</h3>
              <p className="text-gray-900 text-sm mb-4 font-medium">{feedback}</p>
              
              <div className="mt-auto pt-4 border-t border-red-200">
                <h4 className="font-bold text-gray-900 text-sm mb-2">
                    {gameMode === 'hard' ? "🔥 기후 위기 생존 권장 비율 (팁)" : "🔑 황금 비율 정답 공개"}
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded shadow-sm border border-red-100">
                        <span className="block font-bold text-green-700">생산자</span>
                        <span className="font-bold text-gray-900">{gameMode === 'hard' ? "120+" : GOLDEN_RATIO.producer}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm border border-red-100">
                        <span className="block font-bold text-yellow-700">1차</span>
                        <span className="font-bold text-gray-900">{gameMode === 'hard' ? "40~50" : GOLDEN_RATIO.primary}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm border border-red-100">
                        <span className="block font-bold text-red-700">2차</span>
                        <span className="font-bold text-gray-900">{GOLDEN_RATIO.secondary}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm border border-red-100">
                        <span className="block font-bold text-purple-700">분해자</span>
                        <span className="font-bold text-gray-900">{GOLDEN_RATIO.decomposer}</span>
                    </div>
                </div>
                {gameMode === 'hard' && (
                    <p className="text-xs text-red-700 mt-2 font-bold">
                        ※ 재난에 대비해 생산자를 넉넉히 준비하세요!
                    </p>
                )}
              </div>
            </div>
            
            <div className="h-64 w-full">
               <PopulationGraph 
                    gamePhase="result"
                    populations={populations}
                    populationHistory={populationHistory}
                    showTarget={gameMode === 'normal'} // Hide target line in hard mode as it might be misleading
                />
            </div>
          </div>
        )}

        <div className="mt-8">
          <button onClick={onRetry} className={buttonStyle}>
            {isSuccess ? "처음으로 돌아가기" : "다시 조정하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
