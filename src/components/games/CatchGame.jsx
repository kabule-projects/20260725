import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const CatchGame = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [caughtHeight, setCaughtHeight] = useState(0);
  const [fireCount, setFireCount] = useState(0);
  const [showScenes, setShowScenes] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneImages, setSceneImages] = useState([]);

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
  const fireCountRef = useRef(0);
  const fireAddedThisFrameRef = useRef(false);

  const SCENE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

  useEffect(() => {
    const loadSceneImages = async () => {
      const images = [];
      let index = 1;
      let found = true;

      while (found) {
        found = false;
        for (const ext of SCENE_EXTENSIONS) {
          const src = `/images/catch/scene/${index}.${ext}`;
          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                images.push(src);
                found = true;
                resolve();
              };
              img.onerror = () => resolve();
              img.src = src;
            });
            if (found) break;
          } catch {
            // 忽略错误
          }
        }
        index++;
        if (index > 50) break;
      }

      setSceneImages(images);
    };

    loadSceneImages();
  }, []);

  const handleSceneClick = () => {
    if (currentScene < sceneImages.length - 1) {
      setCurrentScene(prev => prev + 1);
    } else {
      setShowScenes(false);
    }
  };

  const handleStartGame = () => {
    setStarted(true);
  };

  const PLAYER_WIDTH = 60;
  const PLAYER_HEIGHT = 70;
  const GAME_WIDTH = 300;
  const GAME_HEIGHT = 400; // 3:4 比例
  const BLOCK_SPAWN_INTERVAL = 1000;
  const FALL_SPEED = 2;
  const WIN_HEIGHT = 520;
  const WIN_FIRE_COUNT = 6;


  const NORMAL_BLOCK_TEXTURES = [
    '/images/catch/item-1.png',
    '/images/catch/item-2.png',
    '/images/catch/item-3.png',
    '/images/catch/item-4.png',
    '/images/catch/item-5.png',
    '/images/catch/item-6.png',
    '/images/catch/item-7.png',
    '/images/catch/item-8.png'
  ];
  
  const FIRE_BLOCK_TEXTURES = [
    '/images/catch/fire-1.png',
    '/images/catch/fire-2.png'
  ];
  
  const PLAYER_TEXTURE = '/images/catch/player.png';
  
  const BLOCK_TYPES = [
    { type: 'normal', color: '#e8d5b7', probability: 0.7 },
    { type: 'fire', color: '#ff6b35', probability: 0.3 },
  ];

  const spawnBlock = useCallback((gameWidth = GAME_WIDTH) => {
    const MIN_BLOCK_SIZE = 30;
    const MAX_BLOCK_SIZE = 50;
    const size = MIN_BLOCK_SIZE + Math.random() * (MAX_BLOCK_SIZE - MIN_BLOCK_SIZE);
    const x = Math.random() * (gameWidth - size);
    
    // 根据概率选择掉落物类型
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
    
    // 为掉落物随机选择贴图
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
      color: selectedType.color,
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

  const gameLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    if (!spawnTimeRef.current) spawnTimeRef.current = timestamp;

    // 获取容器实际尺寸
    const gameHeight = containerRef.current ? containerRef.current.offsetHeight : GAME_HEIGHT;
    const gameWidth = containerRef.current ? containerRef.current.offsetWidth : GAME_WIDTH;

    // 重置每帧的火苗计数标志
    fireAddedThisFrameRef.current = false;

    const spawnDelta = timestamp - spawnTimeRef.current;

    if (spawnDelta > BLOCK_SPAWN_INTERVAL) {
      setBlocks(prev => [...prev, spawnBlock(gameWidth)]);
      spawnTimeRef.current = timestamp;
    }

    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.caught) return block;
        const newY = block.y + FALL_SPEED;
        return { ...block, y: newY };
      }).filter(block => {
        if (block.y > gameHeight) return false;
        return true;
      });

      let newHeight = 0;
      let newFires = 0;
      
      for (const block of updatedBlocks) {
        if (block.caught) continue;
        
        // 只有当块到达玩家区域时才进行碰撞检测
        const blockBottom = block.y + block.size;
        const playerTop = gameHeight - PLAYER_HEIGHT - 10;
        
        if (blockBottom >= playerTop && blockBottom <= playerTop + PLAYER_HEIGHT + 20) {
          if (checkCollision(block, playerXRef.current, gameHeight)) {
            block.caught = true;
            newHeight += block.size * 0.5;
            
            // 只有真正接到的火苗才计数（每帧最多增加1个）
            if (block.type === 'fire' && newFires === 0) {
              newFires = 1;
            }
          }
        }
        
        // 每帧最多处理一个火苗
        if (newFires >= 1) {
          break;
        }
      }

      if (newHeight > 0) {
        caughtHeightRef.current += newHeight;
        setCaughtHeight(caughtHeightRef.current);
      }

      if (newFires > 0) {
        const newFireCount = fireCountRef.current + 1;
        fireCountRef.current = newFireCount;
        setFireCount(newFireCount);
      }

      // 通关条件：同时满足高度和火苗数量
      if (caughtHeightRef.current >= WIN_HEIGHT && 
          fireCountRef.current >= WIN_FIRE_COUNT && 
          !wonRef.current) {
        wonRef.current = true;
        setWon(true);
        onComplete();
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
    const gameWidth = rect.width;
    const x = e.clientX - rect.left - PLAYER_WIDTH / 2;
    playerXRef.current = Math.max(0, Math.min(gameWidth - PLAYER_WIDTH, x));
    setPlayerX(playerXRef.current);
  }, [started, won]);

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

  const restartGame = () => {
    setBlocks([]);
    setCaughtHeight(0);
    setFireCount(0);
    setWon(false);
    setStarted(false);
    setPlayerX(150);
    setShowScenes(true);
    setCurrentScene(0);
    playerXRef.current = 150;
    wonRef.current = false;
    caughtHeightRef.current = 0;
    fireCountRef.current = 0;
    lastTimeRef.current = 0;
    spawnTimeRef.current = 0;
    isDraggingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="w-full h-full px-[12%] py-[12%] flex items-center justify-center">
      <div className="relative w-full bg-memory-dark/50 rounded-lg surreal-border p-4">
        {showScenes && sceneImages.length > 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black z-50 rounded-lg select-none"
            initial={false}
            animate={{ opacity: 1 }}
            onClick={handleSceneClick}
            style={{
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
            }}
          >
            <img
              src={sceneImages[currentScene]}
              alt={`剧情 ${currentScene + 1}`}
              className="w-full max-w-lg aspect-[3/4] object-contain rounded-lg"
              style={{ 
                maxHeight: 'calc(80vh - 80px)',
                WebkitUserDrag: 'none',
                userDrag: 'none',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}

      {/* 进度显示 */}
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="text-memory-glow/60 text-sm">
          {fireCount === 0 ? '公司起什么名字好呢？' :
           fireCount <= 2 ? '劲火？' : 
           fireCount <= 4 ? '劲炎？' : '劲焱！'}
        </div>
        <div className="text-memory-glow/60 text-sm">
          高度: {Math.floor(caughtHeight)}/{WIN_HEIGHT}
        </div>
      </div>
      <p className="text-memory-glow/60 text-sm text-center mb-2">
        接不接？接什么？先接！
      </p>

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
          backgroundImage: 'url(/images/catch/background.png)',
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
        {blocks.map(block => (
          block.caught ? null : (
            <motion.div
              key={block.id}
              className="absolute"
              style={{
                left: block.x,
                top: block.y,
                width: block.size,
                // 高度设为auto，让贴图自然显示其原始比例
              }}
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* 使用贴图显示掉落物 - 宽度与block对齐，高度自适应 */}
              <img
                src={block.texture}
                alt={block.type === 'fire' ? '火苗' : '物品'}
                className="w-full"
                draggable="false"
                style={{
                  // 宽度填满容器，高度自动按比例缩放
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
                onDragStart={(e) => e.preventDefault()}
              />
            </motion.div>
          )
        ))}

        {/* 举盆小人 - 接触判定区在上边缘 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: playerX,
            bottom: 10,
            width: PLAYER_WIDTH,
            // 移除固定高度，让容器自适应贴图高度
          }}
        >
          {/* 盆（接收块）- 上边缘作为接触判定区 */}
          <div 
            className="absolute top-0 left-0 right-0 h-4"
            style={{
              // 这个区域的上边缘就是接触判定区
              // 需要与掉落物的碰撞检测对齐
            }}
          />
          {/* 举盆小人主体 - 使用贴图，宽度与接收块对齐，高度自适应 */}
          <img 
            src={PLAYER_TEXTURE}
            alt="举盆小人"
            className="w-full h-auto"
            draggable="false"
            style={{ width: '100%', pointerEvents: 'none' }}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 bg-memory-glow/20 transition-all duration-300"
          style={{ height: Math.min(caughtHeight, WIN_HEIGHT) }}
        />
      </div>

      {!showScenes && !started && !won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-4">这里或许能写点什么</p>
          <motion.button
            className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
          >
            开始
          </motion.button>
        </motion.div>
      )}

      {won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg"
          initial={false}
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
    </div>
  );
};

export default CatchGame;