import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const ScratchGame = ({ onComplete }) => {
  const [scratched, setScratched] = useState(0);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratch = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPosition(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    const newScratched = Math.min(scratched + 1, 100);
    setScratched(newScratched);

    if (newScratched >= 80) {
      onComplete();
    }
  }, [scratched, onComplete]);

  const startScratch = (e) => {
    isDrawing.current = true;
    lastPos.current = getPosition(e);
    scratch(e);
  };

  const stopScratch = () => {
    isDrawing.current = false;
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-memory-glow/60 text-sm text-center px-4">
          刮开以揭示记忆
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full rounded-lg cursor-pointer touch-none"
        onMouseDown={startScratch}
        onMouseMove={scratch}
        onMouseUp={stopScratch}
        onMouseLeave={stopScratch}
        onTouchStart={startScratch}
        onTouchMove={scratch}
        onTouchEnd={stopScratch}
        refCallback={initCanvas}
      />
      <div className="absolute bottom-2 right-2 text-xs text-memory-muted">
        {scratched}% 已揭示
      </div>
    </div>
  );
};

export default ScratchGame;