import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const PeekGame = ({ onComplete }) => {
  const [won, setWon] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [stars, setStars] = useState([]);

  const viewXRef = useRef(0);
  const viewYRef = useRef(0);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const TOTAL_STARS = 9;
  const VIEW_WIDTH = 300;
  const VIEW_HEIGHT = 300;
  const SCENE_WIDTH = 500;
  const SCENE_HEIGHT = 500;
  const STAR_SIZE = 30;
  const HOLE_RADIUS = 100;

  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = STAR_SIZE + Math.random() * (SCENE_WIDTH - STAR_SIZE * 2);
        y = STAR_SIZE + Math.random() * (SCENE_HEIGHT - STAR_SIZE * 2);
        attempts++;
      } while (
        attempts < 50 &&
        x > SCENE_WIDTH / 2 - HOLE_RADIUS &&
        x < SCENE_WIDTH / 2 + HOLE_RADIUS &&
        y > SCENE_HEIGHT / 2 - HOLE_RADIUS &&
        y < SCENE_HEIGHT / 2 + HOLE_RADIUS
      );

      newStars.push({
        id: i,
        x,
        y,
        found: false
      });
    }
    setStars(newStars);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (won) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [won]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || won) return;

    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    viewXRef.current = Math.max(-(SCENE_WIDTH - VIEW_WIDTH), Math.min(0, viewXRef.current + deltaX));
    viewYRef.current = Math.max(-(SCENE_HEIGHT - VIEW_HEIGHT), Math.min(0, viewYRef.current + deltaY));

    setViewX(viewXRef.current);
    setViewY(viewYRef.current);

    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [won]);

  const handleTouchStart = useCallback((e) => {
    if (won) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [won]);

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current || won) return;

    const deltaX = e.touches[0].clientX - lastPosRef.current.x;
    const deltaY = e.touches[0].clientY - lastPosRef.current.y;

    viewXRef.current = Math.max(-(SCENE_WIDTH - VIEW_WIDTH), Math.min(0, viewXRef.current + deltaX));
    viewYRef.current = Math.max(-(SCENE_HEIGHT - VIEW_HEIGHT), Math.min(0, viewYRef.current + deltaY));

    setViewX(viewXRef.current);
    setViewY(viewYRef.current);

    lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [won]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleClick = useCallback((e) => {
    if (won) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - viewXRef.current;
    const clickY = e.clientY - rect.top - viewYRef.current;

    setStars(prevStars => {
      let found = false;
      const newStars = prevStars.map(star => {
        if (star.found) return star;
        const starCenterX = star.x + STAR_SIZE / 2;
        const starCenterY = star.y + STAR_SIZE / 2;
        const distance = Math.sqrt(
          Math.pow(clickX - starCenterX, 2) +
          Math.pow(clickY - starCenterY, 2)
        );
        if (distance < STAR_SIZE) {
          found = true;
          return { ...star, found: true };
        }
        return star;
      });

      if (found) {
        const newCount = newStars.filter(s => s.found).length;
        setFoundCount(newCount);
        if (newCount >= TOTAL_STARS) {
          setWon(true);
          onComplete();
        }
      }

      return newStars;
    });
  }, [won, onComplete]);

  const restartGame = () => {
    viewXRef.current = 0;
    viewYRef.current = 0;
    setViewX(0);
    setViewY(0);
    setFoundCount(0);
    setWon(false);
    isDraggingRef.current = false;

    const newStars = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = STAR_SIZE + Math.random() * (SCENE_WIDTH - STAR_SIZE * 2);
        y = STAR_SIZE + Math.random() * (SCENE_HEIGHT - STAR_SIZE * 2);
        attempts++;
      } while (
        attempts < 50 &&
        x > SCENE_WIDTH / 2 - HOLE_RADIUS &&
        x < SCENE_WIDTH / 2 + HOLE_RADIUS &&
        y > SCENE_HEIGHT / 2 - HOLE_RADIUS &&
        y < SCENE_HEIGHT / 2 + HOLE_RADIUS
      );

      newStars.push({
        id: i,
        x,
        y,
        found: false
      });
    }
    setStars(newStars);
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <p className="text-memory-glow/60 text-sm text-center mb-2 select-none">
        拖动寻找隐藏的星星
      </p>

      <div
        className="relative w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ height: VIEW_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className="absolute select-none"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            left: viewX,
            top: viewY,
          }}
        >
          {stars.map(star => (
            star.found ? null : (
              <motion.div
                key={star.id}
                className="absolute select-none"
                style={{
                  left: star.x,
                  top: star.y,
                  width: STAR_SIZE,
                  height: STAR_SIZE,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <svg viewBox="0 0 24 24" fill="#FFD700" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.div>
            )
          ))}
        </div>

        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            background: `radial-gradient(circle at 50% 50%,
              transparent ${HOLE_RADIUS - 20}px,
              rgba(0,0,0,0.7) ${HOLE_RADIUS}px,
              rgba(0,0,0,0.9) ${HOLE_RADIUS + 40}px)`,
          }}
        />
      </div>

      <div className="mt-2 text-center select-none">
        <p className="text-memory-glow/60 text-xs">
          已找到: {foundCount} / {TOTAL_STARS}
        </p>
      </div>

      {won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-2 select-none">成功!</p>
          <p className="text-memory-muted text-sm mb-4 select-none">已找到所有星星</p>
          <motion.button
            className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 select-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartGame}
          >
            再试一次
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PeekGame;