"use client";

import * as THREE from "three";
import { RigidBody, RapierRigidBody, CylinderCollider, CuboidCollider } from "@react-three/rapier";
import { Float, useTexture, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import { useGameStore } from "@/stores/useGameStore";
import CryptoJS from "crypto-js";

// ========================================
// 暗号化されたギフトコード
// scripts/encrypt-gift-code-dual.js で生成した文字列をここに貼り付けてください
// ========================================
// れお用のギフトコード（合言葉: あけましておめでとう）
const ENCRYPTED_GIFT_CODE_SOY = "U2FsdGVkX1/1e+SW3vP1KaDaHaWCf5UpXDe1cYbBr/qg1ulBDLKCvHloP7QlnZN5";

// かい用のギフトコード（合言葉: ことしもよろしくねーー）
const ENCRYPTED_GIFT_CODE_RIN = "U2FsdGVkX19G04E4DENh4lSHABXADplHWEg0F0o3kHWN3xzRP2n6xabk6NLmXuwA";

export function Level() {
    const setGliderBody = useGameStore((state) => state.setGliderBody);
    const grassTexture = useTexture("/textures/grass.png");
    const { scene: treeScene } = useGLTF("/models/tree.glb");
    const { scene: trampolineScene } = useGLTF("/models/tranpolin.glb");
    const { scene: mountainScene } = useGLTF("/models/mountain.glb");
    const fishBoneRef = useRef<RapierRigidBody>(null);
    const seesawRef = useRef<RapierRigidBody>(null);
    const gliderRef = useRef<RapierRigidBody>(null);
    const isGliderRunning = useGameStore((state) => state.isGliderRunning);
    const setGliderRunning = useGameStore((state) => state.setGliderRunning);
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const setTimeRemaining = useGameStore((state) => state.setTimeRemaining);
    const gliderProgress = useRef(0);

    // Game starts in 'ready' state, waiting for start button

    // Sync glider body to store for player attachment
    useEffect(() => {
        if (gliderRef.current) {
            setGliderBody(gliderRef.current);
        }
    }, []);

    // ゲームクリア時の処理：ギフトコードの復号と表示
    const gameStatus = useGameStore((state) => state.gameStatus);
    const selectedPlayer = useGameStore((state) => state.selectedPlayer);
    const hasShownGiftCode = useRef(false);

    useEffect(() => {
        if (gameStatus === 'cleared' && !hasShownGiftCode.current) {
            hasShownGiftCode.current = true;

            // 選択されたプレイヤーに応じて暗号化コードを選択
            const encryptedCode = selectedPlayer === 'soy' ? ENCRYPTED_GIFT_CODE_SOY : ENCRYPTED_GIFT_CODE_RIN;
            const playerName = selectedPlayer === 'soy' ? 'れお' : 'かい';

            // 少し遅延させてからプロンプトを表示（ゲームクリアの演出が見えるように）
            setTimeout(() => {
                const passphrase = window.prompt(`🎉 ${playerName}さん、ゲームクリアおめでとうございます！\n\n合言葉を入力してください：`);

                if (passphrase === null) {
                    // キャンセルされた場合
                    return;
                }

                if (passphrase.trim() === '') {
                    alert('合言葉が入力されていません。');
                    return;
                }

                try {
                    // 復号を試みる
                    const decrypted = CryptoJS.AES.decrypt(encryptedCode, passphrase).toString(CryptoJS.enc.Utf8);

                    if (decrypted && decrypted.length > 0) {
                        // 復号成功
                        alert(`🎁 ${playerName}さんへのお年玉です！\n\nAmazonギフトコード：\n${decrypted}\n\nおめでとうございます！`);
                    } else {
                        // 復号失敗（空文字列）
                        alert('❌ 合言葉が違います。');
                    }
                } catch (error) {
                    // 復号エラー
                    alert('❌ 合言葉が違います。');
                }
            }, 1000);
        }

        // ゲームがリスタートされたらフラグをリセット
        if (gameStatus === 'ready') {
            hasShownGiftCode.current = false;
        }
    }, [gameStatus, selectedPlayer]);

    // Define the S-shaped curve path
    // Memoize the curve so it's not recreated every render
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(135.5, 7, 0),
            new THREE.Vector3(140.5, 4, 0),
            new THREE.Vector3(145.5, 7, 0),
            new THREE.Vector3(150.5, 5, 0),
            new THREE.Vector3(155.5, 5, 0)
        ]);
    }, []);

    // Wall Geometry (Warped Wall)
    const wallGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(6, 0); // Run-up area (Flat)

        // The Curve: Transition from flat to vertical
        // Start at x=6, y=0.
        // Target top: x=12, y=6.75 (6m run, 6.75m rise)
        // Control points to ensure smooth verticality:
        shape.bezierCurveTo(10.5, 0, 12, 3.75, 12, 6.75);

        // Top Platform
        shape.lineTo(14.25, 6.75);
        // Back down to close the shape
        shape.lineTo(14.25, 0);
        shape.lineTo(0, 0);

        // Extrude
        const geom = new THREE.ExtrudeGeometry(shape, { depth: 12, bevelEnabled: false });
        // Center the geometry along Z (Depth 0..12 -> -6..6) to align with runway
        geom.translate(0, 0, -6);
        return geom;
    }, []);

    // Configure texture repeating
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(4, 4);

    useFrame((state, delta) => {
        if (fishBoneRef.current) {
            // Rotate around X-axis continually
            fishBoneRef.current.setAngvel({ x: 1.2, y: 0, z: 0 }, true);
        }

        if (seesawRef.current) {
            const time = state.clock.elapsedTime;
            const angle = Math.sin(time * 1.5) * (Math.PI / 6); // Swing +/- 30 degrees
            const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, angle));
            seesawRef.current.setNextKinematicRotation(q);
        }

        if (gliderRef.current) {
            let t = 0;
            if (isGliderRunning) {
                // Increment progress based on time delta
                gliderProgress.current += delta;

                // Speed control: 2.0 factor (10x faster)
                const speed = 2.0;
                t = (Math.sin(gliderProgress.current * speed - Math.PI / 2) + 1) / 2;
            } else {
                t = 0;
                gliderProgress.current = 0;
            }

            const point = curve.getPointAt(t);
            gliderRef.current.setNextKinematicTranslation({ x: point.x, y: point.y - 2, z: 0 });
        }

        // Timer Logic
        const { gameStatus, timeRemaining } = useGameStore.getState();
        if (gameStatus === 'playing') {
            const newTime = Math.max(0, timeRemaining - delta);
            setTimeRemaining(newTime);
            if (newTime <= 0) {
                setGameStatus('failed');
            }
        }
    });

    return (
        <>
            <RigidBody type="fixed" friction={1}>
                {/* Start Platform - Grass */}
                <mesh position={[0, -1, 0]} receiveShadow>
                    <boxGeometry args={[10, 2, 8]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>
            </RigidBody>

            {/* SASUKE Area 1: Triangle Seesaw */}
            {/* The seesaw body */}
            <RigidBody
                ref={seesawRef}
                position={[18.5, 0, 0]}
                type="kinematicPosition"
                colliders="hull"
                friction={0.5}
                restitution={0}
            >
                {/* The Top Surface (Walking area) */}
                <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
                    <boxGeometry args={[12, 0.5, 4]} />
                    <meshStandardMaterial color="#fbbf24" /> {/* Yellow */}
                </mesh>

                {/* The Triangle Body (decoration/collider shape) */}
                <mesh position={[0, -1.75, 0]} rotation={[0, 0, Math.PI]} castShadow receiveShadow>
                    <coneGeometry args={[2, 3.5, 4]} /> {/* 4 segments = pyramid, looks structurally sound */}
                    <meshStandardMaterial color="#1f2937" /> {/* Black/Dark Grey */}
                </mesh>

                {/* Side markings for SASUKE feel */}
                <mesh position={[-5, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1, 3]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[5, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1, 3]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </RigidBody>

            {/* Landing Platform (Rest Area) */}
            <RigidBody position={[40.5, -1, 0]} type="fixed" friction={1}>
                <mesh receiveShadow>
                    <boxGeometry args={[8, 2, 8]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>
            </RigidBody>

            {/* SASUKE Area 2: Podium Steps */}
            <RigidBody position={[58.5, 0, 0]} type="fixed" friction={1}>
                {/* 1. Bronze Step (Left) - Top Y=2 */}
                <mesh position={[-8, -0.5, 0]} receiveShadow>
                    <boxGeometry args={[4, 5, 8]} /> {/* P=-0.5, H=5 -> Top=2, Bottom=-3 */}
                    <meshStandardMaterial color="#cd7f32" /> {/* Bronze */}
                </mesh>

                {/* 2. Silver Step (Left) - Top Y=4 */}
                <mesh position={[-4, 0.5, 0]} receiveShadow>
                    <boxGeometry args={[4, 7, 8]} /> {/* P=0.5, H=7 -> Top=4, Bottom=-3 */}
                    <meshStandardMaterial color="#94a3b8" /> {/* Silver */}
                </mesh>

                {/* 3. Gold Step (Center) - Top Y=6 */}
                <mesh position={[0, 1.5, 0]} receiveShadow>
                    <boxGeometry args={[4, 9, 8]} /> {/* P=1.5, H=9 -> Top=6, Bottom=-3 */}
                    <meshStandardMaterial color="#fbbf24" /> {/* Gold */}
                </mesh>

                {/* 4. Silver Step (Right) - Top Y=4 */}
                <mesh position={[4, 0.5, 0]} receiveShadow>
                    <boxGeometry args={[4, 7, 8]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>

                {/* 5. Bronze Step (Right) - Top Y=2 */}
                <mesh position={[8, -0.5, 0]} receiveShadow>
                    <boxGeometry args={[4, 5, 8]} />
                    <meshStandardMaterial color="#cd7f32" />
                </mesh>
            </RigidBody>

            {/* Landing Platform after Steps */}
            <RigidBody position={[72.5, -1, 0]} type="fixed" friction={1}>
                <mesh receiveShadow>
                    <boxGeometry args={[8, 2, 8]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>
            </RigidBody>

            {/* SASUKE Area 3: Fish Bone */}
            {/* An unstable rotating spine with cross-bars */}
            <RigidBody
                ref={fishBoneRef}
                position={[92.5, 0, 0]}
                type="kinematicVelocity"
                colliders={false}
                // enabledRotations and lockTranslations are handled by kinematic type implicitly for setting velocities, 
                // but we keep locks just in case, though kinematic bodies are controlled manually.
                friction={1}
            >
                {/* Visual Pivot Points */}
                <mesh position={[-10.5, 0, 0]}>
                    <sphereGeometry args={[0.5]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[10.5, 0, 0]}>
                    <sphereGeometry args={[0.5]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>

                {/* Main Spine (Axis) - Red */}
                <CylinderCollider args={[10, 0.6]} rotation={[0, 0, Math.PI / 2]} />
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.6, 0.6, 20]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>

                {/* Bones (Ribs) - Cross bars */}
                {[...Array(6)].map((_, i) => (
                    <group key={i} position={[i * 3 - 7.5, 0, 0]}>
                        {/* Horizontal Bar (Yellow) */}
                        <CuboidCollider args={[0.25, 0.2, 4.5]} />
                        <mesh rotation={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.5, 0.4, 9]} /> {/* Wide bar */}
                            <meshStandardMaterial color="#fbbf24" />
                        </mesh>
                        {/* Vertical Bar (Black) - Creating a Cross shape */}
                        <CuboidCollider args={[0.25, 0.2, 4.5]} rotation={[Math.PI / 2, 0, 0]} />
                        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.5, 0.4, 9]} />
                            <meshStandardMaterial color="#1f2937" />
                        </mesh>
                    </group>
                ))}
            </RigidBody>

            {/* End Goal Platform of Fish Bone / Start of Dragon Glider */}
            <RigidBody position={[115.5, -1, 0]} type="fixed" friction={1}>
                <mesh receiveShadow>
                    <boxGeometry args={[8, 2, 8]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>
            </RigidBody>

            {/* SASUKE Area 4: Dragon Glider */}
            {/* 1. Trampoline / Launch Pad */}
            <RigidBody position={[123.5, -1, 0]} type="fixed" restitution={1.5} colliders={false}>
                <CuboidCollider
                    args={[2, 1, 2]}
                    onCollisionEnter={({ other }) => {
                        if (other.rigidBody) {
                            other.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true); // Reset current vel to avoid dampening
                            other.rigidBody.applyImpulse({ x: 0, y: 25, z: 0 }, true);
                        }
                    }}
                />
                <primitive object={trampolineScene.clone()} scale={4} position={[0, -1, 0]} />
            </RigidBody>

            {/* 2. The Rail (Visual + Static Collider for the glider, but we use kinematic glider for stability) */}
            {/* Visual Rail: Tube following the curve */}
            <mesh>
                <tubeGeometry args={[curve, 64, 0.2, 8, false]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>

            {/* 3. The Glider (Moving Platform) */}
            {/* Managed by a separate component or we add logic in useFrame for a second ref. 
                Let's add a second ref and logic. */}
            <RigidBody
                ref={gliderRef}
                position={[135.5, 6, 0]} // Start position
                type="kinematicPosition" // We control position directly
                colliders={false} // Manual colliders
                friction={1}
                ccd
            >
                {/* SENSOR for Activation - Reliably detects player contact */}
                <CuboidCollider
                    args={[1, 1, 2]}
                    position={[0, 0.5, 0]}
                    sensor
                    onIntersectionEnter={() => { setGliderRunning(true); }}
                />

                {/* Physical Colliders matching visuals */}
                {/* Vertical Stem */}
                <CylinderCollider args={[1, 0.1]} position={[0, 1, 0]} />

                {/* Horizontal Handle Bar (Along Z axis) */}
                <CylinderCollider args={[1.5, 0.2]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />



                {/* Stoppers (Disks at ends) */}
                <CylinderCollider args={[0.05, 0.4]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.4]} />
                <CylinderCollider args={[0.05, 0.4]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.4]} />

                {/* Visuals */}
                <group>
                    {/* Vertical stem */}
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 2]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                    {/* Horizontal Handle (Footrest/Handhold) */}
                    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 3]} />
                        <meshStandardMaterial color="#fbbf24" />
                        {/* Stoppers */}
                        <mesh position={[0, 1.4, 0]}>
                            <cylinderGeometry args={[0.4, 0.4, 0.1]} />
                            <meshStandardMaterial color="#ef4444" />
                        </mesh>
                        <mesh position={[0, -1.4, 0]}>
                            <cylinderGeometry args={[0.4, 0.4, 0.1]} />
                            <meshStandardMaterial color="#ef4444" />
                        </mesh>
                    </mesh>


                    {/* Top Slider Visual */}
                    <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.3, 0.3, 1]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                </group>
            </RigidBody>

            {/* Landing Platform */}
            <RigidBody position={[175.5, -2, 0]} type="fixed" friction={1}>
                <mesh receiveShadow>
                    <boxGeometry args={[10, 4, 8]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>

            </RigidBody>

            {/* SASUKE Area 5: Warped Wall (Soritatsu Kabe) */}
            <RigidBody position={[186.5, 0, 0]} type="fixed" colliders="trimesh" friction={1}>
                {/* The Main Wall (Wood) */}
                <mesh geometry={wallGeometry} receiveShadow castShadow>
                    <meshStandardMaterial color="black" /> {/* Black */}
                </mesh>



                {/* Top Lip (Red) - Visual Cue */}
                <mesh position={[12, 6.75, 0]}>
                    <boxGeometry args={[0.3, 0.3, 12]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
            </RigidBody>

            {/* Final Wall (Extra Challenge) */}
            <RigidBody position={[206.5, 0, 0]} type="fixed" colliders="trimesh" friction={1}>
                <mesh geometry={wallGeometry} receiveShadow castShadow>
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[12, 6.75, 0]}>
                    <boxGeometry args={[0.3, 0.3, 12]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
            </RigidBody>

            {/* Goal Line Structure */}
            <RigidBody position={[225, 3.5, 0]} type="fixed" colliders={false}>
                {/* Left Post */}
                <CuboidCollider args={[0.3, 3.5, 0.3]} position={[-3, 0, 0]} />
                <mesh position={[-3, 0, 0]} castShadow>
                    <boxGeometry args={[0.6, 7, 0.6]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>

                {/* Right Post */}
                <CuboidCollider args={[0.3, 3.5, 0.3]} position={[3, 0, 0]} />
                <mesh position={[3, 0, 0]} castShadow>
                    <boxGeometry args={[0.6, 7, 0.6]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>

                {/* Top Bar */}
                <mesh position={[0, 3.5, 0]} castShadow>
                    <boxGeometry args={[6.6, 0.6, 0.6]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>

                {/* Checkered Banner */}
                {[...Array(8)].map((_, i) => (
                    <mesh key={i} position={[i * 0.75 - 2.625, 2, 0]}>
                        <boxGeometry args={[0.75, 3, 0.1]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? "white" : "black"}
                            transparent
                            opacity={0.9}
                        />
                    </mesh>
                ))}

                {/* "GOAL" Text Sign */}
                <mesh position={[0, 5, 0]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[4, 1, 0.2]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                </mesh>
            </RigidBody>

            {/* Goal Switch */}
            <RigidBody position={[226.5, 6.75, 0]} type="fixed" colliders={false}>
                {/* Sensor */}
                <CuboidCollider
                    args={[1, 1, 1]}
                    sensor
                    onIntersectionEnter={({ other }) => {
                        if (useGameStore.getState().gameStatus === 'playing') {
                            setGameStatus('cleared');
                        }
                    }}
                />

                {/* Visual Button */}
                <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.2]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 0.1]} />
                    <meshStandardMaterial color="gray" />
                </mesh>
            </RigidBody>
            <group position={[0, 0, -10]}>
                {/* Mountains */}
                {[...Array(7)].map((_, i) => (
                    <group key={`mountain-${i}`} position={[i * 50 - 100, -10, -60]} scale={130}>
                        <primitive object={mountainScene.clone()} />
                    </group>
                ))}



                {/* Clouds */}
                {[...Array(5)].map((_, i) => (
                    <Float key={`cloud-${i}`} speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[i * 15 - 10, 10 + Math.random() * 2, -5]}>
                        <group scale={[Math.random() * 0.5 + 1, Math.random() * 0.5 + 1, 1]}>
                            <mesh position={[0, 0, 0]}>
                                <sphereGeometry args={[1.5, 16, 16]} />
                                <meshStandardMaterial color="white" transparent opacity={0.8} />
                            </mesh>
                            <mesh position={[1.5, 0.2, 0]}>
                                <sphereGeometry args={[1.2, 16, 16]} />
                                <meshStandardMaterial color="white" transparent opacity={0.8} />
                            </mesh>
                            <mesh position={[-1.5, 0.1, 0]}>
                                <sphereGeometry args={[1.3, 16, 16]} />
                                <meshStandardMaterial color="white" transparent opacity={0.8} />
                            </mesh>
                        </group>
                    </Float>
                ))}
            </group>




        </>
    );
}
