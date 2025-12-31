"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, RapierRigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import { useKeyboardControls, useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/stores/useGameStore";

export function Player({ resetGame }: { resetGame?: () => void }) {
    const rigidBody = useRef<RapierRigidBody>(null);
    const { rapier, world } = useRapier();
    const jumpCount = useRef(0);
    const prevJump = useRef(false);
    const [, get] = useKeyboardControls();
    const playerRef = useRef<THREE.Group>(null);

    // Randomly select character model
    const [selectedModel] = useState(() => {
        return Math.random() < 0.5 ? "/models/soy.glb" : "/models/rin.glb";
    });
    const { scene } = useGLTF(selectedModel);

    // Constants
    const MOVEMENT_SPEED = 5;
    const JUMP_FORCE = 8;
    const MAX_VELOCITY = 10;
    const ACCELERATION = 2.0; // Increased to ensure movement
    const DRAG = 0.8;

    // Game State
    const restart = useGameStore((state) => state.restart);
    const version = useGameStore((state) => state.version);
    const gliderBody = useGameStore((state) => state.gliderBody);
    const setGliderRunning = useGameStore((state) => state.setGliderRunning);
    const [isHanging, setHanging] = useState(false);
    const attachCooldown = useRef(0);

    // Reset position when version changes (restart)
    useEffect(() => {
        if (rigidBody.current) {
            rigidBody.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
            rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            setHanging(false);
            attachCooldown.current = 0;
        }
    }, [version]);

    useFrame((state, delta) => {
        if (!rigidBody.current) return;

        const { left, right, jump } = get();
        const translation = rigidBody.current.translation();

        // Get game status - disable movement if not playing
        const gameStatus = useGameStore.getState().gameStatus;
        const canMove = gameStatus === 'playing';

        // Update cooldown
        if (attachCooldown.current > 0) attachCooldown.current -= delta;

        // Combine Keyboard and Touch Controls
        const touch = useGameStore.getState().touchControls;
        const inputLeft = left || touch.left;
        const inputRight = right || touch.right;
        const inputJump = jump || touch.jump;

        // Glider Attachment Logic (only when playing)
        if (gliderBody && canMove) {
            try {
                const gliderPos = gliderBody.translation();

                if (isHanging) {
                    // Stick to Glider
                    rigidBody.current.setTranslation({ x: gliderPos.x, y: gliderPos.y - 0.7, z: 0 }, true);
                    rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

                    // Camera Follow (Tight)
                    state.camera.position.x = gliderPos.x;
                    state.camera.lookAt(gliderPos.x, 4, 0);

                    // Jump to Detach
                    if (inputJump) {
                        setHanging(false);
                        attachCooldown.current = 1.0;

                        // Inherit velocity and avoid collision by shifting forward
                        const gVel = gliderBody.linvel();
                        rigidBody.current.setTranslation({ x: gliderPos.x + 1.0, y: gliderPos.y - 0.7, z: 0 }, true);
                        rigidBody.current.setLinvel({ x: gVel.x, y: gVel.y, z: 0 }, true);
                        rigidBody.current.applyImpulse({ x: 15, y: 10, z: 0 }, true);
                    }
                    return;
                } else if (attachCooldown.current <= 0) {
                    const dx = translation.x - gliderPos.x;
                    const dy = translation.y - gliderPos.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 2.5) {
                        setHanging(true);
                        setGliderRunning(true);
                    }
                }
            } catch (e) { }
        }

        const vel = rigidBody.current.linvel();

        // Check for fall out of bounds
        if (translation.y < -10) {
            restart();
            if (resetGame) resetGame();
            return;
        }

        // Camera Follow
        const cameraTargetX = translation.x;
        state.camera.position.x = THREE.MathUtils.lerp(
            state.camera.position.x,
            cameraTargetX,
            0.1
        );
        // Look above the player to position the character at the bottom of the screen
        // On mobile landscape (wide aspect ratio), look even higher to show more vertical space
        const aspectRatio = state.size.width / state.size.height;
        const lookAtY = aspectRatio > 1.5 ? 6 : 4; // Look higher on mobile landscape
        state.camera.lookAt(cameraTargetX, lookAtY, 0);

        // Only allow movement when game is playing
        if (canMove) {
            let impulseX = 0;

            if (inputRight) {
                impulseX += ACCELERATION;
                if (playerRef.current) playerRef.current.rotation.y = 0; // Face right
            }
            if (inputLeft) {
                impulseX -= ACCELERATION;
                if (playerRef.current) playerRef.current.rotation.y = Math.PI; // Face left
            }

            // Apply movement
            if (impulseX !== 0) {
                if (
                    (impulseX > 0 && vel.x < MAX_VELOCITY) ||
                    (impulseX < 0 && vel.x > -MAX_VELOCITY)
                ) {
                    rigidBody.current.applyImpulse({ x: impulseX, y: 0, z: 0 }, true);
                }
            } else {
                rigidBody.current.setLinvel({ x: vel.x * DRAG, y: vel.y, z: 0 }, true);
            }

            // Jump Logic (Double Jump)
            if (inputJump && !prevJump.current) {
                if (jumpCount.current < 2) {
                    rigidBody.current.setLinvel({ x: vel.x, y: 0, z: 0 }, true);
                    rigidBody.current.applyImpulse({ x: 0, y: JUMP_FORCE * 1.5, z: 0 }, true);
                    jumpCount.current++;
                }
            }
            prevJump.current = inputJump;
        } else {
            // When not playing, apply drag to slow down any existing movement
            rigidBody.current.setLinvel({ x: vel.x * 0.9, y: vel.y, z: 0 }, true);
        }

        // Lock Z
        if (Math.abs(translation.z) > 0.1) {
            rigidBody.current.setTranslation(
                { x: translation.x, y: translation.y, z: 0 },
                true
            );
        }
    });

    return (
        <RigidBody
            ref={rigidBody}
            position={[0, 2, 0]}
            enabledRotations={[false, false, false]}
            onCollisionEnter={() => { jumpCount.current = 0; }}
            colliders={false} // Use manual collider
            friction={0}
            gravityScale={2.5}
            ccd
        >
            <CuboidCollider args={[0.5, 0.5, 0.4]} position={[0, -0.1, 0]} />
            <group ref={playerRef}>
                <primitive
                    object={scene}
                    scale={2.5}
                    position={[0, -0.6, 0]}
                    rotation={[0, 0, 0]}
                />
            </group>
        </RigidBody>
    );
}
