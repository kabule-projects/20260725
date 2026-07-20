import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 70;
const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const BLOCK_SPAWN_INTERVAL = 600;
const FALL_SPEED = 3;
const WIN_HEIGHT = 520;
const WIN_FIRE_COUNT = 6;

const NORMAL_BLOCK_TEXTURES = [
  '/images/catch/item-1.webp',
  '/images/catch/item-2.webp',
  '/images/catch/item-3.webp',
  '/images/catch/item-4.webp',
  '/images/catch/item-5.webp',
  '/images/catch/item-6.webp',
  '/images/catch/item-7.webp',
  '/images/catch/item-8.webp'
];

const FIRE_BLOCK_TEXTURES = [
  '/images/catch/fire-1.webp',
  '/images/catch/fire-2.webp'
];

const PLAYER_TEXTURE = '/images/catch/player.webp';

const BLOCK_TYPES = [
  { type: 'normal', probability: 0.6 },
  { type: 'fire', probability: 0.4 },
];

const CatchGame = ({ onComplete }) => {
  const [gamePhase, setGamePhase] = useState('scene');
  const [sceneStep, setSceneStep] = useState(0);
  const [radiationBackground, setRadiationBackground] = useState(1);

  const playerXRef = useRef(150);
  const [playerX, setPlayerX] = useState(150);
  const [blocks, setBlocks] = useState([]);
  const [failurePlayerX, setFailurePlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [caughtHeight, setCaughtHeight] = useState(0);
  const [fireCount, setFireCount] = useState(0);
  const [won, setWon] = useState(false);

  const containerRef = useRef(null);
  const failureContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wonRef = useRef(false);
  const caughtHeightRef = useRef(0);
  const fireCountRef = useRef(0);
  const blocksRef = useRef([]);
  const gamePhaseRef = useRef('scene');

  const spawnBlock = useCallback((gameWidth = GAME_WIDTH) => {
    const MIN_BLOCK_SIZE = 30;
    const MAX_BLOCK_SIZE = 50;
    const size = MIN_BLOCK_SIZE + Math.random() * (MAX_BLOCK_SIZE - MIN_BLOCK_SIZE);
    const x = Math.random() * (gameWidth - size);

    const rand = Math.random();
    let cumulative = 0;
    let selectedType = BLOCK_TYPES[0];

    for (const blockType of BLOCK_TYPES) {
      cumulative += blockType.probability;
      if (rand <= cumulative) {
        selectedType = blockType;
        break;
      }
    }

    let texture = null;
    if (selectedType.type === 'normal') {
      const randomIndex = Math.floor(Math.random() * NORMAL_BLOCK_TEXTURES.length);
      texture = NORMAL_BLOCK_TEXTURES[randomIndex];
    } else if (selectedType.type === 'fire') {
      const randomIndex = Math.floor(Math.random() * FIRE_BLOCK_TEXTURES.length);
      texture = FIRE_BLOCK_TEXTURES[randomIndex];
    }

    return {
      id: Date.now() + Math.random(),
      x,
      y: -size,
      size,
      caught: false,
      type: selectedType.type,
      texture: texture
    };
  }, []);

  const checkCollision = useCallback((block, pX, gameHeight) => {
    const blockBottom = block.y + block.size;
    const blockTop = block.y;
    const playerTop = gameHeight - PLAYER_HEIGHT - 10;

    if (blockBottom >= playerTop && blockTop <= playerTop + PLAYER_HEIGHT) {
      const blockLeft = block.x;
      const blockRight = block.x + block.size;
      const playerLeft = pX;
      const playerRight = pX + PLAYER_WIDTH;

      return blockRight > playerLeft && blockLeft < playerRight;
    }
    return false;
  }, []);

  const runFailureAnimation = useCallback((onCompleteAnim) => {
    const startPlayerX = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    setFailurePlayerX(startPlayerX);

    const startTime = performance.now();
    const duration = 6000;
    let targetX = Math.random() * (GAME_WIDTH - PLAYER_WIDTH);
    let currentPlayerX = startPlayerX;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      
      if (elapsed >= duration) {
        onCompleteAnim && onCompleteAnim();
        return;
      }

      const distanceToTarget = Math.abs(targetX - currentPlayerX);
      if (distanceToTarget < 5) {
        targetX = Math.random() * (GAME_WIDTH - PLAYER_WIDTH);
      }
      const lerpFactor = 0.03;
      currentPlayerX = currentPlayerX + (targetX - currentPlayerX) * lerpFactor;
      setFailurePlayerX(currentPlayerX);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    
    lastTimeRef.current = 0;
    spawnTimeRef.current = 0;
    wonRef.current = false;
    caughtHeightRef.current = 0;
    fireCountRef.current = 0;
    blocksRef.current = [];
    setBlocks([]);
    
    const gameLoopInternal = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      if (!spawnTimeRef.current) spawnTimeRef.current = timestamp;

      const gameHeight = containerRef.current ? containerRef.current.offsetHeight : GAME_HEIGHT;
      const gameWidth = containerRef.current ? containerRef.current.offsetWidth : GAME_WIDTH;

      const spawnDelta = timestamp - spawnTimeRef.current;

      if (spawnDelta > BLOCK_SPAWN_INTERVAL) {
        blocksRef.current = [...blocksRef.current, spawnBlock(gameWidth)];
        spawnTimeRef.current = timestamp;
      }

      let newHeight = 0;
      let newFires = 0;

      const updatedBlocks = blocksRef.current
        .map(block => {
          if (block.caught) return block;
          const newY = block.y + FALL_SPEED;
          return { ...block, y: newY };
        })
        .filter(block => block.y <= gameHeight);

      const finalBlocks = updatedBlocks.map(block => {
        if (block.caught) return block;

        const blockBottom = block.y + block.size;
        const playerTop = gameHeight - PLAYER_HEIGHT - 10;

        if (blockBottom >= playerTop && blockBottom <= playerTop + PLAYER_HEIGHT + 20) {
          if (checkCollision(block, playerXRef.current, gameHeight)) {
            newHeight += block.size * 0.5;
            if (block.type === 'fire') {
              newFires++;
            }
            return { ...block, caught: true };
          }
        }
        return block;
      });

      if (newHeight > 0) {
        caughtHeightRef.current += newHeight;
        setCaughtHeight(caughtHeightRef.current);
      }

      if (newFires > 0) {
        fireCountRef.current += newFires;
        setFireCount(fireCountRef.current);
      }

      blocksRef.current = finalBlocks;
      setBlocks(finalBlocks);

      if (gamePhaseRef.current === 'playing') {
        animationRef.current = requestAnimationFrame(gameLoopInternal);
      }
    };
    
    animationRef.current = requestAnimationFrame(gameLoopInternal);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gamePhase, spawnBlock, checkCollision]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    
    if (caughtHeightRef.current >= WIN_HEIGHT &&
      fireCountRef.current >= WIN_FIRE_COUNT &&
      !wonRef.current) {
      wonRef.current = true;
      setWon(true);
      setGamePhase('success');
    }
  }, [caughtHeight, fireCount, gamePhase]);

  useEffect(() => {
    if (gamePhase === 'success') {
      const interval = setInterval(() => {
        setRadiationBackground(prev => prev === 1 ? 2 : 1);
      }, 500);

      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [gamePhase, onComplete]);

  useEffect(() => {
    if (sceneStep === 2) {
      runFailureAnimation(() => setSceneStep(3));
    } else if (sceneStep === 4) {
      runFailureAnimation(() => setSceneStep(5));
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sceneStep, runFailureAnimation]);

  const handleMouseDown = useCallback((e) => {
    if (gamePhase !== 'playing' || won) return;
    isDraggingRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const gameWidth = rect.width;
    const x = e.clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(gameWidth - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [gamePhase, won]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !isDraggingRef.current || won) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gameWidth = rect.width;
    const x = e.clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(gameWidth - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [won]);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current || won) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gameWidth = rect.width;
    const x = e.touches[0].clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(gameWidth - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [won]);

  const handleSceneClick = () => {
    switch (sceneStep) {
      case 0:
        setSceneStep(1);
        break;
      case 1:
        setSceneStep(2);
        break;
      case 3:
        setSceneStep(4);
        break;
      case 5:
        setGamePhase('playing');
        break;
      default:
        break;
    }
  };

  const restartGame = () => {
    setBlocks([]);
    setCaughtHeight(0);
    setFireCount(0);
    setWon(false);
    setPlayerX(150);
    setFailurePlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setGamePhase('scene');
    setSceneStep(0);
    playerXRef.current = 150;
    wonRef.current = false;
    caughtHeightRef.current = 0;
    fireCountRef.current = 0;
    lastTimeRef.current = 0;
    spawnTimeRef.current = 0;
    isDraggingRef.current = false;
    blocksRef.current = [];
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const renderScene = () => {
    const renderFailureScene = () => (
      <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div 
          className="relative w-full max-w-lg aspect-[3/4] mx-auto" 
          ref={failureContainerRef}
        >
          <img
            src="/images/catch/scene/掉落物.gif"
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div 
            className="absolute z-20" 
            style={{ 
              left: `${(failurePlayerX / GAME_WIDTH) * 100}%`, 
              bottom: '2%', 
              width: `${((PLAYER_WIDTH * 1.2) / GAME_WIDTH) * 100}%` 
            }}
          >
            <img src={PLAYER_TEXTURE} alt="" className="w-full h-auto" />
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-memory-dark/80 text-memory-accent text-xs px-3 py-1 rounded-full z-30">
            此处为自动播放
          </div>
        </div>
      </div>
    );

    if (sceneStep === 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center" onClick={handleSceneClick} style={{ minHeight: '400px' }}>
          <img
            src="/images/catch/scene/正面低头.webp"
            alt=""
            className="w-full max-w-lg aspect-[3/4] object-contain"
          />
        </div>
      );
    }

    if (sceneStep === 1) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
          <img
            src="/images/catch/scene/需要准备.webp"
            alt=""
            className="w-full max-w-lg aspect-[3/4] object-contain"
          />
          <motion.button
            className="mt-4 px-8 py-3 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSceneClick}
          >
            开始吧
          </motion.button>
        </div>
      );
    }

    if (sceneStep === 2) {
      return renderFailureScene();
    }

    if (sceneStep === 3) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
          <img
            src="/images/catch/scene/不够呢.webp"
            alt=""
            className="w-full max-w-lg aspect-[3/4] object-contain"
          />
          <motion.button
            className="mt-4 px-8 py-3 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSceneClick}
          >
            再试一次吧...
          </motion.button>
        </div>
      );
    }

    if (sceneStep === 4) {
      return renderFailureScene();
    }

    if (sceneStep === 5) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
          <img
            src="/images/catch/scene/不够呢.webp"
            alt=""
            className="w-full max-w-lg aspect-[3/4] object-contain"
          />
          <motion.button
            className="mt-4 px-8 py-3 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSceneClick}
          >
            不着急，再试一次
          </motion.button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full px-[12%] py-[12%] flex items-center justify-center">
      <div className={`relative w-full ${gamePhase === 'scene' || gamePhase === 'success' ? '' : 'bg-memory-dark/50 rounded-lg surreal-border p-4'}`} style={gamePhase === 'scene' || gamePhase === 'success' ? { height: '100%', backgroundColor: 'transparent' } : {}}>
        {gamePhase === 'scene' && renderScene()}

        {gamePhase === 'success' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
            <div className="relative w-full max-w-lg aspect-[3/4]">
              <img
                src="/images/catch/scene/放射背景1.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: radiationBackground === 1 ? 1 : 0 }}
              />
              <img
                src="/images/catch/scene/放射背景2.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: radiationBackground === 2 ? 1 : 0 }}
              />
              <img
                src="/images/catch/scene/背面看盆.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
              />
              <img
                src="/images/catch/scene/成功了.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {gamePhase !== 'scene' && gamePhase !== 'success' && (
          <>
            <div className="flex justify-between items-center mb-2 px-2">
              <div className="text-memory-glow/60 text-sm">
                {fireCount === 0 ? '公司起什么名字好呢？' :
                  fireCount <= 2 ? '劲火？' :
                    fireCount <= 4 ? '劲炎？' : '劲焱！'}
              </div>
              <div className="text-memory-glow/60 text-sm">
                分数: {Math.floor(caughtHeight)}/{WIN_HEIGHT}
              </div>
            </div>
            <p className="text-memory-glow/60 text-sm text-center mb-2">
              接不接？接什么？先接！
            </p>
          </>
        )}

        {gamePhase !== 'scene' && gamePhase !== 'success' && (
          <div
            ref={containerRef}
            className="relative w-full max-w-lg aspect-[3/4] rounded overflow-hidden select-none mx-auto"
            style={{
              maxHeight: 'calc(80vh - 80px)',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              backgroundImage: `url(/images/catch/background.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onDragStart={(e) => e.preventDefault()}
          >
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-memory-dark/80 text-memory-accent text-xs px-3 py-1 rounded-full z-30">
              此处需要操作
            </div>
            {blocks.map(block => (
              !block.caught && (
                <motion.div
                  key={block.id}
                  className="absolute"
                  style={{ left: block.x, top: block.y, width: block.size }}
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={block.texture}
                    alt=""
                    className="w-full h-auto object-contain"
                    draggable="false"
                    style={{ pointerEvents: 'none' }}
                  />
                </motion.div>
              )
            ))}

            <div
              className="absolute overflow-hidden"
              style={{ left: playerX, bottom: 10, width: PLAYER_WIDTH }}
            >
              <img
                src={PLAYER_TEXTURE}
                alt="举盆小人"
                className="w-full h-auto"
                draggable="false"
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CatchGame;
