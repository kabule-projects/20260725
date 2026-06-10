import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const DragGame = ({ onComplete }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [targetReached, setTargetReached] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const targetPosition = { x: 120, y: 120 };
  const tolerance = 30;

  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const newX = clientX - startPos.current.x;
    const newY = clientY - startPos.current.y;

    setPosition({ x: newX, y: newY });

    const distance = Math.sqrt(
      Math.pow(newX - targetPosition.x, 2) +
      Math.pow(newY - targetPosition.y, 2)
    );

    if (distance < tolerance && !targetReached) {
      setTargetReached(true);
      setTimeout(onComplete, 500);
    }
  }, [isDragging, targetReached, onComplete]);

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg overflow-hidden surreal-border">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-memory-glow/60 text-sm text-center px-4 mb-8">
          拖动光点到目标位置
        </p>
      </div>

      <motion.div
        className="absolute w-12 h-12 rounded-full bg-memory-accent/30 border-2 border-memory-accent/50 flex items-center justify-center"
        style={{
          left: targetPosition.x - 24,
          top: targetPosition.y - 24,
        }}
        animate={targetReached ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: targetReached ? Infinity : 0, duration: 1 }}
      >
        <span className="text-memory-accent text-xs">☆</span>
      </motion.div>

      <motion.div
        className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-memory-glow to-memory-accent shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ x: position.x, y: position.y }}
        drag
        dragEnabled={!targetReached}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleStart}
        onDrag={handleMove}
        onDragEnd={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-memory-dark text-xl">✧</span>
      </motion.div>
    </div>
  );
};

export default DragGame;