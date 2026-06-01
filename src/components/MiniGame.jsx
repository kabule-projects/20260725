import { useState } from 'react';
import DragGame from './games/DragGame';
import HoldGame from './games/HoldGame';
import HiddenGame from './games/HiddenGame';
import CatchGame from './games/CatchGame';
import PeekGame from './games/PeekGame';
import EchoGame from './games/EchoGame';

const MiniGame = ({ gameType, onComplete }) => {
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
      default:
        return <HoldGame onComplete={onComplete} />;
    }
  };

  return (
    <div className="w-full">
      {initialized && renderGame()}
    </div>
  );
};

export default MiniGame;