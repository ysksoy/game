"use client";

import { useGameStore } from "@/stores/useGameStore";
import { useEffect, useState, useRef } from "react";

export function TouchControls() {
    const setTouchControls = useGameStore((state) => state.setTouchControls);
    const [isMobile, setIsMobile] = useState(false);
    const [joystickActive, setJoystickActive] = useState(false);
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const joystickStartPos = useRef({ x: 0, y: 0 });
    const joystickTouchId = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            // Simple check for touch devices
            return "ontouchstart" in window || navigator.maxTouchPoints > 0;
        };
        setIsMobile(checkMobile());
    }, []);

    if (!isMobile) return null;

    // Virtual Joystick handlers
    const handleJoystickStart = (e: React.TouchEvent) => {
        e.preventDefault();
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
        if (!joystickActive || joystickTouchId.current === null) return;

        const touch = Array.from(e.touches).find(
            (t) => t.identifier === joystickTouchId.current
        );
        if (!touch) return;

        const deltaX = touch.clientX - joystickStartPos.current.x;
        const deltaY = touch.clientY - joystickStartPos.current.y;

        // Limit joystick movement to a circle
        const maxDistance = 50;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const limitedX = distance > maxDistance ? (deltaX / distance) * maxDistance : deltaX;
        const limitedY = distance > maxDistance ? (deltaY / distance) * maxDistance : deltaY;

        setJoystickPosition({ x: limitedX, y: limitedY });

        // Determine direction based on joystick position
        const threshold = 15; // Minimum movement to register
        const left = limitedX < -threshold;
        const right = limitedX > threshold;

        setTouchControls({ left, right });
    };

    const handleJoystickEnd = (e: React.TouchEvent) => {
        e.preventDefault();
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
        setTouchControls({ jump: true });
    };

    const handleJumpEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        setTouchControls({ jump: false });
    };

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none select-none touch-none">
            {/* Landscape Warning Overlay - Visible only in portrait */}
            <div className="portrait:flex hidden fixed inset-0 bg-black/90 z-[100] flex-col items-center justify-center text-white p-4 text-center pointer-events-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mb-4 animate-spin-pulse"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                </svg>
                <p className="text-xl font-bold">Please rotate your device</p>
                <p className="text-sm opacity-70 mt-2">Landscape mode is required to play</p>
            </div>

            {/* Touch Controls - Visible only in landscape */}
            <div className="landscape:block hidden w-full h-full">
                {/* Virtual Joystick - Left Side */}
                <div
                    className="absolute bottom-8 left-8 w-32 h-32 pointer-events-auto"
                    onTouchStart={handleJoystickStart}
                    onTouchMove={handleJoystickMove}
                    onTouchEnd={handleJoystickEnd}
                    onTouchCancel={handleJoystickEnd}
                >
                    {/* Joystick Base */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20 flex items-center justify-center">
                        {/* Joystick Stick */}
                        <div
                            className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/50 transition-all"
                            style={{
                                transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
                                opacity: joystickActive ? 1 : 0.6,
                            }}
                        />
                    </div>
                </div>

                {/* Jump Area - Right Half of Screen */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-auto"
                    onTouchStart={handleJumpStart}
                    onTouchEnd={handleJumpEnd}
                    onTouchCancel={handleJumpEnd}
                >
                    {/* Visual indicator in bottom right corner */}
                    <div className="absolute bottom-8 right-8 pointer-events-none">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-10 h-10 text-white"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                                </svg>
                            </div>
                            <span className="text-white text-xs font-bold opacity-70">TAP TO JUMP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
