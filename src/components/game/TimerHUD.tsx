"use client";

import { useGameStore } from "@/stores/useGameStore";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function TimerHUD() {
    const timeRemaining = useGameStore(state => state.timeRemaining);
    const [mounted, setMounted] = useState(false);

    // Format: "12.1"
    const formattedTime = Math.max(0, timeRemaining).toFixed(1);

    useEffect(() => {
        setMounted(true);
    }, []);

    const content = (
        <div
            style={{
                position: 'fixed',
                top: '32px',
                right: '32px',
                zIndex: 99999,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            <span
                style={{
                    fontFamily: 'var(--font-orbitron), monospace',
                    fontSize: '4rem',
                    color: 'white',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 20px rgba(100,200,255,0.8), 0 0 40px rgba(100,200,255,0.4)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 'bold',
                }}
            >
                {formattedTime}
            </span>
        </div>
    );

    // Use portal to render directly to body, bypassing any stacking context from Canvas
    if (!mounted) return null;
    return createPortal(content, document.body);
}
