/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Users, 
  LogOut, 
  ChevronRight,
  School
} from 'lucide-react';
import { usePeerGame } from './hooks/usePeerGame.ts';
import NetworkStatus from './components/NetworkStatus.tsx';
import StatsBanner from './components/StatsBanner.tsx';
import MoleGrid from './components/MoleGrid.tsx';
import { LearningCategory } from './types.ts';

export default function App() {
  const {
    role,
    setRole,
    category,
    setCategory,
    gameMode,
    setGameMode,
    gameStatus,
    setGameStatus,
    hostScore,
    setHostScore,
    clientScore,
    setClientScore,
    timeLeft,
    setTimeLeft,
    currentQuestion,
    setCurrentQuestion,
    moles,
    setMoles,
    myRoomCode,
    targetRoomCode,
    setTargetRoomCode,
    connectionStatus,
    setConnectionStatus,
    isReady,
    peerReady,
    toggleReady,
    updateLobbySettings,
    startGame,
    advanceQuestion,
    whackMole,
    connectToPeer,
    disconnect,
    isSplitView,
    setIsSplitView,
    networkLogs,
    whackEffects,
    simulateLocalMessage,
    addLog,
  } = usePeerGame();

  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(true);

  // Auto adapter for local simulator mapping
  // This allows the side-by-side simulator to synchronize clicks, timers, and questions perfectly
  const isP2PConnected = connectionStatus === 'CONNECTED';

  // Customized start handler that coordinates both systems
  const handleStartGameAction = () => {
    if (isP2PConnected) {
      startGame();
    } else if (isSplitView) {
      // Offline local simulation
      addLog('시뮬레이어 매치 시작! (호스트-클라이언트 로컬 가상 연결)');
      setRole('HOST');
      startGame();
    } else {
      // Solo client training
      addLog('호스트 단독 연습 모드를 시작합니다!');
      setRole('HOST');
      startGame();
    }
  };

  // Customized config update adapter
  const handleUpdateSettingsAction = (cat: LearningCategory, mode: 'COOP' | 'VERSUS') => {
    if (isP2PConnected) {
      updateLobbySettings(cat, mode);
    } else {
      setCategory(cat);
      setGameMode(mode);
    }
  };

  // Customized click/whack adapter
  const handleWhackAction = (index: number, actorRole: 'HOST' | 'CLIENT') => {
    if (isP2PConnected) {
      // In WebRTC connection, send action
      whackMole(index, actorRole);
    } else {
      // In simulated split view or solo play
      whackMole(index, actorRole);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden pb-12">
      
      {/* 🌌 Upper Cosmic Decorative Navigation Menu */}
      <header className="bg-slate-900/30 border-b border-slate-800/60 px-6 py-6 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded uppercase tracking-widest">
                Learning Mode
              </span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium italic">
                {category === LearningCategory.ENGLISH && '[사칙 단어: 영어 반대말 암기 매칭]'}
                {category === LearningCategory.MATH && '[사칙 연산: 곱셈과 나눗셈 수학 기초]'}
                {category === LearningCategory.SCIENCE && '[지식 상식: 교양 및 과학 퀴즈]'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight flex flex-wrap items-baseline gap-2">
              두더지 잡기 학습 게임
              <span className="text-slate-600 text-sm sm:text-xl font-light tracking-widest whitespace-nowrap">
                | WHACK-A-STUDY
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <button
              type="button"
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="text-xs px-3.5 py-2 font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all"
            >
              <Info className="w-4 h-4 inline-block mr-1.5" /> 학습 가이드 {showHowToPlay ? '닫기' : '열기'}
            </button>

            <span className="text-xs bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400 flex items-center gap-1.5 font-semibold">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" /> WebRTC P2P 지원
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6 flex-1">
        
        {/* 📚 1. Beautiful "How To Play" Guide Box */}
        <AnimatePresence>
          {showHowToPlay && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-xl space-y-3 relative"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm sm:text-base">
                    🎓 두더지 잡기 학습 게임이란?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-5xl">
                    상단의 <strong className="text-amber-300">[배울 내용]</strong> 질문 카드를 재빠르게 읽고, 3x3 격자에서 생성되는 두더지 중 
                    <span className="text-emerald-400 font-bold"> 올바른 정답이 적힌 두더지</span>만을 마우스로 클릭하는 재미있는 어휘/연산 단련 게임입니다!
                    오답 두더지를 누르면 점수가 감점되니 주의하세요!
                  </p>
                </div>
              </div>

              {/* Step instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 flex gap-2">
                  <span className="font-mono text-indigo-400 font-black">01.</span>
                  <div>
                    <strong className="text-slate-200 block">과목 및 모드 세정</strong>
                    <span className="text-slate-400 text-[11px]">로비에서 영어 반대말, 구구단 사칙연산, 과학 상식을 골라 학습 코스를 정하세요.</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 flex gap-2">
                  <span className="font-mono text-indigo-400 font-black">02.</span>
                  <div>
                    <strong className="text-slate-200 block">듀얼 스크린 시뮬레이터</strong>
                    <span className="text-slate-400 text-[11px]">화면을 좌우로 분할해 좌측(선생님 Host)과 우측(학생 Client)의 상호작용을 한 창에서 연동해 테스트하세요.</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 flex gap-2">
                  <span className="font-mono text-indigo-400 font-black">03.</span>
                  <div>
                    <strong className="text-slate-200 block">P2P 실시간 원격 대결</strong>
                    <span className="text-slate-400 text-[11px]">대기 코드를 복사해 친구나 다른 브라우저 탭에 전달해 입력하면 실제 무선 P2P WebRTC 대결이 개시됩니다.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚦 2. Upper Control Console Panels */}
        <NetworkStatus
          myRoomCode={myRoomCode}
          connectionStatus={connectionStatus}
          currentRole={role}
          isSplitView={isSplitView}
          setIsSplitView={setIsSplitView}
          networkLogs={networkLogs}
          connectToPeer={connectToPeer}
          disconnect={disconnect}
        />

        {/* 🏆 3. Collective Score Dashboard Banner */}
        <StatsBanner
          hostScore={hostScore}
          clientScore={clientScore}
          timeLeft={timeLeft}
          peerRole={role}
          gameMode={gameMode}
          category={category}
          connectionStatus={connectionStatus}
        />

        {/* 🧸 4. Main Gameplay Board Panels Layout */}
        <div className="relative">
          
          <AnimatePresence mode="wait">
            {isSplitView ? (
              /* DUAL DOCK SPLIT VIEW: Perfect for local previewing & sync matching in 1 Window */
              <motion.div
                key="split-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* LEFT: HOST DEVICE VIEW (Teacher Role) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3">
                    <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/25 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      BOARD A : 선생님 콘솔 (HOST)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">가상 로컬 P2P 연결 완료</span>
                  </div>
                  
                  <MoleGrid
                    moles={moles}
                    currentQuestion={currentQuestion}
                    gameStatus={gameStatus}
                    role="HOST"
                    gameMode={gameMode}
                    category={category}
                    isReady={isReady}
                    peerReady={peerReady}
                    hostScore={hostScore}
                    clientScore={clientScore}
                    connectionStatus={connectionStatus}
                    whackEffects={whackEffects}
                    onWhack={handleWhackAction}
                    onStartGame={handleStartGameAction}
                    onToggleReady={toggleReady}
                    onUpdateSettings={handleUpdateSettingsAction}
                    onDisconnect={disconnect}
                    panelOwner="HOST"
                  />
                </div>

                {/* RIGHT: CLIENT DEVICE VIEW (Student Role) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3">
                    <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      BOARD B : 학생 콘솔 (CLIENT)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">실시간 스코어 연동 수신</span>
                  </div>

                  <MoleGrid
                    moles={moles}
                    currentQuestion={currentQuestion}
                    gameStatus={gameStatus}
                    role="CLIENT"
                    gameMode={gameMode}
                    category={category}
                    isReady={isReady}
                    peerReady={peerReady}
                    hostScore={hostScore}
                    clientScore={clientScore}
                    connectionStatus={connectionStatus}
                    whackEffects={whackEffects}
                    onWhack={handleWhackAction}
                    onStartGame={handleStartGameAction}
                    onToggleReady={toggleReady}
                    onUpdateSettings={handleUpdateSettingsAction}
                    onDisconnect={disconnect}
                    panelOwner="CLIENT"
                  />
                </div>
              </motion.div>
            ) : (
              /* SINGLE VIEW MATCH: When user prefers normal gameplay matching */
              <motion.div
                key="single-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto space-y-4"
              >
                {/* Control to Switch Device Profile manually to test network across different tabs */}
                <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400 block font-bold">인게임 클라이언트 역할 프로필 변경</span>
                    <span className="text-[11px] text-slate-500">원격 P2P 전송에 사용할 브라우저 역할을 정합니다.</span>
                  </div>
                  
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('HOST');
                        addLog('단일 호스트(선생님) 역할로 전환했습니다.');
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${role === 'HOST' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      선생님 (Host)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('CLIENT');
                        addLog('단일 클라이언트(학생) 역할로 전환했습니다.');
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${role === 'CLIENT' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      학생 (Client)
                    </button>
                  </div>
                </div>

                <MoleGrid
                  moles={moles}
                  currentQuestion={currentQuestion}
                  gameStatus={gameStatus}
                  role={role}
                  gameMode={gameMode}
                  category={category}
                  isReady={isReady}
                  peerReady={peerReady}
                  hostScore={hostScore}
                  clientScore={clientScore}
                  connectionStatus={connectionStatus}
                  whackEffects={whackEffects}
                  onWhack={handleWhackAction}
                  onStartGame={handleStartGameAction}
                  onToggleReady={toggleReady}
                  onUpdateSettings={handleUpdateSettingsAction}
                  onDisconnect={disconnect}
                  panelOwner={role}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

      </main>

      {/* Footer Info Statement */}
      <footer className="mt-12 text-center text-xs text-slate-600 max-w-md mx-auto space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" /> Secured with real WebRTC P2P direct sync connection
        </p>
        <p>© 2026 두더지 잡기 학습 게임. All Academic Moles Reserved.</p>
      </footer>

    </div>
  );
}
