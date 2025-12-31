"use client";

import { useGameStore } from "@/stores/useGameStore";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function StartButton() {
    const gameStatus = useGameStore(state => state.gameStatus);
    const setGameStatus = useGameStore(state => state.setGameStatus);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleStart = () => {
        setGameStatus('playing');
    };

    // Only show when game is in 'ready' state
    if (gameStatus !== 'ready') return null;

    const content = (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 99999,
            }}
        >
            <button
                onClick={handleStart}
                style={{
                    padding: '20px 60px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: '4px solid white',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.6)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-orbitron), monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(239, 68, 68, 0.8)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.6)';
                }}
            >
                START
            </button>
        </div>
    );

    if (!mounted) return null;
    return createPortal(content, document.body);
}
