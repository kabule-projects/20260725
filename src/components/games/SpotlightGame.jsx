import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpotlightGame = ({ onComplete }) => {
  const [view, setView] = useState(1);
  const [maskRemoved, setMaskRemoved] = useState(false);
  const [spotlightProgress, setSpotlightProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [view3Clickable, setView3Clickable] = useState(false);
  const [hintChanged, setHintChanged] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  
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

  useEffect(() => {
    if (view === 3) {
      setSkipTransition(false);
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
          setHintChanged(true);
          return 0.8;
        }
        
        if (maskRemoved && newProgress >= 1) {
          setSkipTransition(true);
          setView(3);
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
    setHintChanged(false);
  };

  return (
    <div className="w-full h-full px-[6%] py-[6%] flex items-center justify-center">
      <div className="relative w-full bg-memory-dark/50 rounded-lg p-4">
        <AnimatePresence mode="popLayout">
          {view === 1 && (
            <motion.div
              key="view1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ exit: { duration: skipTransition ? 0 : undefined } }}
              className="relative"
            >
              {/* 提示词 */}
              {!completed && (
                <p className="text-memory-accent text-sm text-center mb-2 select-none">
                  {maskRemoved ? '我可不是什么幺蛾子' : hintChanged ? '光真的照亮他了吗？' : '快速点击聚光'}
                </p>
              )}
              
              <div 
                className="relative w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden mx-auto"
                onClick={handleSpotlightClick}
              >
              {/* 远景底图：根据maskRemoved状态选择 */}
              <img
                src={maskRemoved ? '/images/spotlight/无打光无面具.jpg' : '/images/spotlight/无打光面具.jpg'}
                alt="远景"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* 打光面具图层 */}
              <motion.img
                key={`mask-${view}`}
                src="/images/spotlight/打光面具.jpg"
                alt="打光效果"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: !maskRemoved ? spotlightProgress : 0 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* 打光无面具图层 */}
              <motion.img
                key={`no-mask-${view}`}
                src="/images/spotlight/打光无面具.jpg"
                alt="打光效果"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: maskRemoved ? spotlightProgress : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* 头部透明按钮：点击进入近景 */}
              {!completed && (
                <button
                  className="absolute top-[22%] left-[30%] w-[40%] h-[20%] bg-transparent cursor-pointer z-10"
                  onClick={handleHeadClick}
                  style={{ border: 'none', outline: 'none' }}
                />
              )}
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
              className="relative w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden mx-auto"
              onClick={handleBackClick}
            >
              {/* 近景：显示面具或人 */}
              <img
                src={maskRemoved ? '/images/spotlight/人.png' : '/images/spotlight/面具.png'}
                alt="近景"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* 面具透明按钮：点击显示人 */}
              {!maskRemoved && (
                <button
                  className="absolute top-[30%] left-[25%] w-[50%] h-[30%] bg-transparent cursor-pointer z-10"
                  onClick={handleMaskClick}
                  style={{ border: 'none', outline: 'none' }}
                />
              )}
            </div>
          </motion.div>
        )}

        {view === 3 && (
          <motion.div
            key="view3"
            initial={skipTransition ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
            onClick={handleCompleteClick}
          >
            <div className="relative w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden mx-auto">
              {/* 毕业 */}
              <img
                src="/images/spotlight/毕业.jpg"
                alt="毕业"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {completed && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center select-none z-50"
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
  </div>
);
};

export default SpotlightGame;