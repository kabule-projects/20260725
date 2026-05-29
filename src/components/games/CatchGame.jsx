import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const CatchGame = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [caughtHeight, setCaughtHeight] = useState(0);

  const playerXRef = useRef(150);
  const [playerX, setPlayerX] = useState(150);
  const [blocks, setBlocks] = useState([]);

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wonRef = useRef(false);
  const caughtHeightRef = useRef(0);

  const PLAYER_WIDTH = 80;
  const PLAYER_HEIGHT = 20;
  const GAME_WIDTH = 300;
  const GAME_HEIGHT = 300;
  const BLOCK_SPAWN_INTERVAL = 1000;
  const FALL_SPEED = 1.5;
  const WIN_HEIGHT = 350;

  const spawnBlock = useCallback(() => {
    const size = 20 + Math.random() * 30;
    const x = Math.random() * (GAME_WIDTH - size);
    return {
      id: Date.now() + Math.random(),
      x,
      y: -size,
      size,
      caught: false
    };
  }, []);

  const checkCollision = useCallback((block, pX) => {
    const blockBottom = block.y + block.size;
    const blockTop = block.y;
    const playerTop = GAME_HEIGHT - PLAYER_HEIGHT - 10;

    if (blockBottom >= playerTop && blockTop <= playerTop + PLAYER_HEIGHT) {
      const blockLeft = block.x;
      const blockRight = block.x + block.size;
      const playerLeft = pX;
      const playerRight = pX + PLAYER_WIDTH;

      return blockRight > playerLeft && blockLeft < playerRight;
    }
    return false;
  }, []);

  const gameLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    if (!spawnTimeRef.current) spawnTimeRef.current = timestamp;

    const spawnDelta = timestamp - spawnTimeRef.current;

    if (spawnDelta > BLOCK_SPAWN_INTERVAL) {
      setBlocks(prev => [...prev, spawnBlock()]);
      spawnTimeRef.current = timestamp;
    }

    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.caught) return block;
        const newY = block.y + FALL_SPEED;
        return { ...block, y: newY };
      }).filter(block => {
        if (block.y > GAME_HEIGHT) return false;
        return true;
      });

      let newHeight = 0;
      updatedBlocks.forEach(block => {
        if (!block.caught && block.y + block.size >= GAME_HEIGHT - PLAYER_HEIGHT - 10) {
          if (checkCollision(block, playerXRef.current)) {
            block.caught = true;
            newHeight += block.size * 0.5;
          }
        }
      });

      if (newHeight > 0) {
        caughtHeightRef.current += newHeight;
        setCaughtHeight(caughtHeightRef.current);

        if (caughtHeightRef.current >= WIN_HEIGHT && !wonRef.current) {
          wonRef.current = true;
          setWon(true);
          onComplete();
        }
      }

      lastTimeRef.current = timestamp;
      return updatedBlocks;
    });

    if (!wonRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [spawnBlock, checkCollision, onComplete]);

  useEffect(() => {
    if (started && !won) {
      lastTimeRef.current = 0;
      spawnTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [started, won, gameLoop]);

  const handleMouseDown = useCallback((e) => {
    if (!started || won) return;
    isDraggingRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [started, won]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !isDraggingRef.current || won) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [won]);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current || won) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [won]);

  const restartGame = () => {
    setBlocks([]);
    setCaughtHeight(0);
    setWon(false);
    setStarted(false);
    setPlayerX(150);
    playerXRef.current = 150;
    wonRef.current = false;
    caughtHeightRef.current = 0;
    lastTimeRef.current = 0;
    spawnTimeRef.current = 0;
    isDraggingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="relative w-full max-w-xs mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4">
      <p className="text-memory-glow/60 text-sm text-center mb-2">
        移动接住方块
      </p>

      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-memory-dark/30 rounded overflow-hidden cursor-none"
        style={{ height: GAME_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {blocks.map(block => (
          block.caught ? null : (
            <motion.div
              key={block.id}
              className="absolute bg-memory-glow/60 rounded"
              style={{
                left: block.x,
                top: block.y,
                width: block.size,
                height: block.size,
              }}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
            />
          )
        ))}

        <div
          className="absolute bg-memory-glow rounded"
          style={{
            left: playerX,
            bottom: 10,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 bg-memory-glow/20 transition-all duration-300"
          style={{ height: Math.min(caughtHeight, WIN_HEIGHT) }}
        />
      </div>

      {!started && !won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-4">就凭我 无名闯繁城</p>
          <motion.button
            className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStarted(true)}
          >
            开始
          </motion.button>
        </motion.div>
      )}

      {won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-2">成功!</p>
          <p className="text-memory-muted text-sm mb-4">所有方块已收集</p>
          <motion.button
            className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
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

export default CatchGame;