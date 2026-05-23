/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Clock, UserCheck, Flame, Zap } from 'lucide-react';
import { LearningCategory } from '../types.ts';

interface StatsBannerProps {
  hostScore: number;
  clientScore: number;
  timeLeft: number;
  peerRole: 'HOST' | 'CLIENT';
  gameMode: 'COOP' | 'VERSUS';
  category: LearningCategory;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
}

export default function StatsBanner({
  hostScore,
  clientScore,
  timeLeft,
  peerRole,
  gameMode,
  category,
  connectionStatus,
}: StatsBannerProps) {
  const getCategoryEmojiAndName = () => {
    switch (category) {
      case LearningCategory.ENGLISH:
        return { emoji: '📚', name: '초등 영단어 반대말 매칭' };
      case LearningCategory.MATH:
        return { emoji: '🧮', name: '재미있는 구구단 및 사칙연산' };
      case LearningCategory.SCIENCE:
        return { emoji: '🧪', name: '상식 & 초등 과학 퀴즈' };
    }
  };

  const catData = getCategoryEmojiAndName();

  return (
    <div id="game-stats-dashboard" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      {/* 🌟 1. Role & Connection Dashboard Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-sky-400" /> PLAYER ROLE (내 역할)
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${peerRole === 'HOST' ? 'text-amber-400' : 'text-cyan-400'}`}>
              {peerRole === 'HOST' ? '선생님 (게임 호스트)' : '학생 (플레이어 / Client)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {gameMode === 'COOP' ? '🤝 멤버 협동 모드' : '⚡ ⚔️ 1vs1 개인 경쟁전'}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${peerRole === 'HOST' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/50'}`}>
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      {/* ⏰ 2. Timer Dashboard Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-rose-400" /> LIMIT TIMER (남은 시간)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-mono font-extrabold ${timeLeft <= 8 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`}>
              {timeLeft}
            </span>
            <span className="text-xs text-slate-400">초</span>
          </div>
          {/* Progress gauge bar */}
          <div className="w-28 h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 8 ? 'bg-red-500' : 'bg-rose-400'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${timeLeft <= 8 ? 'bg-red-950/40 text-red-400 border border-red-900/50 animate-bounce' : 'bg-rose-950/40 text-rose-400 border border-rose-900/50'}`}>
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 🏆 3. High Score & Joint/Discrete Scores Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
        <div className="space-y-1.5 w-full">
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> SCORE (현재 점수)
          </span>

          {gameMode === 'COOP' ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-extrabold text-amber-400">
                {hostScore}
              </span>
              <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                팀 합산 스코어
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">선생님(Host)</span>
                <span className="text-xl font-mono font-bold text-amber-500">{hostScore} 점</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-semibold text-right">학생(Client)</span>
                <span className="text-xl font-mono font-bold text-cyan-500">{clientScore} 점</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-900/50 flex-shrink-0 ml-2">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
