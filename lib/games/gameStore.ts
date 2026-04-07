import { create } from 'zustand'

export interface GameState {
  currentGameType: string | null
  score: number
  correctAnswers: number
  incorrectAnswers: number
  consecutiveCorrect: number
  startTime: number | null
  currentItemIndex: number
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2

  // Actions
  startGame: (gameType: string) => void
  endGame: () => void
  addScore: (points: number) => void
  resetScore: () => void
  incrementCorrect: () => void
  incrementIncorrect: () => void
  incrementStreak: () => void
  resetStreak: () => void
  setCurrentItem: (index: number) => void
  nextItem: () => void
  addPlayer1Score: (points: number) => void
  addPlayer2Score: (points: number) => void
  switchPlayer: () => void
  resetPlayers: () => void
}

export const useGameStore = create<GameState>((set) => ({
  currentGameType: null,
  score: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  consecutiveCorrect: 0,
  startTime: null,
  currentItemIndex: 0,
  player1Score: 0,
  player2Score: 0,
  currentPlayer: 1,

  startGame: (gameType: string) =>
    set({
      currentGameType: gameType,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      consecutiveCorrect: 0,
      startTime: Date.now(),
      currentItemIndex: 0,
      player1Score: 0,
      player2Score: 0,
      currentPlayer: 1,
    }),

  endGame: () =>
    set({
      currentGameType: null,
      startTime: null,
    }),

  addScore: (points: number) =>
    set((state) => ({
      score: state.score + points,
    })),

  resetScore: () =>
    set({
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      consecutiveCorrect: 0,
    }),

  incrementCorrect: () =>
    set((state) => ({
      correctAnswers: state.correctAnswers + 1,
    })),

  incrementIncorrect: () =>
    set((state) => ({
      incorrectAnswers: state.incorrectAnswers + 1,
    })),

  incrementStreak: () =>
    set((state) => ({
      consecutiveCorrect: state.consecutiveCorrect + 1,
    })),

  resetStreak: () =>
    set({
      consecutiveCorrect: 0,
    }),

  setCurrentItem: (index: number) =>
    set({
      currentItemIndex: index,
    }),

  nextItem: () =>
    set((state) => ({
      currentItemIndex: state.currentItemIndex + 1,
    })),

  addPlayer1Score: (points: number) =>
    set((state) => ({
      player1Score: state.player1Score + points,
    })),

  addPlayer2Score: (points: number) =>
    set((state) => ({
      player2Score: state.player2Score + points,
    })),

  switchPlayer: () =>
    set((state) => ({
      currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    })),

  resetPlayers: () =>
    set({
      player1Score: 0,
      player2Score: 0,
      currentPlayer: 1,
    }),
}))
