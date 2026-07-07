import { useState } from 'react';
import HoldGame from './games/HoldGame';
import CatchGame from './games/CatchGame';
import PeekGame from './games/PeekGame';
import EchoGame from './games/EchoGame';
import SpotlightGame from './games/SpotlightGame';
import ColourGame from './games/ColourGame';
import TetrisGame from './games/TetrisGame';
import WordGame from './games/WordGame';
import TapGame from './games/TapGame';
import MemoryGame from './games/MemoryGame';
import WhackGame from './games/WhackGame';
import LyricGame from './games/LyricGame';
import QuizGame from './games/QuizGame';
import SortGame from './games/SortGame';

const MiniGame = ({ gameType, onComplete, config }) => {
  const [initialized, setInitialized] = useState(true);

  const renderGame = () => {
    switch (gameType) {
      case 'hold':
        return <HoldGame onComplete={onComplete} />;
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
      case 'tap':
        return <TapGame onComplete={onComplete} />;
      case 'memory':
        return <MemoryGame onComplete={onComplete} />;
      case 'whack':
        return <WhackGame onComplete={onComplete} />;
      case 'lyric':
        return <LyricGame onComplete={onComplete} />;
      case 'quiz':
        return <QuizGame onComplete={onComplete} />;
      case 'sort':
        return <SortGame onComplete={onComplete} />;
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