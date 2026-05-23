/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { 
  LearningCategory, 
  Question, 
  Mole, 
  PlayerRole, 
  GameStatus, 
  PeerMessage, 
} from '../types.ts';
import { getRandomQuestion } from '../questions.ts';

// Helper to generate simple room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous lookalikes
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function usePeerGame() {
  // Game state
  const [role, setRole] = useState<PlayerRole>('CLIENT');
  const [category, setCategory] = useState<LearningCategory>(LearningCategory.ENGLISH);
  const [gameMode, setGameMode] = useState<'COOP' | 'VERSUS'>('COOP');
  const [gameStatus, setGameStatus] = useState<GameStatus>('LOBBY');
  
  // Game scores (Co-op shares joint score, Versus tracks separately)
  const [hostScore, setHostScore] = useState<number>(0);
  const [clientScore, setClientScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [moles, setMoles] = useState<Mole[]>(() => 
    Array.from({ length: 9 }, (_, i) => ({
      index: i,
      active: false,
      content: '',
      isCorrect: false,
      points: 10,
    }))
  );

  // Peer & connection state
  const [myRoomCode, setMyRoomCode] = useState<string>('');
  const [targetRoomCode, setTargetRoomCode] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [peerId, setPeerId] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [peerReady, setPeerReady] = useState<boolean>(false);
  const [isSplitView, setIsSplitView] = useState<boolean>(true); // Default to split view so they can play inside AI Studio

  // Log messages for developer transparency
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);
  const addLog = useCallback((msg: string) => {
    setNetworkLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  }, []);

  // PeerJS references
  const peerInstance = useRef<Peer | null>(null);
  const activeConnRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIdRef = useRef<string>('');

  // Sound/Visual Whack Floating Effect
  const [whackEffects, setWhackEffects] = useState<{ id: number; index: number; text: string; isCorrect: boolean }[]>([]);
  const effectIdRef = useRef<number>(0);

  // Trigger floating text whack effects
  const triggerWhackEffect = useCallback((index: number, text: string, isCorrect: boolean) => {
    const id = effectIdRef.current++;
    setWhackEffects(prev => [...prev, { id, index, text, isCorrect }]);
    setTimeout(() => {
      setWhackEffects(prev => prev.filter(e => e.id !== id));
    }, 1000);
  }, []);

  // Stop active intervals
  const stopIntervals = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  }, []);

  // Sync state helper to broadcast messages from Host to Client
  const broadcastMessage = useCallback((type: string, payload: any) => {
    const msg: PeerMessage = {
      type: type as any,
      payload,
      senderRole: role,
    };
    if (activeConnRef.current && activeConnRef.current.open) {
      activeConnRef.current.send(msg);
    }
  }, [role]);

  // Handle whacking mole
  const whackMole = useCallback((index: number, clickerRole: PlayerRole) => {
    const mole = moles[index];
    if (!mole || !mole.active || gameStatus !== 'PLAYING') return;

    const isCorrect = mole.isCorrect;
    const points = isCorrect ? 10 : -5;
    const effectText = isCorrect ? '+10' : '-5';

    // Play temporary audio synthesis feedback for responsive click
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.25); // A2
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // Sound context might be blocked or unsupported (fine to ignore)
    }

    triggerWhackEffect(index, effectText, isCorrect);

    // Update mole grid: hide the whacked mole immediately (local prediction)
    setMoles(prev => prev.map(m => m.index === index ? { ...m, active: false } : m));

    if (role === 'HOST') {
      // Update score autoritatively
      if (gameMode === 'COOP') {
        const targetSetter = clickerRole === 'HOST' ? setHostScore : setClientScore;
        // In Co-op, they share score or count combined. Let's make combined score tracking
        setHostScore(prev => Math.max(0, prev + points));
      } else {
        // Versus Mode: discrete scoring
        if (clickerRole === 'HOST') {
          setHostScore(prev => Math.max(0, prev + points));
        } else {
          setClientScore(prev => Math.max(0, prev + points));
        }
      }

      // Tell other player to update mole and display whack effect locally
      broadcastMessage('MOLE_WHACKED', { index, clickerRole, points, effectText, isCorrect });
      
      // Select new question if the correct answer was hit
      if (isCorrect) {
        setTimeout(() => {
          advanceQuestion();
        }, 300);
      }
    } else {
      // Client reports whack to Host
      broadcastMessage('MOLE_WHACKED', { index, clickerRole: 'CLIENT' });
    }
  }, [moles, gameStatus, role, gameMode, broadcastMessage, triggerWhackEffect]);

  // Host function to advance to next question
  const advanceQuestion = useCallback((explicitCategory?: LearningCategory) => {
    if (role !== 'HOST') return;

    const useCategory = explicitCategory || category;
    const newQuestion = getRandomQuestion(useCategory, currentQuestionIdRef.current);
    currentQuestionIdRef.current = newQuestion.id;
    setCurrentQuestion(newQuestion);

    // Generate moles with the new question answers
    const answers = [
      { text: newQuestion.correctAnswer, isCorrect: true },
      ...newQuestion.wrongAnswers.map(ans => ({ text: ans, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    // Randomize which 4 holes out of 9 get populated
    const chosenHoles: number[] = [];
    while (chosenHoles.length < Math.min(answers.length, 4)) {
      const idx = Math.floor(Math.random() * 9);
      if (!chosenHoles.includes(idx)) {
        chosenHoles.push(idx);
      }
    }

    const newMoles = Array.from({ length: 9 }, (_, i) => {
      const selectedIndex = chosenHoles.indexOf(i);
      if (selectedIndex !== -1 && selectedIndex < answers.length) {
        return {
          index: i,
          active: true,
          content: answers[selectedIndex].text,
          isCorrect: answers[selectedIndex].isCorrect,
          points: answers[selectedIndex].isCorrect ? 10 : -5,
        };
      }
      return {
        index: i,
        active: false,
        content: '',
        isCorrect: false,
        points: 0,
      };
    });

    setMoles(newMoles);
    broadcastMessage('NEXT_QUESTION', { question: newQuestion, moles: newMoles });
    addLog(`새 질문 출제: ${newQuestion.prompt}`);
  }, [role, category, broadcastMessage, addLog]);

  // Active Spawning of moles
  const startMoleSpawner = useCallback(() => {
    if (role !== 'HOST') return;

    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);

    // Every 2.5 seconds, if game is playing, update mole positions if none is correct currently,
    // or pop a random mole to spice things up.
    spawnIntervalRef.current = setInterval(() => {
      setMoles(prevMoles => {
        // Find if correct mole is up. If not, spawn a new set.
        const correctMoleUp = prevMoles.some(m => m.active && m.isCorrect);
        if (!correctMoleUp && currentQuestion) {
          // Let's force an advance or respawn answers
          setTimeout(() => {
            advanceQuestion();
          }, 0);
          return prevMoles;
        }

        // Just toggle a wrong mole randomly
        const nextMoles = [...prevMoles];
        const inactiveIndices = nextMoles.filter(m => !m.active).map(m => m.index);
        if (inactiveIndices.length > 0 && Math.random() < 0.6) {
          const randHole = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
          // Spawn a random wrong answer or correct answer
          if (currentQuestion) {
            const isCorrectChance = Math.random() < 0.3;
            nextMoles[randHole] = {
              index: randHole,
              active: true,
              content: isCorrectChance ? currentQuestion.correctAnswer : currentQuestion.wrongAnswers[Math.floor(Math.random() * currentQuestion.wrongAnswers.length)],
              isCorrect: isCorrectChance,
              points: isCorrectChance ? 10 : -5,
            };
            broadcastMessage('MOLE_SPAWN', { index: randHole, mole: nextMoles[randHole] });
          }
        }
        return nextMoles;
      });
    }, 2200);
  }, [role, currentQuestion, advanceQuestion, broadcastMessage]);

  // Host starts the countdown and launches the game
  const startGame = useCallback(() => {
    if (role !== 'HOST') return;

    stopIntervals();
    setGameStatus('PLAYING');
    setHostScore(0);
    setClientScore(0);
    setTimeLeft(30);
    setIsReady(false);
    setPeerReady(false);
    addLog('게임이 시작되었습니다! (제한시간 30초)');

    broadcastMessage('SYNC_PLAYING', {
      gameMode,
      category,
    });

    // Generate first question
    advanceQuestion();

    // Start 30s timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopIntervals();
          setGameStatus('FINISHED');
          addLog('게임 오버! 결과 전송 중...');
          broadcastMessage('SYNC_FINISHED', {});
          return 0;
        }
        broadcastMessage('TIME_TICK', { time: prev - 1 });
        return prev - 1;
      });
    }, 1000);

    // Spawn mechanism starts
    startMoleSpawner();
  }, [role, gameMode, category, stopIntervals, advanceQuestion, startMoleSpawner, broadcastMessage, addLog]);

  // Handle incoming data message
  const handleMessage = useCallback((msg: PeerMessage) => {
    switch (msg.type) {
      case 'SYNC_LOBBY':
        setGameStatus('LOBBY');
        setCategory(msg.payload.category);
        setGameMode(msg.payload.gameMode);
        setPeerReady(msg.payload.isReady);
        addLog(`대기실 정보 동기화 완료 (${msg.payload.gameMode})`);
        break;

      case 'SYNC_PLAYING':
        setGameStatus('PLAYING');
        setCategory(msg.payload.category);
        setGameMode(msg.payload.gameMode);
        setHostScore(0);
        setClientScore(0);
        setTimeLeft(30);
        setIsReady(false);
        setPeerReady(false);
        addLog('호스트로부터 게임 시작 신호 수신!');
        break;

      case 'SYNC_FINISHED':
        setGameStatus('FINISHED');
        stopIntervals();
        addLog('게임 종료!');
        break;

      case 'NEXT_QUESTION':
        currentQuestionIdRef.current = msg.payload.question.id;
        setCurrentQuestion(msg.payload.question);
        setMoles(msg.payload.moles);
        break;

      case 'TIME_TICK':
        setTimeLeft(msg.payload.time);
        break;

      case 'MOLE_SPAWN':
        setMoles(prev => prev.map(m => m.index === msg.payload.index ? msg.payload.mole : m));
        break;

      case 'MOLE_WHACKED':
        if (role === 'HOST') {
          // Client whacked from their side! Host validates and processes
          whackMole(msg.payload.index, 'CLIENT');
        } else {
          // Client receives whack result broadcast from Host
          const { index, clickerRole, points, effectText, isCorrect } = msg.payload;
          triggerWhackEffect(index, effectText, isCorrect);
          setMoles(prev => prev.map(m => m.index === index ? { ...m, active: false } : m));
          if (gameMode === 'COOP') {
            setHostScore(prev => Math.max(0, prev + points));
          } else {
            if (clickerRole === 'HOST') {
              setHostScore(prev => Math.max(0, prev + points));
            } else {
              setClientScore(prev => Math.max(0, prev + points));
            }
          }
          // If correct answer whacked, client prepares for the next question arriving shortly
        }
        break;

      case 'READY_CHANGE':
        setPeerReady(msg.payload.ready);
        addLog(`상대방 준비 상태 변경: ${msg.payload.ready ? '준비완료 🟢' : '대기중 ⚪'}`);
        break;

      case 'SCORE_UPDATE':
        setHostScore(msg.payload.hostScore);
        setClientScore(msg.payload.clientScore);
        break;

      default:
        break;
    }
  }, [role, gameMode, whackMole, triggerWhackEffect, stopIntervals, addLog]);

  // Connect peers
  const connectToPeer = useCallback((targetCode: string) => {
    if (!peerInstance.current) {
      addLog('PeerJS 클라이언트가 생성되지 않았습니다.');
      return;
    }

    const fullPeerId = `g-whack-${targetCode.trim().toUpperCase()}`;
    addLog(`연결 중: ${fullPeerId}...`);
    setConnectionStatus('CONNECTING');

    const conn = peerInstance.current.connect(fullPeerId);
    activeConnRef.current = conn;

    conn.on('open', () => {
      setConnectionStatus('CONNECTED');
      setRole('CLIENT');
      addLog(`호스트(${targetCode})에 정상 연결되었습니다!`);
      // Notify Host of connection and initial ready status
      conn.send({
        type: 'READY_CHANGE',
        payload: { ready: isReady },
        senderRole: 'CLIENT'
      });
    });

    conn.on('data', (data: any) => {
      handleMessage(data as PeerMessage);
    });

    conn.on('close', () => {
      setConnectionStatus('DISCONNECTED');
      addLog('연결이 해제되었습니다.');
      stopIntervals();
    });

    conn.on('error', (err) => {
      setConnectionStatus('DISCONNECTED');
      addLog(`연결 에러 발생: ${err.message}`);
      stopIntervals();
    });
  }, [handleMessage, isReady, stopIntervals, addLog]);

  // Toggle client ready state
  const toggleReady = useCallback(() => {
    const nextReady = !isReady;
    setIsReady(nextReady);
    addLog(nextReady ? '내가 준비를 완료했습니다!' : '준비 완료를 취소했습니다.');
    
    if (activeConnRef.current && activeConnRef.current.open) {
      broadcastMessage('READY_CHANGE', { ready: nextReady });
    }
  }, [isReady, broadcastMessage, addLog]);

  // Set host category or mode from lobby
  const updateLobbySettings = useCallback((cat: LearningCategory, mode: 'COOP' | 'VERSUS') => {
    if (role !== 'HOST') return;
    setCategory(cat);
    setGameMode(mode);
    addLog(`대기실 환경 변경 - 카테고리: ${cat}, 방식: ${mode}`);
    broadcastMessage('SYNC_LOBBY', {
      category: cat,
      gameMode: mode,
      isReady: false
    });
  }, [role, broadcastMessage, addLog]);

  // Disconnect connection
  const disconnect = useCallback(() => {
    if (activeConnRef.current) {
      activeConnRef.current.close();
      activeConnRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
    setIsReady(false);
    setPeerReady(false);
    setGameStatus('LOBBY');
    stopIntervals();
    addLog('피어 연결을 종료하고 대기실로 퇴장했습니다.');
  }, [stopIntervals, addLog]);

  // Create virtual local network for Side-by-Side Play Simulator
  // This simulates the peer communication on local bus so users in AI Studio Preview
  // can test 2-players split screen game in 1 Window with 100% reactive sync!
  const simulateLocalMessage = useCallback((sender: PlayerRole, msg: PeerMessage) => {
    // Cross transfer
    if (sender === 'HOST') {
      // Simulate Client receiving Host message
      setTimeout(() => {
        // Run Client context logic
        switch (msg.type) {
          case 'SYNC_PLAYING':
            setGameStatus('PLAYING');
            setCategory(msg.payload.category);
            setGameMode(msg.payload.gameMode);
            setHostScore(0);
            setClientScore(0);
            setTimeLeft(30);
            setIsReady(false);
            setPeerReady(false);
            break;
          case 'SYNC_FINISHED':
            setGameStatus('FINISHED');
            break;
          case 'NEXT_QUESTION':
            setCurrentQuestion(msg.payload.question);
            setMoles(msg.payload.moles);
            break;
          case 'TIME_TICK':
            setTimeLeft(msg.payload.time);
            break;
          case 'MOLE_SPAWN':
            setMoles(prev => prev.map(m => m.index === msg.payload.index ? msg.payload.mole : m));
            break;
          case 'MOLE_WHACKED':
            const { index, clickerRole, points, effectText, isCorrect } = msg.payload;
            triggerWhackEffect(index, effectText, isCorrect);
            setMoles(prev => prev.map(m => m.index === index ? { ...m, active: false } : m));
            if (gameMode === 'COOP') {
              setHostScore(prev => Math.max(0, prev + points));
            } else {
              if (clickerRole === 'HOST') {
                setHostScore(prev => Math.max(0, prev + points));
              } else {
                setClientScore(prev => Math.max(0, prev + points));
              }
            }
            break;
          case 'SYNC_LOBBY':
            setCategory(msg.payload.category);
            setGameMode(msg.payload.gameMode);
            break;
          default:
            break;
        }
      }, 50);
    } else {
      // Simulate Host receiving Client message
      setTimeout(() => {
        switch (msg.type) {
          case 'READY_CHANGE':
            setPeerReady(msg.payload.ready);
            break;
          case 'MOLE_WHACKED':
            // Host processes Client click
            whackMole(msg.payload.index, 'CLIENT');
            break;
          default:
            break;
        }
      }, 50);
    }
  }, [gameMode, whackMole, triggerWhackEffect]);

  // Initialize PeerJS
  useEffect(() => {
    const code = generateRoomCode();
    setMyRoomCode(code);
    const generatedId = `g-whack-${code}`;
    setPeerId(generatedId);

    // Create the Peer object safely in client side
    addLog(`Peer ID 등록 중... (${code})`);
    
    // Config pointing to default public cloud PeerJS broker or local
    const peer = new Peer(generatedId, {
      debug: 1
    });

    peerInstance.current = peer;

    peer.on('open', (id) => {
      addLog(`네트워크 활성화 완료! 대기 코드: ${code}`);
    });

    peer.on('connection', (conn) => {
      // Incoming link! We are the HOST
      activeConnRef.current = conn;
      setRole('HOST');
      setConnectionStatus('CONNECTED');
      addLog(`클라이언트(${conn.peer.replace('g-whack-', '')})가 우리 방에 접속했습니다!`);

      // Send initial lobby setup
      conn.send({
        type: 'SYNC_LOBBY',
        payload: {
          category,
          gameMode,
          isReady: false
        },
        senderRole: 'HOST'
      });

      conn.on('data', (data: any) => {
        handleMessage(data as PeerMessage);
      });

      conn.on('close', () => {
        setConnectionStatus('DISCONNECTED');
        addLog('클라이언트가 퇴장하였습니다.');
        stopIntervals();
        setRole('CLIENT');
      });

      conn.on('error', (err) => {
        addLog(`에러 발생: ${err.message}`);
        stopIntervals();
      });
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Regenerate connection ID codes on conflicts
        addLog('코드 중복 발생, 재설정 중...');
      } else {
        addLog(`시스템 에러: ${err.message}`);
      }
    });

    return () => {
      stopIntervals();
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, []);

  // Sync scores authoritative change
  useEffect(() => {
    if (role === 'HOST' && connectionStatus === 'CONNECTED') {
      broadcastMessage('SCORE_UPDATE', { hostScore, clientScore });
    }
  }, [hostScore, clientScore, role, connectionStatus, broadcastMessage]);

  return {
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
  };
}
