"use client";

import { useGameStore } from "@/stores/useGameStore";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function StartButton() {
    const gameStatus = useGameStore(state => state.gameStatus);
    const selectedPlayer = useGameStore(state => state.selectedPlayer);
    const setSelectedPlayer = useGameStore(state => state.setSelectedPlayer);
    const setGameStatus = useGameStore(state => state.setGameStatus);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePlayerSelect = (player: 'soy' | 'rin') => {
        setSelectedPlayer(player);
        setGameStatus('playing');
    };

    // Only show when game is in 'ready' state and no player is selected
    if (gameStatus !== 'ready' || selectedPlayer !== null) return null;

    const content = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
            }}
        >
            <h1
                style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '3rem',
                    fontFamily: 'var(--font-orbitron), monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
                }}
            >
                プレイヤーを選択
            </h1>

            <div
                style={{
                    display: 'flex',
                    gap: '3rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {/* Leo Button */}
                <button
                    onClick={() => handlePlayerSelect('soy')}
                    style={{
                        padding: '2rem 3rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        border: '4px solid white',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.6)',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-orbitron), monospace',
                        letterSpacing: '0.1em',
                        minWidth: '200px',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(59, 130, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.6)';
                    }}
                >
                    🎮 れお
                </button>

                {/* Kai Button */}
                <button
                    onClick={() => handlePlayerSelect('rin')}
                    style={{
                        padding: '2rem 3rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        border: '4px solid white',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(236, 72, 153, 0.6)',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-orbitron), monospace',
                        letterSpacing: '0.1em',
                        minWidth: '200px',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(236, 72, 153, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(236, 72, 153, 0.6)';
                    }}
                >
                    ⚽ かい
                </button>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(content, document.body);
}
