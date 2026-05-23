/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LearningCategory {
  ENGLISH = 'ENGLISH',
  MATH = 'MATH',
  SCIENCE = 'SCIENCE',
}

export interface Question {
  id: string;
  category: LearningCategory;
  prompt: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

export interface Mole {
  index: number;         // 0-8 position in the 3x3 grid
  active: boolean;       // whether the mole is up
  content: string;       // text display on the mole
  isCorrect: boolean;    // is this mole displaying the correct answer?
  points: number;        // points rewarded or penalized
}

export type PlayerRole = 'HOST' | 'CLIENT';

export type GameStatus = 'LOBBY' | 'PLAYING' | 'FINISHED';

export interface GameState {
  status: GameStatus;
  score: number;
  timeLeft: number;
  currentQuestion: Question | null;
  moles: Mole[];
  peerId: string;
  targetPeerId: string;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  peerRole: PlayerRole;
  isReady: boolean;
  peerReady: boolean;
  highScore: number;
}

// Peer Message Types
export type PeerMessageType =
  | 'SYNC_LOBBY'
  | 'SYNC_PLAYING'
  | 'SYNC_FINISHED'
  | 'MOLE_SPAWN'
  | 'MOLE_WHACKED'
  | 'SCORE_UPDATE'
  | 'READY_CHANGE'
  | 'TIME_TICK'
  | 'NEXT_QUESTION';

export interface PeerMessage {
  type: PeerMessageType;
  payload: any;
  senderRole: PlayerRole;
}
