/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Network, Copy, ArrowRight, Radio, Eye, EyeOff, Terminal, ShieldAlert, CheckCircle } from 'lucide-react';

interface NetworkStatusProps {
  myRoomCode: string;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  currentRole: 'HOST' | 'CLIENT';
  isSplitView: boolean;
  setIsSplitView: (val: boolean) => void;
  networkLogs: string[];
  connectToPeer: (code: string) => void;
  disconnect: () => void;
}

export default function NetworkStatus({
  myRoomCode,
  connectionStatus,
  currentRole,
  isSplitView,
  setIsSplitView,
  networkLogs,
  connectToPeer,
  disconnect,
}: NetworkStatusProps) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!myRoomCode) return;
    navigator.clipboard.writeText(myRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = 
    connectionStatus === 'CONNECTED' ? 'bg-emerald-500 text-emerald-100' :
    connectionStatus === 'CONNECTING' ? 'bg-amber-500 text-amber-100 animate-pulse' :
    'bg-slate-700 text-slate-300';

  const statusText = 
    connectionStatus === 'CONNECTED' ? '연결 완료 ●' :
    connectionStatus === 'CONNECTING' ? '연결 중...' :
    '미연결 (대기 중)';

  return (
    <div id="p2p-control-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Real-time Connection Settings Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">P2P 실시간 통신 및 제어</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            원격 플레이어와 P2P로 직접 연결하거나 듀얼 스크린 시뮬레이터로 가상 매치를 진행하세요.
          </p>
        </div>
        
        {/* Connection Status Badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor} flex items-center gap-1.5`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Peer Address Controls */}
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium mb-1.5">내 방 대기 코드 (My ID)</span>
            <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-xl font-bold text-amber-400 tracking-wider">
                {myRoomCode || '로딩 중...'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!myRoomCode}
                className="p-1 px-2.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors"
                title="방 코드 복사"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium mb-1.5">상대 방에 참여하기 (Join Code)</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="코드 입력 (예: K8FG)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 10))}
                className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 font-mono font-semibold px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-amber-400 uppercase tracking-wide"
              />
              {connectionStatus === 'CONNECTED' ? (
                <button
                  type="button"
                  onClick={disconnect}
                  className="bg-red-950 hover:bg-red-900 text-red-100 px-4 py-2 rounded-lg text-sm font-medium border border-red-700/50 transition-colors whitespace-nowrap"
                >
                  참여 해제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => inputCode.trim() && connectToPeer(inputCode.trim())}
                  disabled={!myRoomCode || !inputCode.trim() || connectionStatus === 'CONNECTING'}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" /> 연결
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Console logs & Split Mode Toggle */}
        <div className="flex flex-col h-full bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>실시간 네트워크 통신 로그</span>
            </div>
            
            {/* Split Screen Simulator Toggle */}
            <button
              type="button"
              onClick={() => setIsSplitView(!isSplitView)}
              className="text-xs px-2 py-1 rounded border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="1개의 화면에서 Host와 Client를 좌우 측면에 띄워 테스트할 수 있습니다."
            >
              {isSplitView ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              {isSplitView ? '통합 싱글뷰 전환' : '듀얼 스크린 테스트'}
            </button>
          </div>

          {/* Log Window */}
          <div id="network-log-scroll" className="flex-1 w-full max-h-[110px] overflow-y-auto text-[11px] font-mono p-2 text-slate-400 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {networkLogs.length === 0 ? (
              <span className="text-slate-600 italic block">동작을 로그에 표시하는 중...</span>
            ) : (
              networkLogs.map((log, index) => (
                <div key={index} className="truncate border-l border-slate-800 pl-1.5 py-0.5 hover:bg-slate-900/50">
                  {log.includes('연결') ? (
                    <span className="text-emerald-400 font-medium">{log}</span>
                  ) : log.includes('에러') ? (
                    <span className="text-red-400 font-medium">{log}</span>
                  ) : log.includes('시작') ? (
                    <span className="text-amber-300 font-medium">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
