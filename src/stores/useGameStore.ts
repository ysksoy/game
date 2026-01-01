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

    // Mobile Touch Controls
    touchControls: { left: boolean; right: boolean; jump: boolean };
    setTouchControls: (controls: Partial<{ left: boolean; right: boolean; jump: boolean }>) => void;

    // Player Selection
    selectedPlayer: 'soy' | 'rin' | null;
    setSelectedPlayer: (player: 'soy' | 'rin') => void;
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    isGameOver: false,
    version: 0,
    gliderBody: null,
    isGliderRunning: false,
    gameStatus: 'ready' as 'ready' | 'playing' | 'cleared' | 'failed',
    timeRemaining: 30,
    selectedPlayer: null,

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
        selectedPlayer: null, // Reset player selection
        version: state.version + 1,
    })),
    setGliderBody: (body) => set({ gliderBody: body }),
    setGliderRunning: (status) => set({ isGliderRunning: status }),

    touchControls: { left: false, right: false, jump: false },
    setTouchControls: (controls) =>
        set((state) => ({
            touchControls: { ...state.touchControls, ...controls },
        })),

    setSelectedPlayer: (player) => set({ selectedPlayer: player }),
}));
