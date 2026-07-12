import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OPTIONS_MAP = {
  40: ['喜欢。'],
  41: ['我觉得它是。'],
  46: ['……','好。'],
  47: ['会。'],
};

const TOTAL_IMAGES = 51;

const EchoGame = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [showOptions, setShowOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isAnimatingRef = useRef(false);

  const currentOptions = OPTIONS_MAP[currentIndex];
  const hasOptions = !!currentOptions;

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (hasOptions) {
      setTimeout(() => setShowOptions(true), 500);
    }
  };

  const handleOptionClick = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setShowOptions(false);
    setTimeout(() => {
      advanceImage();
    }, 300);
  };

  const handleImageClick = () => {
    if (isAnimatingRef.current) return;
    if (hasOptions && showOptions) return;
    advanceImage();
  };

  const advanceImage = () => {
    if (currentIndex >= TOTAL_IMAGES) {
      onComplete();
    } else {
      setImageLoaded(false);
      setShowOptions(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        isAnimatingRef.current = false;
      }, 200);
    }
  };

  const imageSrc = `/images/echo/${currentIndex}.webp`;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-[76%] max-w-[90vw] aspect-[3/4.2] select-none">

        <div
          className="relative w-full h-full bg-gradient-to-b from-memory-dark to-black rounded overflow-hidden select-none cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="absolute inset-0 flex items-center justify-center pb-[8%]">
            <img
              src={imageSrc}
              alt={`echo-${currentIndex}`}
              className="w-full h-[92%] object-contain"
              onLoad={handleImageLoad}
            />
          </div>

          <AnimatePresence>
            {showOptions && currentOptions && (
              <motion.div
                className="absolute inset-x-12 bottom-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-row gap-2">
                  {currentOptions.map((option, i) => (
                    <motion.button
                      key={i}
                      className="flex-1 py-2 px-4 bg-memory-glow/10 text-memory-glow/80 rounded border border-memory-glow/20 text-sm hover:bg-memory-glow/20 transition-colors select-none"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick();
                      }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!hasOptions && imageLoaded && (
            <motion.div
              className="absolute bottom-4 right-4 text-memory-glow/30 text-xs select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              点击继续
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EchoGame;