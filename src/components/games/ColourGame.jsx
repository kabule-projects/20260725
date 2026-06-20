import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ColourGame = ({ config, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const resetGame = useCallback(() => {
    setCurrentStep(0);
    setWrongAnswer(false);
    setShowCompletion(false);
  }, []);

  const handleAnswer = useCallback((answerIndex) => {
    if (answerIndex === config.steps[currentStep].correctAnswer) {
      if (currentStep < config.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowCompletion(true);
      }
    } else {
      setWrongAnswer(true);
    }
  }, [currentStep, config.steps]);

  const handleWakeUp = () => {
    onComplete();
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative max-w-lg px-[12%] py-[12%] bg-memory-dark/50 rounded-lg p-4 select-none">
      <div className="relative w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden mb-4">
        {config.baseImage ? (
          <img 
            src={config.baseImage} 
            alt="底图" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-memory-muted/50">
            底图占位
          </div>
        )}
        
        {showCompletion ? (
          config.steps.map((step, index) => (
            step.layer ? (
              <img 
                key={index}
                src={step.layer}
                alt={`图层${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div 
                key={index}
                className="absolute inset-0 w-full h-full flex items-center justify-center text-memory-accent/30 pointer-events-none"
              >
                图层{index + 1}占位
              </div>
            )
          ))
        ) : (
          config.steps.slice(0, currentStep).map((step, index) => (
            step.layer ? (
              <img 
                key={index}
                src={step.layer}
                alt={`图层${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div 
                key={index}
                className="absolute inset-0 w-full h-full flex items-center justify-center text-memory-accent/30 pointer-events-none"
              >
                图层{index + 1}占位
              </div>
            )
          ))
        )}
      </div>

      <AnimatePresence>
        {wrongAnswer && (
          <motion.div
            className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center rounded-lg z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-memory-glow text-center mb-6 px-4 leading-relaxed">
              眼前的景象变得模糊，你渐渐从梦中苏醒，不知怎么才能回到那里。
            </p>
            <motion.button
              className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
            >
              再试试
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {!wrongAnswer && !showCompletion && (
        <div className="flex flex-col gap-3">
          <p className="text-memory-glow text-center leading-relaxed">
            {config.steps[currentStep].question}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {config.steps[currentStep].options.map((option, index) => (
              <motion.button
                key={index}
                className="px-4 py-3 bg-memory-glow/10 text-memory-glow rounded-lg border border-memory-glow/20 hover:bg-memory-glow/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(index)}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {showCompletion && (
        <motion.div
          className="flex flex-col items-center gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-memory-glow text-center leading-relaxed">
            你想起自己曾见过那头小鹿和它的玫瑰。
          </p>
          <motion.button
            className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWakeUp}
          >
            从梦中醒来
          </motion.button>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default ColourGame;
