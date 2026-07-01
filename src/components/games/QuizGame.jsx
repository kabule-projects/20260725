import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 1,
    image: '/images/quiz/quiz-1.jpg',
    question: '这是哪次舞台？',
    options: ['选这个', '选项B', '选项C', '选项D'],
    correctAnswer: 0,
  },
  {
    id: 2,
    image: '/images/quiz/quiz-2.jpg',
    question: '这是哪次舞台？',
    options: ['选项A', '选这个', '选项C', '选项D'],
    correctAnswer: 1,
  },
  {
    id: 3,
    image: '/images/quiz/quiz-3.jpg',
    question: '这是哪次舞台？',
    options: ['选项A', '选项B', '选这个', '选项D'],
    correctAnswer: 2,
  },
  {
    id: 4,
    image: '/images/quiz/quiz-4.jpg',
    question: '这是哪次舞台？',
    options: ['选项A', '选项B', '选项C', '选这个'],
    correctAnswer: 3,
  },
  {
    id: 5,
    image: '/images/quiz/quiz-5.jpg',
    question: '这是哪次舞台？',
    options: ['选这个', '选项B', '选项C', '选项D'],
    correctAnswer: 0,
  },
];

const TIME_LIMIT = 5;

const QuizGame = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(Array(QUESTIONS.length).fill('unanswered'));
  const [showResult, setShowResult] = useState(false);
  const [imageSize, setImageSize] = useState(200);
  const imageContainerRef = useRef(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // 计算图片容器尺寸，确保宽度=高度
  useEffect(() => {
    const updateImageSize = () => {
      if (imageContainerRef.current) {
        const container = imageContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const maxSize = Math.min(containerRect.width, containerRect.height);
        setImageSize(Math.floor(maxSize));
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const allCorrect = questionStatus.every(status => status === 'correct');
    if (allCorrect) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [questionStatus, onComplete]);

  useEffect(() => {
    if (showResult) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResult]);

  const handleTimeout = useCallback(() => {
    setShowResult(true);
    setQuestionStatus(prev => {
      const newStatus = [...prev];
      if (newStatus[currentQuestionIndex] !== 'correct') {
        newStatus[currentQuestionIndex] = 'timeout';
      }
      return newStatus;
    });
  }, [currentQuestionIndex]);

  const handleSelectAnswer = useCallback((index) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === currentQuestion.correctAnswer) {
      setQuestionStatus(prev => {
        const newStatus = [...prev];
        newStatus[currentQuestionIndex] = 'correct';
        return newStatus;
      });
    } else {
      setQuestionStatus(prev => {
        const newStatus = [...prev];
        if (newStatus[currentQuestionIndex] !== 'correct') {
          newStatus[currentQuestionIndex] = 'wrong';
        }
        return newStatus;
      });
    }
  }, [showResult, currentQuestion, currentQuestionIndex]);

  const goToNextUnanswered = useCallback(() => {
    setShowResult(false);
    setSelectedAnswer(null);
    setTimeLeft(TIME_LIMIT);
    
    let nextIndex = (currentQuestionIndex + 1) % QUESTIONS.length;
    let attempts = 0;
    
    while (questionStatus[nextIndex] === 'correct' && attempts < QUESTIONS.length) {
      nextIndex = (nextIndex + 1) % QUESTIONS.length;
      attempts++;
    }
    
    setCurrentQuestionIndex(nextIndex);
  }, [currentQuestionIndex, questionStatus]);

  const correctCount = questionStatus.filter(s => s === 'correct').length;

  return (
    <div className="w-full h-full px-[12%] py-[12%] flex flex-col" style={{ maxHeight: '100vh', maxWidth: '100vw' }}>
      {/* 顶部信息区 - 固定高度 */}
      <div className="flex-shrink-0 mb-2">
        {/* 进度条 */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-memory-muted mb-1">
            <span>进度: {correctCount} / {QUESTIONS.length}</span>
            <span>题目 {currentQuestionIndex + 1}</span>
          </div>
          <div className="h-1.5 bg-memory-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-memory-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(correctCount / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 题目状态指示器 */}
        <div className="flex justify-center gap-1.5 mb-2">
          {questionStatus.map((status, index) => (
            <motion.div
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'correct' ? 'bg-green-500' :
                status === 'wrong' ? 'bg-red-500' :
                status === 'timeout' ? 'bg-yellow-500' :
                'bg-memory-muted/30'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {/* 倒计时 */}
        <div className="flex justify-center mb-2">
          <div
            className={`text-3xl font-bold ${
              timeLeft <= 2 ? 'text-red-500' : 'text-memory-accent'
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* 中间图片区 - 自适应占据剩余空间 */}
      <div className="flex-1 flex items-center justify-center min-h-0 mb-2" ref={imageContainerRef}>
        <motion.div
          className="relative rounded-lg overflow-hidden bg-memory-dark/80 border border-memory-muted/20"
          style={{ 
            width: imageSize,
            height: imageSize
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={currentQuestionIndex}
        >
          <img
            src={currentQuestion.image}
            alt={currentQuestion.question}
            className="w-full h-full object-cover"
          />
          <AnimatePresence>
            {showResult && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center ${
                  selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-5xl font-bold text-white drop-shadow-lg">
                  {selectedAnswer === currentQuestion.correctAnswer ? '✓' : '✗'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 题目和选项区 - 固定高度 */}
      <div className="flex-shrink-0 mb-2">
        {/* 题目 */}
        <h3 className="text-base text-center text-memory-light mb-2">
          {currentQuestion.question}
        </h3>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-2">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = 'border-memory-muted/30 hover:border-memory-accent/50 hover:bg-memory-accent/10';
            
            if (showResult) {
              if (index === currentQuestion.correctAnswer) {
                buttonClass = 'border-green-500 bg-green-500/20';
              } else if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
                buttonClass = 'border-red-500 bg-red-500/20';
              }
            } else if (selectedAnswer === index) {
              buttonClass = 'border-memory-accent bg-memory-accent/20';
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={`px-2 py-2 rounded-lg border-2 text-memory-light text-sm font-medium transition-all ${buttonClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                whileTap={!showResult ? { scale: 0.97 } : {}}
              >
                {String.fromCharCode(65 + index)}. {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 按钮区 - 固定高度预留空间 */}
      <div className="flex-shrink-0 min-h-[60px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className={`mb-2 text-sm ${
                selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 
                selectedAnswer !== null ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '回答正确' :
                 selectedAnswer !== null ? '回答错误' : '时间到'}
              </p>
              <button
                onClick={goToNextUnanswered}
                className="px-6 py-2 bg-memory-accent text-memory-dark font-bold rounded-lg hover:bg-memory-accent/80 transition-colors text-sm"
              >
                下一题
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              className="text-memory-muted/50 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              选择正确答案
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizGame;