"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls, OrbitControls, Environment, Sky, SoftShadows, Loader } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { Player } from "@/components/game/Player";
import { Level } from "@/components/game/Level";
import { TimerHUD } from "@/components/game/TimerHUD";
import { StartButton } from "@/components/game/StartButton";
import { TouchControls } from "@/components/game/TouchControls";

export default function Home() {
  const [resetKey, setResetKey] = useState(0);
  const [cameraFov, setCameraFov] = useState(40);
  const [cameraDistance, setCameraDistance] = useState(15);

  // Adjust camera for mobile landscape mode
  useEffect(() => {
    const updateCamera = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;

      // If aspect ratio is very wide (landscape mobile), increase FOV and zoom out
      if (aspectRatio > 1.5) {
        // Mobile landscape (e.g., 16:9 = 1.78, 18:9 = 2.0)
        setCameraFov(60); // Wider field of view
        setCameraDistance(18); // Pull camera back more
      } else {
        // Desktop or tablet
        setCameraFov(40);
        setCameraDistance(15);
      }
    };

    updateCamera();
    window.addEventListener('resize', updateCamera);
    return () => window.removeEventListener('resize', updateCamera);
  }, []);

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "w", "W"] },
    { name: "backward", keys: ["ArrowDown", "s", "S"] },
    { name: "left", keys: ["ArrowLeft", "a", "A"] },
    { name: "right", keys: ["ArrowRight", "d", "D"] },
    { name: "jump", keys: ["Space"] },
    { name: "dash", keys: ["Shift"] },
  ];

  return (
    <>
      <main className="relative h-screen w-screen overflow-hidden bg-black">
        <KeyboardControls map={keyboardMap}>
          <Canvas
            shadows
            camera={{ position: [0, 2, cameraDistance], fov: cameraFov }}
            dpr={[1, 2]} // Support high DPI
          >
            <fog attach="fog" args={["#bae6fd", 10, 500]} />
            <color attach="background" args={["#bae6fd"]} />

            <Suspense fallback={null}>
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
              />

              {/* Soft Shadows removed due to shader error in Three.js r160+ environment. 
                  Using standard shadows instead. */}

              {/* Environment */}
              <Environment preset="sunset" blur={0.8} />
              {/* Sky removed to allow solid background color */}

              <Physics gravity={[0, -20, 0]} key={resetKey}>
                <Player resetGame={() => setResetKey((prev) => prev + 1)} />
                <Level />
              </Physics>

              {/* Temporary OrbitControls for debugging, user can disable later if strict camera is needed */}
              {/* <OrbitControls /> */}
            </Suspense>
          </Canvas>
        </KeyboardControls>

        <div className="absolute top-4 left-4 text-white font-mono pointer-events-none select-none">
          <h1 className="text-xl font-bold">2.5D Platformer Proto</h1>
          <p className="text-sm opacity-70">WASD to Move | Space to Jump</p>
        </div>

        <TouchControls />
        {/* TimerHUD has z-[9999] but needs to be inside a container that doesn't hide it */}
        <TimerHUD />
        <StartButton />
        <Loader />
      </main>
    </>
  );
}
