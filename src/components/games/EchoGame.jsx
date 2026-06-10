import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIALOGUES = [
  {
    id: 0,
    question: "你喜欢音乐吗？",
    answers: ["喜欢"],
    correctAnswer: null,
    autoAdvance: true,
    nextIndex: 1
  },
  {
    id: 1,
    question: "你会一直唱下去吗？",
    answers: ["会", "我不知道"],
    correctAnswer: "会",
    autoAdvance: false,
    nextIndex: 2
  },
  {
    id: 2,
    question: "古典还是流行？",
    answers: ["……"],
    correctAnswer: null,
    autoAdvance: true,
    nextIndex: 3
  },
  {
    id: 3,
    question: "我知道你喜欢流行，去唱你喜欢的吧。",
    answers: ["好"],
    correctAnswer: null,
    autoAdvance: true,
    nextIndex: 4
  },
  {
    id: 4,
    question: "只要我还活着，只要你回来，我一定教你唱更难的曲子、更高的音。",
    answers: ["好"],
    correctAnswer: null,
    autoAdvance: true,
    nextIndex: -1
  }
];

const EchoGame = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const isAnimatingRef = useRef(false);

  const currentDialogue = DIALOGUES[currentIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDialogue(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = (answer) => {
    if (isAnimatingRef.current) return;
    
    if (currentDialogue.correctAnswer && answer !== currentDialogue.correctAnswer) {
      isAnimatingRef.current = true;
      setShowDialogue(false);
      setTimeout(() => {
        setShowDialogue(true);
        setAnimationKey(prev => prev + 1);
        isAnimatingRef.current = false;
      }, 300);
      return;
    }

    advanceDialogue();
  };

  const advanceDialogue = () => {
    if (isAnimatingRef.current) return;
    
    if (currentDialogue.nextIndex === -1) {
      onComplete();
    } else {
      isAnimatingRef.current = true;
      setShowDialogue(false);
      setTimeout(() => {
        setCurrentIndex(currentDialogue.nextIndex);
        setShowDialogue(true);
        setAnimationKey(prev => prev + 1);
        isAnimatingRef.current = false;
      }, 300);
    }
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <p className="text-memory-glow/60 text-sm text-center mb-2 select-none">
        回声
      </p>

      <div
        className="relative w-full bg-gradient-to-b from-memory-dark to-black rounded overflow-hidden select-none"
        style={{ height: 320 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-24 rounded-full bg-memory-glow/10 blur-xl"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-memory-glow/30 to-transparent" />
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-memory-dark/90 to-transparent" />

        <div className="absolute inset-x-4 bottom-4 select-none">
          <AnimatePresence mode="wait">
            {showDialogue && (
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {currentDialogue.answers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-memory-glow text-sm text-center mb-3">
                      {currentDialogue.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {currentDialogue.answers.map((answer, i) => (
                        <motion.button
                          key={i}
                          className="w-full py-2 px-4 bg-memory-glow/10 text-memory-glow/80 rounded border border-memory-glow/20 text-sm hover:bg-memory-glow/20 transition-colors select-none"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(answer)}
                        >
                          {answer}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-memory-glow/60 text-sm mb-3">
                      {currentDialogue.question}
                    </p>
                    <motion.button
                      className="text-memory-glow/40 text-xs hover:text-memory-glow/60 transition-colors select-none"
                      whileHover={{ scale: 1.05 }}
                      onClick={advanceDialogue}
                    >
                      继续...
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EchoGame;