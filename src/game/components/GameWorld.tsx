import React from 'react';
import { Grid } from '@react-three/drei';

export const GameWorld: React.FC = () => {
  return (
    <>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3d5a3d" />
      </mesh>

      {/* 網格輔助線 */}
      <Grid
        args={[50, 50]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#4a6b4a"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2d4a2d"
        fadeDistance={50}
        position={[0, 0.01, 0]}
      />

      {/* 邊界牆 */}
      <WallSegment position={[0, 1, -25]} rotation={[0, 0, 0]} width={50} />
      <WallSegment position={[0, 1, 25]} rotation={[0, Math.PI, 0]} width={50} />
      <WallSegment position={[-25, 1, 0]} rotation={[0, Math.PI / 2, 0]} width={50} />
      <WallSegment position={[25, 1, 0]} rotation={[0, -Math.PI / 2, 0]} width={50} />

      {/* 裝飾物 - 樹木 */}
      <Tree position={[-15, 0, -15]} />
      <Tree position={[15, 0, -15]} />
      <Tree position={[-15, 0, 15]} />
      <Tree position={[15, 0, 15]} />
      <Tree position={[-10, 0, 10]} />
      <Tree position={[10, 0, -10]} />

      {/* 裝飾物 - 石頭 */}
      <Rock position={[-8, 0, -5]} scale={0.8} />
      <Rock position={[12, 0, 8]} scale={1.2} />
      <Rock position={[-5, 0, 12]} scale={0.6} />
      <Rock position={[8, 0, -12]} scale={1} />

      {/* 環境光 */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight args={['#87ceeb', '#3d5a3d', 0.5]} />

      {/* 天空顏色 */}
      <fog attach="fog" args={['#1a1a2e', 30, 60]} />
    </>
  );
};

// 牆壁組件
const WallSegment: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
}> = ({ position, rotation, width }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={[width, 2, 0.5]} />
    <meshStandardMaterial color="#5a4a3a" />
  </mesh>
);

// 樹木組件
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* 樹幹 */}
    <mesh position={[0, 1, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
    {/* 樹冠 */}
    <mesh position={[0, 3, 0]} castShadow>
      <coneGeometry args={[1.5, 3, 8]} />
      <meshStandardMaterial color="#228b22" />
    </mesh>
    <mesh position={[0, 4.5, 0]} castShadow>
      <coneGeometry args={[1, 2, 8]} />
      <meshStandardMaterial color="#2e8b2e" />
    </mesh>
  </group>
);

// 石頭組件
const Rock: React.FC<{ position: [number, number, number]; scale: number }> = ({
  position,
  scale
}) => (
  <mesh position={[position[0], position[1] + scale * 0.4, position[2]]} castShadow>
    <dodecahedronGeometry args={[scale * 0.5, 0]} />
    <meshStandardMaterial color="#696969" roughness={0.9} />
  </mesh>
);
