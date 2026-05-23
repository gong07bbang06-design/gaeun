/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, LearningCategory } from './types.ts';

export const QUESTIONS_DATABASE: Question[] = [
  // 📚 English Antonyms (Korean meanings removed from moles/answers entirely)
  {
    id: 'eng-1',
    category: LearningCategory.ENGLISH,
    prompt: '"Hot"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Cold',
    wrongAnswers: ['Warm', 'Sun', 'Fire']
  },
  {
    id: 'eng-2',
    category: LearningCategory.ENGLISH,
    prompt: '"Big"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Small',
    wrongAnswers: ['Huge', 'Tall', 'Heavy']
  },
  {
    id: 'eng-3',
    category: LearningCategory.ENGLISH,
    prompt: '"Happy"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Sad',
    wrongAnswers: ['Joyful', 'Active', 'Smile']
  },
  {
    id: 'eng-4',
    category: LearningCategory.ENGLISH,
    prompt: '"Fast"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Slow',
    wrongAnswers: ['Quick', 'Run', 'Fly']
  },
  {
    id: 'eng-5',
    category: LearningCategory.ENGLISH,
    prompt: '"Light"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Dark',
    wrongAnswers: ['Bright', 'White', 'Heavy']
  },
  {
    id: 'eng-6',
    category: LearningCategory.ENGLISH,
    prompt: '"Wet"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Dry',
    wrongAnswers: ['Damp', 'Ocean', 'Water']
  },
  {
    id: 'eng-7',
    category: LearningCategory.ENGLISH,
    prompt: '"Sharp"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Dull',
    wrongAnswers: ['Blunt', 'Pointy', 'Shiny']
  },
  {
    id: 'eng-8',
    category: LearningCategory.ENGLISH,
    prompt: '"High"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Low',
    wrongAnswers: ['Tall', 'Above', 'Deep']
  },
  {
    id: 'eng-9',
    category: LearningCategory.ENGLISH,
    prompt: '"Weak"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Strong',
    wrongAnswers: ['Soft', 'Quiet', 'Tough']
  },
  {
    id: 'eng-10',
    category: LearningCategory.ENGLISH,
    prompt: '"Thick"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Thin',
    wrongAnswers: ['Fat', 'Flat', 'Wide']
  },
  {
    id: 'eng-11',
    category: LearningCategory.ENGLISH,
    prompt: '"Rich"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Poor',
    wrongAnswers: ['Money', 'Gold', 'Safe']
  },
  {
    id: 'eng-12',
    category: LearningCategory.ENGLISH,
    prompt: '"Sweet"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Sour',
    wrongAnswers: ['Salty', 'Bitter', 'Sugar']
  },
  {
    id: 'eng-13',
    category: LearningCategory.ENGLISH,
    prompt: '"Loud"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Quiet',
    wrongAnswers: ['Noisy', 'Sound', 'Soft']
  },
  {
    id: 'eng-14',
    category: LearningCategory.ENGLISH,
    prompt: '"Near"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Far',
    wrongAnswers: ['Close', 'High', 'Under']
  },
  {
    id: 'eng-15',
    category: LearningCategory.ENGLISH,
    prompt: '"Open"의 반대 영어 단어는 무엇일까요?',
    correctAnswer: 'Close',
    wrongAnswers: ['Lock', 'Free', 'Out']
  },

  // 🧮 Mental Math
  {
    id: 'math-1',
    category: LearningCategory.MATH,
    prompt: '구구단 퀴즈: "7 × 8 = ?"',
    correctAnswer: '56',
    wrongAnswers: ['48', '64', '54']
  },
  {
    id: 'math-2',
    category: LearningCategory.MATH,
    prompt: '덧셈 암산: "15 + 18 = ?"',
    correctAnswer: '33',
    wrongAnswers: ['31', '32', '34']
  },
  {
    id: 'math-3',
    category: LearningCategory.MATH,
    prompt: '혼합 연산: "9 × 9 - 10 = ?"',
    correctAnswer: '71',
    wrongAnswers: ['81', '72', '61']
  },
  {
    id: 'math-4',
    category: LearningCategory.MATH,
    prompt: '나눗셈 암산: "120 ÷ 4 = ?"',
    correctAnswer: '30',
    wrongAnswers: ['25', '40', '35']
  },
  {
    id: 'math-5',
    category: LearningCategory.MATH,
    prompt: '혼합 연산: "25 + (5 × 6) = ?"',
    correctAnswer: '55',
    wrongAnswers: ['45', '65', '90']
  },
  {
    id: 'math-6',
    category: LearningCategory.MATH,
    prompt: '구구단 퀴즈: "6 × 9 = ?"',
    correctAnswer: '54',
    wrongAnswers: ['49', '63', '56']
  },
  {
    id: 'math-7',
    category: LearningCategory.MATH,
    prompt: '뺄셈 암산: "100 - 37 = ?"',
    correctAnswer: '63',
    wrongAnswers: ['53', '67', '73']
  },
  {
    id: 'math-8',
    category: LearningCategory.MATH,
    prompt: '나눗셈 퀴즈: "81 ÷ 9 = ?"',
    correctAnswer: '9',
    wrongAnswers: ['8', '7', '11']
  },
  {
    id: 'math-9',
    category: LearningCategory.MATH,
    prompt: '구구단 퀴즈: "8 × 7 = ?"',
    correctAnswer: '56',
    wrongAnswers: ['49', '54', '64']
  },
  {
    id: 'math-10',
    category: LearningCategory.MATH,
    prompt: '혼합 연산: "12 × 5 + 10 = ?"',
    correctAnswer: '70',
    wrongAnswers: ['60', '80', '65']
  },
  {
    id: 'math-11',
    category: LearningCategory.MATH,
    prompt: '제곱 암산: "11 × 11 = ?"',
    correctAnswer: '121',
    wrongAnswers: ['111', '122', '144']
  },
  {
    id: 'math-12',
    category: LearningCategory.MATH,
    prompt: '덧셈 연산: "145 + 55 = ?"',
    correctAnswer: '200',
    wrongAnswers: ['190', '210', '205']
  },

  // 🧪 Science & Trivia
  {
    id: 'sci-1',
    category: LearningCategory.SCIENCE,
    prompt: '과학 퀴즈: "물의 화학 원소 기호는?"',
    correctAnswer: 'H2O',
    wrongAnswers: ['CO2', 'O2', 'NaCl']
  },
  {
    id: 'sci-2',
    category: LearningCategory.SCIENCE,
    prompt: '우주 퀴즈: "태양계에서 가장 거대한 행성은?"',
    correctAnswer: '목성',
    wrongAnswers: ['토성', '지구', '화성']
  },
  {
    id: 'sci-3',
    category: LearningCategory.SCIENCE,
    prompt: '지리 상식: "프랑스의 수도는 어디인가요?"',
    correctAnswer: '파리',
    wrongAnswers: ['런던', '베를린', '로마']
  },
  {
    id: 'sci-4',
    category: LearningCategory.SCIENCE,
    prompt: '자연 과학: "빛의 굴절로 생기는 무지개 색상은 몇 가지?"',
    correctAnswer: '7가지',
    wrongAnswers: ['6가지', '8가지', '5가지']
  },
  {
    id: 'sci-5',
    category: LearningCategory.SCIENCE,
    prompt: '환경 과학: "식물이 햇빛과 화학 작용으로 양분을 만드는 현상은?"',
    correctAnswer: '광합성',
    wrongAnswers: ['호흡', '증산', '연소']
  },
  {
    id: 'sci-6',
    category: LearningCategory.SCIENCE,
    prompt: '생활 과학: "우리 몸의 약 70%를 차지하는 기본 물질은?"',
    correctAnswer: '물',
    wrongAnswers: ['단백질', '지방', '산소']
  },
  {
    id: 'sci-7',
    category: LearningCategory.SCIENCE,
    prompt: '자연 과학: "지구가 태양을 한 바퀴 도는 공전 주기는 얼마일까요?"',
    correctAnswer: '1년',
    wrongAnswers: ['1달', '하루', '10년']
  },
  {
    id: 'sci-8',
    category: LearningCategory.SCIENCE,
    prompt: '생활 과학: "상처를 소독할 때 주로 쓰며 H2O2 기호를 가진 액체는?"',
    correctAnswer: '과산화수소수',
    wrongAnswers: ['에탄올', '식초', '소금물']
  },
  {
    id: 'sci-9',
    category: LearningCategory.SCIENCE,
    prompt: '지리 상식: "세계에서 가장 넓은 면적을 가진 국가는 어디일까요?"',
    correctAnswer: '러시아',
    wrongAnswers: ['캐나다', '미국', '중국']
  },
  {
    id: 'sci-10',
    category: LearningCategory.SCIENCE,
    prompt: '의료 상식: "우리 몸에서 해독 작용을 담당하는 내부 기관은?"',
    correctAnswer: '간',
    wrongAnswers: ['심장', '폐', '위장']
  }
];

export function getRandomQuestion(category?: LearningCategory, excludeId?: string): Question {
  let list = QUESTIONS_DATABASE;
  if (category) {
    list = list.filter(q => q.category === category);
  }
  if (excludeId) {
    list = list.filter(q => q.id !== excludeId);
  }
  if (list.length === 0) list = QUESTIONS_DATABASE;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
