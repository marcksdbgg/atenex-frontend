// File: components/animations/snakeanimation.tsx (CORREGIDO - Error R3F Hook)
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Text } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';

// --- Constantes (sin cambios) ---
const WORDS_TO_EAT = [
  { id: 'Inicio', pos: new THREE.Vector3(1, 5.5, 0) },
  { id: 'Nosotros', pos: new THREE.Vector3(4, 5.5, 0) },
  { id: 'Contacto', pos: new THREE.Vector3(7, 5.5, 0) },
];
const A_SHAPE_POINTS_INITIAL = [
  new THREE.Vector3(-1.5, -1.5, 0), new THREE.Vector3(-1.5, -0.5, 0),
  new THREE.Vector3(-0.5, 1.5, 0),  new THREE.Vector3(0.5, 1.5, 0),
  new THREE.Vector3(1.5, -0.5, 0), new THREE.Vector3(1.5, -1.5, 0),
  new THREE.Vector3(0.75, 0, 0), new THREE.Vector3(-0.75, 0, 0),
];
const A_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-10, -2, 0), new THREE.Vector3(-4, 3, 0),
  new THREE.Vector3(0, -3, 0), new THREE.Vector3(4, 3, 0),
  new THREE.Vector3(10, -2, 0), A_SHAPE_POINTS_INITIAL[0],
  ...A_SHAPE_POINTS_INITIAL
], false, 'catmullrom', 0.5);
const FINAL_A_POINTS = A_CURVE.getPoints(200);

type AnimationPhase = 'roaming' | 'eating' | 'movingToA' | 'drawingA' | 'final';

// --- Componente Snake (sin cambios estructurales) ---
interface SnakeProps {
  eatenWords: Set<string>;
  onWordEaten: (id: string) => void;
  animationPhase: AnimationPhase;
  onPhaseChange: (phase: AnimationPhase) => void;
}

