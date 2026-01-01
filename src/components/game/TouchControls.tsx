"use client";

import { useGameStore } from "@/stores/useGameStore";
import { useEffect, useState, useRef } from "react";

export function TouchControls() {
    const setTouchControls = useGameStore((state) => state.setTouchControls);
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(true);
    const [joystickActive, setJoystickActive] = useState(false);
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const joystickStartPos = useRef({ x: 0, y: 0 });
    const joystickTouchId = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            return "ontouchstart" in window || navigator.maxTouchPoints > 0;
        };

        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };

        setIsMobile(checkMobile());
        checkOrientation();

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (!isMobile) return null;

    // Virtual Joystick handlers
    const handleJoystickStart = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        joystickTouchId.current = touch.identifier;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        joystickStartPos.current = { x: centerX, y: centerY };
        setJoystickActive(true);
    };

    const handleJoystickMove = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!joystickActive || joystickTouchId.current === null) return;

        const touch = Array.from(e.touches).find(
            (t) => t.identifier === joystickTouchId.current
        );
        if (!touch) return;

        const deltaX = touch.clientX - joystickStartPos.current.x;
        const deltaY = touch.clientY - joystickStartPos.current.y;

        const maxDistance = 50;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const limitedX = distance > maxDistance ? (deltaX / distance) * maxDistance : deltaX;
        const limitedY = distance > maxDistance ? (deltaY / distance) * maxDistance : deltaY;

        setJoystickPosition({ x: limitedX, y: limitedY });

        const threshold = 15;
        const left = limitedX < -threshold;
        const right = limitedX > threshold;

        setTouchControls({ left, right });
    };

    const handleJoystickEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touchEnded = Array.from(e.changedTouches).some(
            (t) => t.identifier === joystickTouchId.current
        );
        if (!touchEnded) return;

        setJoystickActive(false);
        setJoystickPosition({ x: 0, y: 0 });
        joystickTouchId.current = null;
        setTouchControls({ left: false, right: false });
    };

    // Right side jump handler
    const handleJumpStart = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTouchControls({ jump: true });
    };

    const handleJumpEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTouchControls({ jump: false });
    };

    // Show portrait warning if not in landscape
    if (!isLandscape) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '16px',
                    textAlign: 'center',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: 64, height: 64, marginBottom: 16 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                </svg>
                <p style={{ fontSize: 20, fontWeight: 'bold' }}>Please rotate your device</p>
                <p style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>Landscape mode is required to play</p>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 50,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            {/* Virtual Joystick - Left Side */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 32,
                    width: 128,
                    height: 128,
                    pointerEvents: 'auto',
                    touchAction: 'none',
                }}
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                onTouchCancel={handleJoystickEnd}
            >
                {/* Joystick Base */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Joystick Stick */}
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
                            opacity: joystickActive ? 1 : 0.7,
                            transition: joystickActive ? 'none' : 'transform 0.1s',
                        }}
                    />
                </div>
            </div>

            {/* Jump Area - Right Half of Screen */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '50%',
                    pointerEvents: 'auto',
                    touchAction: 'none',
                }}
                onTouchStart={handleJumpStart}
                onTouchEnd={handleJumpEnd}
                onTouchCancel={handleJumpEnd}
            >
                {/* Visual indicator in bottom right corner */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        right: 32,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            backgroundColor: 'rgba(239, 68, 68, 0.3)',
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="white"
                            style={{ width: 40, height: 40 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                        </svg>
                    </div>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold', opacity: 0.8 }}>TAP TO JUMP</span>
                </div>
            </div>
        </div>
    );
}
