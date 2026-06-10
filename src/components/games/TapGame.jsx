import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 游戏配置
const ROUNDS = [
  { id: 1, title: '点击偷吃土豆丝', description: '趁爸妈不注意，狠狠偷吃六包！' },
  { id: 2, title: '点击按下正确琴键', description: '什么时候开始学习都不晚' },
  { id: 3, title: '点击发布专辑', description: '不能再改了！' },
];

const TARGET_ZONE_WIDTH = 20; // 目标区域占bar宽度的百分比
const INITIAL_SPEED = 1; // 初始速度
const SPEED_INCREMENT = 0.2; // 每轮速度增加量

const TapGame = ({ onComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [arrowPosition, setArrowPosition] = useState(50); // 箭头位置（百分比）
  const [direction, setDirection] = useState(1); // 1向右，-1向左
  const [roundResult, setRoundResult] = useState(null); // 'success' | 'fail' | null
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'win' | 'fail'
  const animationRef = useRef(null);

  // 当前速度
  const currentSpeed = INITIAL_SPEED + (currentRound * SPEED_INCREMENT);

  // 箭头动画
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const animate = () => {
      setArrowPosition(prev => {
        const newPosition = prev + direction * currentSpeed;
        
        // 碰到边界时改变方向
        if (newPosition >= 100) {
          setDirection(-1);
          return 100;
        } else if (newPosition <= 0) {
          setDirection(1);
          return 0;
        }
        
        return newPosition;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused, direction, currentSpeed]);

  // 检查是否命中目标区域
  const checkHit = useCallback((position) => {
    const targetCenter = 50;
    const targetHalfWidth = TARGET_ZONE_WIDTH / 2;
    return position >= targetCenter - targetHalfWidth && position <= targetCenter + targetHalfWidth;
  }, []);

  // 点击停下箭头
  const handleTap = useCallback(() => {
    if (!isPlaying || isPaused) return;
    
    setIsPaused(true);
    
    // 检查是否命中目标区域
    const isHit = checkHit(arrowPosition);
    setRoundResult(isHit ? 'success' : 'fail');
  }, [isPlaying, isPaused, arrowPosition, checkHit]);

  // 下一轮
  const handleNextRound = useCallback(() => {
    setIsPaused(false);
    setRoundResult(null);
    setArrowPosition(50);
    setDirection(1);
    
    if (currentRound < ROUNDS.length - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      // 通关
      setGameState('win');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [currentRound, onComplete]);

  // 重试当前轮
  const handleRetry = useCallback(() => {
    setIsPaused(false);
    setRoundResult(null);
    setArrowPosition(50);
    setDirection(1);
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    setIsPlaying(true);
    setCurrentRound(0);
    setRoundResult(null);
    setArrowPosition(50);
    setDirection(1);
    setGameState('playing');
  }, []);

  // 游戏完成界面
  if (gameState === 'win') {
    return (
      <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none flex flex-col items-center justify-center min-h-[300px]">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-memory-accent text-lg">✧ 记忆已刻印 ✧</p>
          <p className="text-memory-muted text-sm">我们听到了 我们看到了</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      {/* 标题 */}
      {/* <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">节奏游戏</h2>
      </div> */}

      {/* 轮次信息 */}
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">第 {currentRound + 1} / {ROUNDS.length} 轮</p>
        <p className="text-memory-glow/80 text-sm mt-1">{ROUNDS[currentRound]?.title}</p>
        <p className="text-memory-muted/60 text-xs mt-1">{ROUNDS[currentRound]?.description}</p>
      </div>

      {/* 进度指示 */}
      <div className="flex justify-center gap-2 mb-4">
        {ROUNDS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < currentRound
                ? 'bg-memory-accent'
                : index === currentRound
                ? 'bg-memory-glow'
                : 'bg-memory-muted/30'
            }`}
          />
        ))}
      </div>

      {/* 游戏区域 */}
      <div className="relative">
        {/* 横向Bar */}
        <div className="relative w-full h-8 bg-memory-dark/80 rounded-full overflow-hidden border border-memory-accent/20">
          {/* 背景渐变 */}
          <div className="absolute inset-0 bg-gradient-to-r from-memory-accent/10 via-memory-accent/20 to-memory-accent/10" />
          
          {/* 目标区域 */}
          <motion.div
            className="absolute top-0 h-full bg-memory-glow/30 rounded-full"
            style={{
              left: `${50 - TARGET_ZONE_WIDTH / 2}%`,
              width: `${TARGET_ZONE_WIDTH}%`,
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-memory-glow text-xs font-medium">目标</span>
            </div>
          </motion.div>
        </div>

        {/* 箭头 */}
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 select-none pointer-events-none"
          style={{ left: `${arrowPosition}%` }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-full h-full text-memory-glow">
              <path
                fill="currentColor"
                d="M12 2L16 8h-3v10h-2V8H8L12 2z"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* 停止按钮 */}
      {isPlaying && !isPaused && (
        <div className="mt-12">
          <motion.button
            className="w-full py-4 rounded-lg bg-memory-accent/30 text-memory-accent hover:bg-memory-accent/40 transition-colors text-lg font-medium border border-memory-accent/40"
            onClick={handleTap}
            whileTap={{ scale: 0.95 }}
          >
            停！
          </motion.button>
        </div>
      )}

      {/* 提示文字 */}
      <div className="text-center mt-12">
        {!isPlaying ? (
          <motion.button
            className="w-full py-3 rounded-lg bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors"
            onClick={startGame}
            whileTap={{ scale: 0.98 }}
          >
            开始游戏
          </motion.button>
        ) : !isPaused ? (
          <p className="text-memory-muted/60 text-sm">点击箭头停下</p>
        ) : (
          <AnimatePresence>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {roundResult === 'success' ? (
                <>
                  <p className="text-memory-accent text-lg">✧ 成功！✧</p>
                  <motion.button
                    className="w-full py-3 rounded-lg bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors"
                    onClick={handleNextRound}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentRound < ROUNDS.length - 1 ? '下一轮' : '完成'}
                  </motion.button>
                </>
              ) : (
                <>
                  <p className="text-memory-error text-lg">失败...</p>
                  <p className="text-memory-muted/60 text-sm">再试一次吧！</p>
                  <motion.button
                    className="w-full py-3 rounded-lg bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors"
                    onClick={handleRetry}
                    whileTap={{ scale: 0.98 }}
                  >
                    再试一次
                  </motion.button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TapGame;