function Snake({ eatenWords, onWordEaten, animationPhase, onPhaseChange }: SnakeProps) {
  const snakeSegments = useRef<THREE.Vector3[]>([]);
  const snakeCurve = useRef<THREE.CatmullRomCurve3 | null>(null);
  const snakeMeshRef = useRef<THREE.Mesh>(null!);
  const headPosition = useRef(new THREE.Vector3(-15, 0, 0));
  const animationProgress = useRef(0);

  const snakeLength = useMemo(() => 50 + eatenWords.size * 10, [eatenWords.size]);

   if (snakeSegments.current.length === 0) {
      snakeSegments.current = Array.from({ length: snakeLength }).map(
          (_, i) => new THREE.Vector3(-15 + i * 0.2, Math.sin(i * 0.5) * 0.5, 0)
      );
      snakeCurve.current = new THREE.CatmullRomCurve3(snakeSegments.current);
      headPosition.current = snakeSegments.current[0].clone();
   }

  useFrame(({ clock }) => {
    if (!snakeMeshRef.current || !snakeCurve.current) return;

    let targetPosition: THREE.Vector3 | null = null;
    let currentPhase = animationPhase;

    // --- Phase Logic (sin cambios) ---
    switch (currentPhase) {
        case 'roaming':
        case 'eating':
            const t = clock.getElapsedTime() * 0.5;
            targetPosition = new THREE.Vector3(
                Math.cos(t * 0.7) * 9 + Math.sin(t * 0.4) * 2,
                Math.sin(t * 0.9) * 5 + Math.cos(t * 0.3) * 1.5,
                Math.sin(t * 1.1) * 0.5
            );
            headPosition.current.lerp(targetPosition, 0.06);

            WORDS_TO_EAT.forEach(word => {
                if (!eatenWords.has(word.id) && headPosition.current.distanceTo(word.pos) < 1.0) {
                    onWordEaten(word.id);
                    if (eatenWords.size + 1 === WORDS_TO_EAT.length) {
                        currentPhase = 'movingToA';
                        onPhaseChange(currentPhase);
                        animationProgress.current = 0;
                    }
                }
            });
            break;
        case 'movingToA':
            targetPosition = A_CURVE.getPointAt(0);
            headPosition.current.lerp(targetPosition, 0.04);
            if (headPosition.current.distanceTo(targetPosition) < 0.1) {
                currentPhase = 'drawingA';
                onPhaseChange(currentPhase);
                animationProgress.current = 0;
            }
            break;
        case 'drawingA':
            animationProgress.current += 0.003;
            if (animationProgress.current >= 1) {
                animationProgress.current = 1;
                currentPhase = 'final';
                onPhaseChange(currentPhase);
            }
            const pointOnACurve = A_CURVE.getPointAt(animationProgress.current);
            headPosition.current.copy(pointOnACurve);
            break;
        case 'final':
             if (snakeSegments.current.length !== FINAL_A_POINTS.length) {
                 snakeSegments.current = FINAL_A_POINTS;
                 snakeCurve.current.points = snakeSegments.current;
             }
             targetPosition = headPosition.current;
            break;
    }

    // --- Update Snake Geometry (sin cambios) ---
    if (currentPhase !== 'final') {
        snakeSegments.current.unshift(headPosition.current.clone());
        while (snakeSegments.current.length > snakeLength) {
            snakeSegments.current.pop();
        }
        snakeCurve.current.points = snakeSegments.current;
    }

    const tubeRadius = 0.12 + 0.02 * Math.sin(clock.getElapsedTime() * 5);
    const tubeGeometry = new THREE.TubeGeometry(
      snakeCurve.current,
      Math.max(10, snakeSegments.current.length * 2),
      tubeRadius, 8, false
    );

    if (snakeMeshRef.current.geometry) {
        snakeMeshRef.current.geometry.dispose();
    }
    snakeMeshRef.current.geometry = tubeGeometry;
    snakeMeshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={snakeMeshRef}>
      <meshStandardMaterial color="#FFFFFF" roughness={0.5} metalness={0.2} side={THREE.DoubleSide} />
      <bufferGeometry attach="geometry" />
    </mesh>
  );
}

// --- NUEVO: Componente interno para el contenido de la escena ---
interface SceneContentProps extends SnakeProps {
    showFinalText: boolean;
}

function SceneContent({ eatenWords, onWordEaten, animationPhase, onPhaseChange, showFinalText }: SceneContentProps) {
    // *** ¡El hook useThree se mueve aquí dentro! ***
    const { size } = useThree(); // Get canvas size for aspect ratio

    // Calculate camera properties based on canvas size
    const aspect = size.width / size.height;
    const frustumSize = 14; // Adjust this to control zoom level
    const cameraProps = {
      makeDefault: true, // Make this the default camera
      left: frustumSize * aspect / -2,
      right: frustumSize * aspect / 2,
      top: frustumSize / 2,
      bottom: frustumSize / -2,
      near: 0.1,
      far: 100,
      position: [0, 0, 10] as [number, number, number], // Camera position Z
    };

    return (
        <>
            {/* Camera setup now uses calculated props */}
            <OrthographicCamera {...cameraProps} />

            {/* Lighting (sin cambios) */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 8]} intensity={1.5} />
            <directionalLight position={[-3, -2, 5]} intensity={0.5} color="#AAAAFF" />

            {/* Render the Snake (pasando props) */}
            <Snake
                eatenWords={eatenWords}
                onWordEaten={onWordEaten}
                animationPhase={animationPhase}
                onPhaseChange={onPhaseChange}
            />

            {/* Render Words to Eat (pasando props) */}
            {animationPhase !== 'final' && WORDS_TO_EAT.map((word) =>
                !eatenWords.has(word.id) ? (
                <Text
                    key={word.id}
                    position={word.pos}
                    fontSize={0.8}
                    color="#D1D5DB"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#374151"
                >
                    {word.id}
                </Text>
                ) : null
            )}

             {/* Render Final Atenex Text (pasando props) */}
             {showFinalText && (
                <Text
                    position={[0, -2.5, 1]}
                    fontSize={1.8}
                    color="#FFFFFF"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.woff"
                    outlineWidth={0.08}
                    outlineColor="#000000"
                >
                    Atenex
                </Text>
             )}
        </>
    );
}


// --- Componente Principal SnakeAnimation (ahora más simple) ---
export default function SnakeAnimation() {
  const [eatenWords, setEatenWords] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<AnimationPhase>('roaming');
  const [showFinalText, setShowFinalText] = useState(false);
  // const allWordsEaten = useMemo(() => eatenWords.size === WORDS_TO_EAT.length, [eatenWords]); // Ya no se necesita aquí directamente

  const handleWordEaten = useCallback((id: string) => {
    setEatenWords(prev => new Set(prev).add(id));
  }, []);

   const handlePhaseChange = useCallback((newPhase: AnimationPhase) => {
       console.log("Animation Phase Change:", newPhase);
       setPhase(newPhase);
       if (newPhase === 'final') {
           setTimeout(() => setShowFinalText(true), 500);
       }
   }, []);

  return (
    <Canvas
      style={{
        position: 'absolute', top: 0, left: 0, width: '100vw',
        height: '100vh', zIndex: 0, pointerEvents: 'none', background: 'transparent',
      }}
      // No necesitamos la cámara aquí, se define dentro de SceneContent
    >
        {/* Renderiza el componente interno que contiene la escena */}
        <SceneContent
            eatenWords={eatenWords}
            onWordEaten={handleWordEaten}
            animationPhase={phase}
            onPhaseChange={handlePhaseChange}
            showFinalText={showFinalText}
        />
    </Canvas>
  );
}