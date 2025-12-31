"use client";

import { useGameStore } from "@/stores/useGameStore";
import { useEffect, useState } from "react";

export function TouchControls() {
    const setTouchControls = useGameStore((state) => state.setTouchControls);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Simple check for touch devices
            return "ontouchstart" in window || navigator.maxTouchPoints > 0;
        };
        setIsMobile(checkMobile());
    }, []);

    if (!isMobile) return null;

    const handleTouchStart = (action: "left" | "right" | "jump") => (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling/zooming
        setTouchControls({ [action]: true });
    };

    const handleTouchEnd = (action: "left" | "right" | "jump") => (e: React.TouchEvent) => {
        e.preventDefault();
        setTouchControls({ [action]: false });
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
                {/* Left Control (Move) */}
                <div className="absolute bottom-8 left-8 flex gap-4 pointer-events-auto">
                    <button
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full active:bg-white/40 border-2 border-white/30 flex items-center justify-center transition-colors"
                        onTouchStart={handleTouchStart("left")}
                        onTouchEnd={handleTouchEnd("left")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full active:bg-white/40 border-2 border-white/30 flex items-center justify-center transition-colors"
                        onTouchStart={handleTouchStart("right")}
                        onTouchEnd={handleTouchEnd("right")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Right Control (Jump) */}
                <div className="absolute bottom-8 right-8 pointer-events-auto">
                    <button
                        className="w-24 h-24 bg-red-500/30 backdrop-blur-sm rounded-full active:bg-red-500/50 border-2 border-white/30 flex items-center justify-center transition-colors"
                        onTouchStart={handleTouchStart("jump")}
                        onTouchEnd={handleTouchEnd("jump")}
                    >
                        <span className="text-white font-bold text-lg">JUMP</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
