import { useState } from 'react';
import DragGame from './games/DragGame';
import HoldGame from './games/HoldGame';
import HiddenGame from './games/HiddenGame';
import CatchGame from './games/CatchGame';
import PeekGame from './games/PeekGame';
import EchoGame from './games/EchoGame';
import SpotlightGame from './games/SpotlightGame';
import ColourGame from './games/ColourGame';
import TetrisGame from './games/TetrisGame';
import WordGame from './games/WordGame';

const MiniGame = ({ gameType, onComplete, config }) => {
  const [initialized, setInitialized] = useState(true);

  const renderGame = () => {
    switch (gameType) {
      case 'drag':
        return <DragGame onComplete={onComplete} />;
      case 'hold':
        return <HoldGame onComplete={onComplete} />;
      case 'hidden':
        return <HiddenGame onComplete={onComplete} />;
      case 'catch':
        return <CatchGame onComplete={onComplete} />;
      case 'peek':
        return <PeekGame onComplete={onComplete} />;
      case 'echo':
        return <EchoGame onComplete={onComplete} />;
      case 'spotlight':
        return <SpotlightGame onComplete={onComplete} />;
      case 'colour':
        return config ? <ColourGame config={config} onComplete={onComplete} /> : <HoldGame onComplete={onComplete} />;
      case 'tetris':
        return <TetrisGame onComplete={onComplete} />;
      case 'word':
        return <WordGame onComplete={onComplete} />;
      default:
        return <HoldGame onComplete={onComplete} />;
    }
  };

  return (
    <>
      {initialized && renderGame()}
    </>
  );
};

export default MiniGame;