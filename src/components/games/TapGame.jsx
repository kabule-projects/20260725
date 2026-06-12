import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 游戏轮次配置（总共5轮）
const ROUNDS = [
  { id: 1, type: 'tap', title: '点击偷吃土豆丝', description: '趁爸妈不注意，狠狠偷吃六包！' },
  { id: 2, type: 'hold', title: '准备出国啦！', description: '有好好准备哦' },
  { id: 3, type: 'tap', title: '点击按下正确琴键', description: '什么时候开始学习都不晚' },
  { id: 4, type: 'hold', title: '巡回演唱会加油加油加油！', description: '终于要见面啦' },
  { id: 5, type: 'tap', title: '点击发布专辑', description: '不能再改了！' },
];

const TARGET_ZONE_WIDTH = 20; // 目标区域占bar宽度的百分比
const INITIAL_SPEED = 1; // 初始速度
const SPEED_INCREMENT = 0.2; // 每轮速度增加量
const HOLD_DURATION = 2000; // 蓄力时长

const TapGame = ({ onComplete }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Tap游戏状态
  const [arrowPosition, setArrowPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [roundResult, setRoundResult] = useState(null);
  
  // Hold游戏状态
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdCompleted, setHoldCompleted] = useState(false);
  
  // Refs
  const animationRef = useRef(null);
  const holdAnimationRef = useRef(null);
  const startTimeRef = useRef(null);

  // 当前轮次信息
  const currentRound = ROUNDS[currentRoundIndex];
  const isTapRound = currentRound?.type === 'tap';
  const isHoldRound = currentRound?.type === 'hold';

  // 计算当前速度（基于tap轮次的索引）
  const tapRoundIndex = ROUNDS.slice(0, currentRoundIndex + 1).filter(r => r.type === 'tap').length - 1;
  const currentSpeed = INITIAL_SPEED + (tapRoundIndex * SPEED_INCREMENT);

  // 箭头动画
  useEffect(() => {
    if (!isPlaying || isPaused || !isTapRound) return;

    const animate = () => {
      setArrowPosition(prev => {
        const newPosition = prev + direction * currentSpeed;
        
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
  }, [isPlaying, isPaused, direction, currentSpeed, isTapRound]);

  // 清理蓄力动画
  useEffect(() => {
    return () => {
      if (holdAnimationRef.current) {
        cancelAnimationFrame(holdAnimationRef.current);
      }
    };
  }, []);

  // 检查是否命中目标区域
  const checkHit = useCallback((position) => {
    const targetCenter = 50;
    const targetHalfWidth = TARGET_ZONE_WIDTH / 2;
    return position >= targetCenter - targetHalfWidth && position <= targetCenter + targetHalfWidth;
  }, []);

  // 点击停下箭头
  const handleTap = useCallback(() => {
    if (!isPlaying || isPaused || !isTapRound) return;
    
    setIsPaused(true);
    
    const isHit = checkHit(arrowPosition);
    setRoundResult(isHit ? 'success' : 'fail');
  }, [isPlaying, isPaused, arrowPosition, checkHit, isTapRound]);

  // 开始蓄力
  const startHold = useCallback(() => {
    if (holdCompleted || !isHoldRound) return;
    setIsHolding(true);
    startTimeRef.current = null;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

      setHoldProgress(progress);

      if (progress >= 100 && !holdCompleted) {
        setHoldCompleted(true);
        setTimeout(() => {
          handleNextRound();
        }, 500);
      } else if (progress < 100) {
        holdAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    holdAnimationRef.current = requestAnimationFrame(animate);
  }, [holdCompleted, isHoldRound]);

  // 停止蓄力
  const stopHold = useCallback(() => {
    setIsHolding(false);
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current);
    }
    if (!holdCompleted && isHoldRound) {
      setHoldProgress(0);
      startTimeRef.current = null;
    }
  }, [holdCompleted, isHoldRound]);

  // 下一轮
  const handleNextRound = useCallback(() => {
    // 重置状态
    setIsPaused(false);
    setRoundResult(null);
    setArrowPosition(50);
    setDirection(1);
    setHoldCompleted(false);
    setHoldProgress(0);
    setIsHolding(false);
    
    if (currentRoundIndex < ROUNDS.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // 通关
      onComplete();
    }
  }, [currentRoundIndex, onComplete]);

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
    setCurrentRoundIndex(0);
    setRoundResult(null);
    setArrowPosition(50);
    setDirection(1);
    setHoldCompleted(false);
    setHoldProgress(0);
    setIsHolding(false);
  }, []);

  // ========== 蓄力游戏组件 ==========
  const HoldChallenge = () => (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">第 {currentRound?.id} / {ROUNDS.length} 轮</p>
        <p className="text-memory-glow/80 text-sm mt-1">{currentRound?.title}</p>
        <p className="text-memory-muted/60 text-xs mt-1">{currentRound?.description}</p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {ROUNDS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < currentRoundIndex
                ? 'bg-memory-accent'
                : index === currentRoundIndex
                ? 'bg-memory-glow animate-pulse'
                : 'bg-memory-muted/30'
            }`}
          />
        ))}
      </div>

      <motion.div
        className="relative w-32 h-32 mx-auto rounded-full border-4 border-memory-muted/30 flex items-center justify-center cursor-pointer"
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        whileHover={{ scale: holdCompleted ? 1 : 1.05 }}
        whileTap={{ scale: holdCompleted ? 1 : 0.95 }}
      >
        <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(107, 107, 123, 0.3)"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={holdCompleted ? "#d4af37" : "#e8d5b7"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={289}
            strokeDashoffset={289 - (289 * holdProgress) / 100}
            animate={{ strokeDashoffset: 289 - (289 * holdProgress) / 100 }}
            transition={{ duration: 0.1 }}
          />
        </svg>

        <motion.span
          className="text-3xl"
          animate={{
            scale: isHolding ? [1, 1.2, 1] : 1,
            opacity: isHolding ? 1 : 0.6,
          }}
          transition={{ repeat: isHolding ? Infinity : 0, duration: 0.5 }}
        >
          ✧
        </motion.span>

        {holdCompleted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-memory-accent text-4xl">★</span>
          </motion.div>
        )}
      </motion.div>

      <p className="mt-6 text-center text-memory-muted text-xs">
        {holdCompleted ? "蓄力完成！" : isHolding ? "蓄力中..." : "按住蓄力"}
      </p>
    </div>
  );

  // ========== 见缝插针游戏组件 ==========
  const TapChallenge = () => (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">第 {currentRound?.id} / {ROUNDS.length} 轮</p>
        <p className="text-memory-glow/80 text-sm mt-1">{currentRound?.title}</p>
        <p className="text-memory-muted/60 text-xs mt-1">{currentRound?.description}</p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {ROUNDS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < currentRoundIndex
                ? 'bg-memory-accent'
                : index === currentRoundIndex
                ? 'bg-memory-glow'
                : 'bg-memory-muted/30'
            }`}
          />
        ))}
      </div>

      <div className="relative">
        <div className="relative w-full h-8 bg-memory-dark/80 rounded-full overflow-hidden border border-memory-accent/20">
          <div className="absolute inset-0 bg-gradient-to-r from-memory-accent/10 via-memory-accent/20 to-memory-accent/10" />
          
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
                    {currentRoundIndex < ROUNDS.length - 1 ? '下一轮' : '完成'}
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

  // ========== 主渲染 ==========
  if (!isPlaying) {
    return TapChallenge();
  }

  return isHoldRound ? HoldChallenge() : TapChallenge();
};

export default TapGame;