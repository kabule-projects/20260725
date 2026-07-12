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

const MiniGame = ({ gameType, onComplete, config, artist }) => {
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
    <div className="relative w-full h-full">
      {initialized && renderGame()}
      {artist && (
        <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
          {artist}
        </div>
      )}
    </div>
  );
};

export default MiniGame;