import React from 'react';
import { Game3D } from './Game3D';

interface GameAppProps {
  onBack?: () => void;
}

export const GameApp: React.FC<GameAppProps> = ({ onBack }) => {
  return <Game3D onBack={onBack} />;
};

export default GameApp;
