import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpotlightGame = ({ onComplete }) => {
  const [view, setView] = useState(1);
  const [maskRemoved, setMaskRemoved] = useState(false);
  const [spotlightProgress, setSpotlightProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [view3Clickable, setView3Clickable] = useState(false);
  
  const lastClickTime = useRef(0);
  const fadeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (view === 3) {
      setView3Clickable(false);
      const timer = setTimeout(() => {
        setView3Clickable(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleHeadClick = (e) => {
    e.stopPropagation();
    if (view === 1 && !completed) {
      setView(2);
    }
  };

  const handleSpotlightClick = () => {
    if (view !== 1 || completed) return;

    const now = Date.now();
    const timeDiff = now - lastClickTime.current;
    lastClickTime.current = now;

    if (timeDiff < 500) {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }

      setSpotlightProgress(prev => {
        const newProgress = Math.min(prev + 0.05, 1);
        
        if (!maskRemoved && newProgress >= 0.8) {
          fadeTimeoutRef.current = setTimeout(() => {
            setSpotlightProgress(0);
          }, 200);
          return 0.8;
        }
        
        if (maskRemoved && newProgress >= 1) {
          setTimeout(() => {
            setView(3);
          }, 500);
          return 1;
        }
        
        return newProgress;
      });

      fadeTimeoutRef.current = setTimeout(() => {
        setSpotlightProgress(0);
      }, 1000);
    }
  };

  const handleMaskClick = (e) => {
    e.stopPropagation();
    if (view === 2 && !maskRemoved) {
      setMaskRemoved(true);
      setTimeout(() => {
        setView(1);
      }, 800);
    }
  };

  const handleBackClick = () => {
    if (view === 2) {
      setView(1);
    }
  };

  const handleCompleteClick = () => {
    if (view === 3 && view3Clickable && !completed) {
      setCompleted(true);
      onComplete();
    }
  };

  const restartGame = () => {
    setView(1);
    setMaskRemoved(false);
    setSpotlightProgress(0);
    setCompleted(false);
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <AnimatePresence mode="wait">
        {view === 1 && (
          <motion.div
            key="view1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div 
              className="relative w-full aspect-[4/3] bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden cursor-pointer"
              onClick={handleSpotlightClick}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-900/30 to-transparent" />
                
                <div className="relative">
                  <div className="w-16 h-32 bg-gray-600 rounded-t-lg" />
                  
                  <div
                    className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-14 bg-gray-500 rounded-full cursor-pointer"
                    onClick={handleHeadClick}
                  >
                    {!maskRemoved && (
                      <div className="absolute top-2 left-1 right-1 h-6 bg-black/80 rounded-t-full" />
                    )}
                  </div>
                </div>
              </div>

              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ opacity: spotlightProgress }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-700/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent" />
                
                <div className="relative">
                  <div className="w-16 h-32 bg-gray-400 rounded-t-lg shadow-[0_0_30px_rgba(255,200,100,0.5)]" />
                  
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-14 bg-gray-300 rounded-full shadow-[0_0_20px_rgba(255,200,100,0.5)]">
                    {!maskRemoved && (
                      <div className="absolute top-2 left-1 right-1 h-6 bg-black/80 rounded-t-full" />
                    )}
                  </div>
                </div>

                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, 
                      rgba(255, 200, 100, ${spotlightProgress * 0.4}) 0%, 
                      transparent 50%)`
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === 2 && (
          <motion.div
            key="view2"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <div 
              className="relative w-full aspect-[3/4] bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg overflow-hidden cursor-pointer"
              onClick={handleBackClick}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-16 bg-gray-600 rounded-t-3xl" />
                
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-24 bg-gray-500 rounded-full">
                  {!maskRemoved && (
                    <motion.div
                      className="absolute top-4 left-2 right-2 h-10 bg-black/80 rounded-t-full cursor-pointer hover:bg-black/60 transition-colors"
                      onClick={handleMaskClick}
                      animate={maskRemoved ? { y: 100, opacity: 0, rotate: 30 } : {}}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 3 && (
          <motion.div
            key="view3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative cursor-pointer"
            onClick={handleCompleteClick}
          >
            <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-amber-900/50 to-gray-900 rounded-lg overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-700/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-32 bg-gray-400 rounded-t-lg shadow-[0_0_40px_rgba(255,200,100,0.7)]" />
                
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-14 bg-gray-300 rounded-full shadow-[0_0_30px_rgba(255,200,100,0.7)]" />
              </div>

              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, 
                    rgba(255, 200, 100, 0.5) 0%, 
                    transparent 50%)`
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {completed && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-2 select-none">聚光成功!</p>
          <p className="text-memory-muted text-sm mb-4 select-none">记忆已被照亮</p>
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

export default SpotlightGame;
