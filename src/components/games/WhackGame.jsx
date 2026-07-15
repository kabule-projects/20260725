import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// 游戏配置
const GRID_SIZE = 5; // 5x5 格盘
const TOTAL_SUCCESS = 12; // 需要连续成功点击的次数
const INITIAL_DURATION = 1000; // 初始亮灯时长（毫秒）
const MIN_DURATION = 600; // 最短亮灯时长
const DURATION_DECREASE = 30; // 每次成功后减少的时长

const WhackGame = ({ onComplete }) => {
  const [activeCell, setActiveCell] = useState(null); // 当前亮起的格子 { row, col }
  const [activeImage, setActiveImage] = useState(null); // 当前显示的图片文件名
  const [score, setScore] = useState(0); // 成功次数
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'win'
  const [isClicked, setIsClicked] = useState(false); // 是否已点击当前格子
  const timeoutRef = useRef(null);
  const currentImageRef = useRef(null);
  
  const imageFiles = ['1.webp', '2.webp', '3.webp', 'bomb.webp'];

  // 计算当前亮灯时长
  const getCurrentDuration = useCallback(() => {
    return Math.max(MIN_DURATION, INITIAL_DURATION - (score * DURATION_DECREASE));
  }, [score]);

  // 随机选择一个格子
  const getRandomCell = useCallback(() => {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    return { row, col };
  }, []);

  // 亮起下一个格子
  const showNextCell = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const newCell = getRandomCell();
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    currentImageRef.current = randomImage;
    setActiveCell(newCell);
    setActiveImage(randomImage);
    setIsClicked(false);
    
    // 设置超时，如果用户没点击则游戏失败
    const duration = getCurrentDuration();
    timeoutRef.current = setTimeout(() => {
      if (!isClicked) {
        if (currentImageRef.current !== 'bomb.webp') {
          // 超时未点击普通图片，重置分数
          setScore(0);
        }
        // 超时未点击炸弹，不重置分数
        showNextCell();
      }
    }, duration);
  }, [gameState, getRandomCell, getCurrentDuration, isClicked, imageFiles]);

  // 开始游戏
  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setGameState('playing');
    showNextCell();
  }, [showNextCell]);

  // 点击格子
  const handleCellClick = useCallback((row, col) => {
    if (!isPlaying || gameState !== 'playing' || isClicked) return;
    
    // 检查是否点击了正确的格子
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      setIsClicked(true);
      clearTimeout(timeoutRef.current);
      setActiveCell(null);
      
      if (activeImage === 'bomb.webp') {
        // 点击炸弹，分数清零
        setScore(0);
      } else {
        // 点击普通图片，分数增加
        const newScore = score + 1;
        setScore(newScore);
        
        // 检查是否通关
        if (newScore >= TOTAL_SUCCESS) {
          setGameState('win');
          onComplete();
          return;
        }
      }
      
      // 继续下一轮
      setTimeout(() => {
        showNextCell();
      }, 100);
    }
    // 点击非亮起格子，没有任何后果
  }, [isPlaying, gameState, isClicked, activeCell, activeImage, score, showNextCell, onComplete]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 游戏完成界面
  if (gameState === 'win') {
    return
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-full max-w-[340px] bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      {/* 标题 */}
      <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">追光</h2>
      </div>

      {/* 分数 */}
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">
          {score} / {TOTAL_SUCCESS}
        </p>
      </div>

      {/* 进度条 */}
      <div className="w-full h-2 bg-memory-dark/80 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-memory-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(score / TOTAL_SUCCESS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 游戏格盘 */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;
          const isActive = activeCell && activeCell.row === row && activeCell.col === col;
          const isBomb = isActive && activeImage === 'bomb.webp';
          
          return (
            <motion.div
              key={index}
              className="relative aspect-square rounded-md cursor-pointer border border-memory-accent/20 overflow-hidden"
              onClick={() => handleCellClick(row, col)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: isActive 
                  ? isBomb 
                    ? 'rgba(255, 150, 150, 0.8)' 
                    : 'rgba(175, 220, 233, 0.8)' 
                  : 'rgba(26, 26, 46, 0.5)',
                boxShadow: isActive 
                  ? isBomb 
                    ? '0 0 20px rgba(255, 150, 150, 0.6)' 
                    : '0 0 20px rgba(175, 220, 233, 0.6)' 
                  : '0 0 0px rgba(175, 220, 233, 0)',
              }}
              transition={{ duration: 0.15 }}
            >
              {isActive && activeImage && (
                <img
                  src={`/images/whack/${activeImage}`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain p-1"
                  style={{
                    filter: isBomb 
                      ? 'drop-shadow(0 0 15px rgba(255, 100, 100, 1))' 
                      : 'drop-shadow(0 0 15px rgba(255, 255, 255, 1))'
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 开始按钮 */}
      {!isPlaying && (
        <div className="mt-4">
          <motion.button
            className="w-full py-3 rounded-lg bg-memory-info/10 text-memory-info hover:bg-memory-info/20 transition-colors border border-memory-info"
            onClick={startGame}
            whileTap={{ scale: 0.98 }}
          >
            开始游戏
          </motion.button>
        </div>
      )}

      {/* 提示 */}
      {isPlaying && (
        <div className="mt-4 text-center">
          <p className="text-memory-muted/60 text-xs">点击亮起的格子，当心混进来的小恶魔！</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default WhackGame;