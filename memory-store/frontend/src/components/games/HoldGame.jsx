import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const HoldGame = ({ onComplete }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const HOLD_DURATION = 2000;

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

    setHoldProgress(progress);

    if (progress >= 100 && !completed) {
      setCompleted(true);
      onComplete();
    } else if (progress < 100) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [completed, onComplete]);

  const startHold = () => {
    if (completed) return;
    setIsHolding(true);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (!completed) {
      setHoldProgress(0);
      startTimeRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto bg-memory-dark/50 rounded-lg surreal-border flex flex-col items-center justify-center p-6">
      <p className="text-memory-glow/60 text-sm text-center mb-8">
        按住以稳定光芒
      </p>

      <motion.div
        className="relative w-32 h-32 rounded-full border-4 border-memory-muted/30 flex items-center justify-center cursor-pointer"
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        whileHover={{ scale: completed ? 1 : 1.05 }}
        whileTap={{ scale: completed ? 1 : 0.95 }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="rgba(107, 107, 123, 0.3)"
            strokeWidth="4"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke={completed ? "#d4af37" : "#e8d5b7"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * holdProgress) / 100}
            animate={{ strokeDashoffset: 377 - (377 * holdProgress) / 100 }}
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

        {completed && (
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

      <p className="mt-6 text-memory-muted text-xs">
        {completed ? "记忆已稳定" : isHolding ? "正在稳定..." : "按住"}
      </p>
    </div>
  );
};

export default HoldGame;