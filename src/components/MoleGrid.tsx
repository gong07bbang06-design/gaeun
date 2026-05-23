/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Award, CheckCircle, HelpCircle, Gamepad2 } from 'lucide-react';
import { Mole, Question, PlayerRole, GameStatus, LearningCategory } from '../types.ts';

interface MoleGridProps {
  moles: Mole[];
  currentQuestion: Question | null;
  gameStatus: GameStatus;
  role: PlayerRole;
  gameMode: 'COOP' | 'VERSUS';
  category: LearningCategory;
  isReady: boolean;
  peerReady: boolean;
  hostScore: number;
  clientScore: number;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  whackEffects: { id: number; index: number; text: string; isCorrect: boolean }[];
  onWhack: (index: number, clickerRole: PlayerRole) => void;
  onStartGame: () => void;
  onToggleReady: () => void;
  onUpdateSettings: (cat: LearningCategory, mode: 'COOP' | 'VERSUS') => void;
  onDisconnect: () => void;
  panelOwner: PlayerRole; // To distinguish between Host/Client boards in split views
}

export default function MoleGrid({
  moles,
  currentQuestion,
  gameStatus,
  role,
  gameMode,
  category,
  isReady,
  peerReady,
  hostScore,
  clientScore,
  connectionStatus,
  whackEffects,
  onWhack,
  onStartGame,
  onToggleReady,
  onUpdateSettings,
  onDisconnect,
  panelOwner,
}: MoleGridProps) {
  
  // Decide if this specific board panel can click/whack
  // Inside single-screen mode, whoever is active whacks.
  // In split-screen mode, we want the Host board to be clickable only by Host, and Client board by Client.
  const isInteractionAllowed = gameStatus === 'PLAYING';

  // Handle whacking
  const handleMoleClick = (index: number) => {
    if (!isInteractionAllowed) return;
    onWhack(index, panelOwner);
  };

  return (
    <div id={`mole-board-${panelOwner.toLowerCase()}`} className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] p-6 shadow-2xl relative overflow-hidden backdrop-blur">
      
      {/* 🔮 Background Accent Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 📚 1. Top Question Banner: "[배울 내용]" Display */}
      <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 mb-6 relative">
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold tracking-wider">
          💡 배울 내용 (TODAY'S TOPIC)
        </span>
        
        {gameStatus === 'PLAYING' && currentQuestion ? (
          <div className="text-center pt-2 space-y-1">
            <p className="text-xs text-slate-500 font-mono font-bold tracking-wide">
              Q. 알맞은 두더지 정답을 찾아 수확하세요!
            </p>
            <h4 className="text-lg font-extrabold text-amber-300 tracking-tight leading-snug">
              {currentQuestion.prompt}
            </h4>
          </div>
        ) : gameStatus === 'FINISHED' ? (
          <div className="text-center pt-2">
            <h4 className="text-base font-extrabold text-teal-400">
              ⏱️ 학습 게임이 안전하게 종료되었습니다!
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              아래 점수 보드를 확인하고 결과 리뷰를 나누세요.
            </p>
          </div>
        ) : (
          <div className="text-center pt-2 space-y-1">
            <h4 className="text-base font-extrabold text-slate-300">
              🎮 대기실에서 게임 시작 신호를 기다리고 있습니다
            </h4>
            <p className="text-xs text-slate-400">
              {panelOwner === 'HOST' 
                ? '학습 주제와 대결 방식을 고른 뒤 게임을 발령하세요.' 
                : '준비를 마치고 선생님이 게임을 시작하길 기다리세요.'}
            </p>
          </div>
        )}
      </div>

      {/* 🕹️ 2. Core Game Canvas: 3x3 Mole Holes Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto aspect-square bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-inner relative">
        
        {moles.map((mole, idx) => {
          // If game is in Lobby, render 2 cute moles with Academic preview glasses for visual aesthetic pop!
          const showLobbyPreview = gameStatus === 'LOBBY' && (idx === 2 || idx === 6);
          const isPopUp = mole.active || showLobbyPreview;
          const moleText = showLobbyPreview 
            ? (idx === 2 ? 'Let\'s Go!' : '정답 두더지') 
            : mole.content;
          const isCorrectAnswer = showLobbyPreview ? (idx === 6) : mole.isCorrect;

          return (
            <div 
              key={idx} 
              className="relative w-full aspect-square flex items-end justify-center rounded-full bg-slate-950 border-4 border-slate-800/90 shadow-[inset_0_10px_24px_rgba(0,0,0,0.92)] overflow-hidden group"
            >
              {/* Ground Soil hole rim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none rounded-full" />
              
              {/* Mole character rendering */}
              <AnimatePresence>
                {isPopUp && (
                  <motion.button
                    type="button"
                    initial={{ y: 90, scale: 0.8 }}
                    animate={{ 
                      y: 0, 
                      scale: 1,
                      transition: { type: 'spring', stiffness: 290, damping: 14 }
                    }}
                    exit={{ y: 90, scale: 0.8, transition: { duration: 0.12 } }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleMoleClick(idx)}
                    disabled={!isInteractionAllowed && !showLobbyPreview}
                    className="absolute bottom-0 w-[84%] h-[82%] rounded-t-full bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 border-t-4 border-amber-300 border-x-2 border-x-amber-700 cursor-pointer flex flex-col items-center justify-start pt-1 focus:outline-none select-none overflow-hidden hover:from-amber-400 hover:to-amber-700 transition-colors shadow-2xl"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {/* Cute academic glasses frame */}
                    <div className="w-7 h-3 flex justify-between gap-0.5 mt-1 px-1 relative z-10 scale-90">
                      <div className="w-3 h-3 rounded-full border border-slate-950 bg-slate-100/40 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-slate-950" />
                      </div>
                      <div className="h-0.5 w-1 bg-slate-950 mt-1" />
                      <div className="w-3 h-3 rounded-full border border-slate-950 bg-slate-100/40 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-slate-950" />
                      </div>
                    </div>

                    {/* Pink Cheeks & Cute Nose */}
                    <div className="flex gap-3 -mt-0.5 relative z-10 w-full justify-center scale-90">
                      <div className="w-1 h-1 rounded-full bg-rose-400" />
                      <div className="w-2 h-1 rounded-full bg-pink-500" />
                      <div className="w-1 h-1 rounded-full bg-rose-400" />
                    </div>

                    {/* Educational Academic Cap (Teacher/Smart Mole look!) */}
                    {isCorrectAnswer && (
                      <div className="absolute top-0 w-full flex justify-center -mt-1 pointer-events-none">
                        <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded-full border border-slate-950 shadow scale-90">
                          정답 ★
                        </span>
                      </div>
                    )}

                    {/* Word / Answer plate card overlay on Mole */}
                    <div className="absolute inset-x-1 bottom-1 bg-slate-950/95 hover:bg-slate-950 text-[10px] sm:text-[11px] text-slate-100 font-extrabold p-1 rounded-lg border border-slate-800 text-center shadow whitespace-pre-wrap leading-tight select-none z-10">
                      {moleText}
                    </div>

                  </motion.button>
                )}
              </AnimatePresence>

              {/* Whack score pop-up animations (+10, -5 float effect on target hole) */}
              <AnimatePresence>
                {whackEffects
                  .filter(eff => eff.index === idx)
                  .map(eff => (
                    <motion.div
                      key={eff.id}
                      initial={{ opacity: 0, y: 10, scale: 0.6 }}
                      animate={{ opacity: 1, y: -50, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      className={`absolute z-30 font-black font-mono text-lg pointer-events-none drop-shadow-md px-2 py-0.5 rounded-full border shadow-lg ${
                        eff.isCorrect 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500' 
                          : 'bg-red-950 text-red-300 border-red-500'
                      }`}
                    >
                      {eff.text}
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Hole label shadow */}
              <div className="absolute bottom-0 w-full h-2.5 bg-slate-950/40 rounded-full pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* 🚦 3. Lobby Control panel & Status buttons */}
      <div className="mt-6 border-t border-slate-800/80 pt-5">
        {gameStatus === 'LOBBY' ? (
          <div>
            {panelOwner === 'HOST' ? (
              /* Host Options for Game Topics */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold block">1. 과목(학습 카테고리)</label>
                    <select
                      value={category}
                      onChange={(e) => onUpdateSettings(e.target.value as LearningCategory, gameMode)}
                      className="w-full bg-slate-950 border border-slate-700 font-medium text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    >
                      <option value={LearningCategory.ENGLISH}>📚 영어 반대말 매칭</option>
                      <option value={LearningCategory.MATH}>🧮 수학 암산구구단</option>
                      <option value={LearningCategory.SCIENCE}>🧪 과학 및 상식 퀴즈</option>
                    </select>
                  </div>

                  {/* Mode select */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold block">2. 대결 진행 방식</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => onUpdateSettings(category, 'COOP')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${gameMode === 'COOP' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                      >
                        👥 협동 모드
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings(category, 'VERSUS')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${gameMode === 'VERSUS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                      >
                        ⚔️ 경쟁 모드
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status messages & Launch button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800 mt-2">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block font-bold">인게임 로비 대기 상태</span>
                    <span className="text-[11px] text-slate-500">
                      {connectionStatus === 'CONNECTED' 
                        ? (peerReady ? '🟢 상대방이 준비를 완료했습니다!' : '⚪ 상대방의 준비 상태를 대기하고 있습니다.') 
                        : '💡 호스트 단독 플레이 또는 P2P 연결 수신 상태'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onStartGame}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4" /> 학습 게임 발령!
                  </button>
                </div>
              </div>
            ) : (
              /* Client Ready panel */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="text-left">
                  <span className="text-xs text-slate-400 block font-bold">학생(Client) 인게임 준비</span>
                  <p className="text-[11px] text-slate-500">
                    선생님이 게임을 발령해 두더지들을 깨울 수 있도록 대기 신호를 켜세요!
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onToggleReady}
                    className={`px-5 py-2 rounded-xl text-xs font-bold shadow transition-all transform active:scale-95 whitespace-nowrap ${
                      isReady 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-emerald-100' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {isReady ? '준비 해제하기 🟢' : '준비 완료하기 (Ready)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : gameStatus === 'PLAYING' ? (
          /* Playing score status check */
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>현재 활성화된 질문에 포함된 단어를 수확하세요!</span>
            </span>
            <span className="font-mono text-amber-500 font-bold">
              {category === LearningCategory.ENGLISH && 'ENGLISH MATCHING'}
              {category === LearningCategory.MATH && 'MATH COUNT'}
              {category === LearningCategory.SCIENCE && 'SCIENCE TRIVIA'}
            </span>
          </div>
        ) : (
          /* Finished summary view */
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-amber-500 uppercase font-black block tracking-wider mb-2">🏆 GAME HIGHLIGHT SCOREBOARD</span>
              
              <div className="flex justify-around items-center py-2">
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">선생님 (Host)</span>
                  <span className="text-2xl font-mono font-black text-amber-400">{hostScore}</span>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="text-center animate-bounce">
                  <span className="text-xs text-teal-300 font-bold block">🥇 승자</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {gameMode === 'COOP' ? '모두가 승리!' : (hostScore > clientScore ? '선생님 👑' : hostScore < clientScore ? '학생 👑' : '무승부 🤝')}
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">학생 (Client)</span>
                  <span className="text-2xl font-mono font-black text-cyan-400">{clientScore}</span>
                </div>
              </div>
            </div>

            {panelOwner === 'HOST' ? (
              <button
                type="button"
                onClick={onStartGame}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
              >
                <RotateCcw className="w-4 h-4" /> 같은 설정으로 게임 재시작하기
              </button>
            ) : (
              <div className="text-center text-xs text-slate-500 font-medium">
                호스트가 새로운 게임을 발령하거나 대기실로 되돌릴 때까지 잠시만 대기하십시오.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
