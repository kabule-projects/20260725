import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 1,
    image: '/images/quiz/1.webp',
    question: '这是哪个单曲？',
    options: ['归处', '和光同春', '田埂五月风', '春天到万家'],
    correctAnswer: 1,
  },
  {
    id: 2,
    image: '/images/quiz/2.webp',
    question: '这是卡团哪位？',
    options: ['周菜菜', '周大厨', '你救四只猫', '小白粥'],
    correctAnswer: 3,
  },
  {
    id: 3,
    image: '/images/quiz/3.webp',
    question: '这是什么？',
    options: ['长势喜人的多肉', '林深见鹿（不活了版）', '小米星锦（不活了版）', '永生多肉'],
    correctAnswer: 2,
  },
  {
    id: 4,
    image: '/images/quiz/4.webp',
    question: '这是哪次舞台？',
    options: ['灯火里的中国', '春天到万家', '我和我的祖国', '小康之歌'],
    correctAnswer: 0,
  },
  {
    id: 5,
    image: '/images/quiz/5.webp',
    question: '这是哪次舞台？',
    options: ['光亮', '望', '和光同尘', '大鱼'],
    correctAnswer: 3,
  },
];

const TIME_LIMIT = 5;

const QuizGame = ({ onComplete }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(Array(QUESTIONS.length).fill('unanswered'));
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    const allCorrect = questionStatus.every(status => status === 'correct');
    if (allCorrect) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [questionStatus, onComplete]);

  useEffect(() => {
    if (!gameStarted || showResult) return;

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
  }, [gameStarted, currentQuestionIndex, showResult]);

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
    <div className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-memory-dark">
      {/* 顶部信息区 */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex justify-between text-xs text-memory-muted mb-1">
          <span>进度: {correctCount} / {QUESTIONS.length}</span>
          <span>题目 {currentQuestionIndex + 1}</span>
        </div>
        <div className="h-1 bg-memory-muted/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-memory-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(correctCount / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-center gap-1 mt-1.5">
          {questionStatus.map((status, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
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
        <div className="flex justify-center mt-1">
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 2 ? 'text-red-500' : 'text-memory-accent'
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* 中间内容区 */}
      <div className="flex-1 flex flex-col min-h-0 justify-top px-4">
        {/* 图片区 */}
        <div className="flex-shrink-0 max-w-[80vw] max-h-[50vh] mx-auto mb-3">
          <motion.div
            className="relative w-full aspect-square rounded-lg overflow-hidden bg-memory-dark/80 border border-memory-muted/20"
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
                  <span className="text-4xl font-bold text-white drop-shadow-lg">
                    {selectedAnswer === currentQuestion.correctAnswer ? '✓' : '✗'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 题目和选项区 */}
        <div className="flex-shrink-0 w-full max-w-sm mx-auto">
          <h3 className="text-sm text-center text-memory-light mb-2">
            {currentQuestion.question}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = 'border-memory-muted/30 hover:border-memory-info hover:bg-memory-info/10';
              
              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass = 'border-green-500 bg-green-500/20';
                } else if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
                  buttonClass = 'border-red-500 bg-red-500/20';
                }
              } else if (selectedAnswer === index) {
                buttonClass = 'border-memory-info bg-memory-info/10';
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={`px-2 py-2 rounded-lg border-2 text-memory-light text-xs font-medium transition-all ${buttonClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                  whileTap={!showResult ? { scale: 0.97 } : {}}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 按钮区 */}
        <div className="flex-shrink-0 w-full max-w-sm mx-auto mt-3 flex items-center justify-center">
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
                <p className={`mb-2 text-xs ${
                  selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 
                  selectedAnswer !== null ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? '回答正确' :
                   selectedAnswer !== null ? '回答错误' : '时间到'}
                </p>
                <button
                  onClick={goToNextUnanswered}
                  className="px-4 py-2 bg-memory-accent text-memory-dark font-bold rounded-lg hover:bg-memory-accent/80 transition-colors text-xs"
                >
                  下一题
                </button>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                className="text-memory-muted/50 text-xs"
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

      {/* 开始游戏遮照 */}
      <AnimatePresence>
        {!gameStarted && (
          <motion.div
            className="absolute inset-0 bg-memory-dark/80 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl text-memory-light font-bold mb-4">抢答挑战</h2>
              <p className="text-memory-muted text-sm mb-6">答对所有题目完成挑战</p>
              <motion.button
                onClick={() => setGameStarted(true)}
                className="px-8 py-3 bg-memory-accent text-memory-dark font-bold rounded-lg hover:bg-memory-accent/80 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                开始抢答
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;