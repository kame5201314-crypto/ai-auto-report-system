import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameApp } from '../game/GameApp';

export const GamePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <GameApp onBack={handleBack} />;
};

export default GamePage;
