import { create } from 'zustand';

interface GameState {
    score: number;
    isGameOver: boolean;
    version: number; // Increment this to force a reset/re-mount of components if needed

    incrementScore: (amount?: number) => void;
    setGameOver: (status: boolean) => void;
    restart: () => void;

    // Glider interaction
    gliderBody: any | null; // RapierRigidBody
    setGliderBody: (body: any | null) => void;

    isGliderRunning: boolean;
    setGliderRunning: (status: boolean) => void;

    gameStatus: 'ready' | 'playing' | 'cleared' | 'failed';
    setGameStatus: (status: 'ready' | 'playing' | 'cleared' | 'failed') => void;
    timeRemaining: number;
    setTimeRemaining: (time: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    isGameOver: false,
    version: 0,
    gliderBody: null,
    isGliderRunning: false,
    gameStatus: 'ready' as 'ready' | 'playing' | 'cleared' | 'failed',
    timeRemaining: 30,

    incrementScore: (amount = 1) => set((state) => ({ score: state.score + amount })),
    setGameOver: (status) => set({ isGameOver: status }),
    setGameStatus: (status) => set({ gameStatus: status }),
    setTimeRemaining: (time) => set({ timeRemaining: time }),

    restart: () => set((state) => ({
        score: 0,
        isGameOver: false,
        gameStatus: 'ready',
        timeRemaining: 30,
        isGliderRunning: false, // Reset glider
        version: state.version + 1,
    })),
    setGliderBody: (body) => set({ gliderBody: body }),
    setGliderRunning: (status) => set({ isGliderRunning: status }),
}));
