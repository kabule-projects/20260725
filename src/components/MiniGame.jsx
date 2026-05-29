import { useState, useEffect, useRef } from 'react';
import ScratchGame from './games/ScratchGame';
import DragGame from './games/DragGame';
import HoldGame from './games/HoldGame';
import HiddenGame from './games/HiddenGame';
import CatchGame from './games/CatchGame';
import PeekGame from './games/PeekGame';

const MiniGame = ({ gameType, onComplete }) => {
  const [initialized, setInitialized] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (gameType === 'scratch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setInitialized(true);
    } else {
      setInitialized(true);
    }
  }, [gameType]);

  const renderGame = () => {
    switch (gameType) {
      case 'scratch':
        return <ScratchGame onComplete={onComplete} />;
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
      default:
        return <HoldGame onComplete={onComplete} />;
    }
  };

  return (
    <div className="w-full select-none" onMouseDown={e => e.preventDefault()}>
      {gameType === 'scratch' && !initialized && (
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="hidden"
        />
      )}
      {initialized && renderGame()}
    </div>
  );
};

export default MiniGame;