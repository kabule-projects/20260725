import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ColourGame = ({ config, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false);

  const resetGame = useCallback(() => {
    setCurrentStep(0);
    setWrongAnswer(false);
  }, []);

  const handleAnswer = useCallback((answerIndex) => {
    const step = config.steps[currentStep];
    if (answerIndex === step.correctAnswer) {
      if (currentStep < config.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setWrongAnswer(true);
    }
  }, [currentStep, config.steps]);

  const handleContinue = useCallback(() => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, config.steps.length]);

  const handleEndJourney = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const step = config.steps[currentStep];
  const hasOptions = step.options && step.options.length > 0;
  const isLastStep = currentStep === config.steps.length - 1;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full px-[12%] py-[9%] bg-memory-dark/50 rounded-lg p-4 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={step.image}
                alt={`步骤 ${currentStep + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {step.cueLines && (
              <p className="text-memory-glow text-center leading-relaxed text-sm">
                {step.cueLines.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            )}

            {hasOptions ? (
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {step.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="px-4 py-3 bg-memory-glow/10 text-memory-glow rounded-lg border border-memory-glow/20 hover:bg-memory-glow/20 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : isLastStep ? (
              <motion.button
                className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndJourney}
              >
                结束旅程
              </motion.button>
            ) : (
              <motion.button
                className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
              >
                继续前行
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

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
      </div>
    </div>
  );
};

export default ColourGame;