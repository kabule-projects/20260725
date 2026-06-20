import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CORRECT_LYRICS, WRONG_LYRICS } from '../../data/lyrics';

// 游戏配置
const REQUIRED_CORRECT = 5; // 需要连续正确判断的次数

const LyricGame = ({ onComplete }) => {
  const [currentLyric, setCurrentLyric] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // 当前歌词是否正确
  const [score, setScore] = useState(0); // 连续正确次数
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'win' | 'feedback'
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  // 获取随机歌词（50%概率正确，50%概率错误）
  const getRandomLyric = useCallback(() => {
    const isCorrectLyric = Math.random() > 0.5;
    const lyricsPool = isCorrectLyric ? CORRECT_LYRICS : WRONG_LYRICS;
    const randomIndex = Math.floor(Math.random() * lyricsPool.length);
    const lyric = lyricsPool[randomIndex];
    
    return {
      ...lyric,
      isCorrect: isCorrectLyric
    };
  }, []);

  // 显示下一句歌词
  const showNextLyric = useCallback(() => {
    const lyric = getRandomLyric();
    setCurrentLyric(lyric);
    setIsCorrect(null);
    setFeedback(null);
  }, [getRandomLyric]);

  // 初始化游戏
  useEffect(() => {
    showNextLyric();
  }, [showNextLyric]);

  // 处理用户选择
  const handleAnswer = useCallback((userAnswer) => {
    if (isCorrect !== null || gameState !== 'playing') return;

    const isUserCorrect = userAnswer === currentLyric.isCorrect;
    
    setIsCorrect(currentLyric.isCorrect);
    
    if (isUserCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setFeedback('correct');
      
      // 检查是否通关
      if (newScore >= REQUIRED_CORRECT) {
        setGameState('win');
        setTimeout(() => {
          onComplete();
        }, 100);
        return;
      }
    } else {
      setScore(0);
      setFeedback('wrong');
    }

    // 延迟后显示下一句歌词
    setTimeout(() => {
      showNextLyric();
    }, 1000);
  }, [isCorrect, gameState, currentLyric, score, showNextLyric, onComplete]);

  // 游戏完成界面
  if (gameState === 'win') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative max-w-lg px-[12%] py-[12%] bg-memory-dark/50 rounded-lg p-4 select-none flex flex-col items-center justify-center min-h-[300px]">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-memory-accent text-lg">✧ 记忆已刻印 ✧</p>
        </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative max-w-lg px-[12%] py-[12%] bg-memory-dark/50 rounded-lg p-4 select-none">
      {/* 标题 */}
      <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">疯狂提词器</h2>
      </div>

      {/* 分数 */}
      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">
          连续正确: {score} / {REQUIRED_CORRECT}
        </p>
      </div>

      {/* 进度条 */}
      <div className="w-full h-2 bg-memory-dark/80 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-memory-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(score / REQUIRED_CORRECT) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 歌词显示区域 */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentLyric && (
            <motion.div
              key={currentLyric.lyric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 周深头像/图标区域 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-memory-accent/20 flex items-center justify-center border border-memory-accent/30">
                  <span className="text-2xl">🎤</span>
                </div>
              </div>
              
              {/* 歌词内容 */}
              <div className={`text-center p-4 rounded-lg mb-4 transition-colors ${
                feedback === 'correct' ? 'bg-green-500/20 border border-green-500/50' :
                feedback === 'wrong' ? 'bg-red-500/20 border border-red-500/50' :
                'bg-memory-dark/50 border border-memory-accent/20'
              }`}>
                <p className={`text-lg leading-relaxed ${
                  feedback === 'correct' ? 'text-green-400' :
                  feedback === 'wrong' ? 'text-red-400' :
                  'text-memory-glow'
                }`}>
                  {currentLyric.lyric}
                </p>
                <p className="text-memory-muted/60 text-xs mt-2">—— {currentLyric.song}</p>
              </div>

              {/* 反馈提示 */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-4"
                >
                  <p className={feedback === 'correct' ? 'text-green-400' : 'text-red-400'}>
                    {feedback === 'correct' ? '✓ 判断正确！' : `✗ 判断错误！${isCorrect ? '这句歌词是对的' : '这句歌词是错的'}`}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 按钮区域 */}
      {isCorrect === null && (
        <div className="flex gap-3">
          <motion.button
            className="flex-1 py-3 rounded-lg bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors border border-memory-accent/30"
            onClick={() => handleAnswer(true)}
            whileTap={{ scale: 0.98 }}
          >
            蒸蚌！
          </motion.button>
          <motion.button
            className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
            onClick={() => handleAnswer(false)}
            whileTap={{ scale: 0.98 }}
          >
            不对
          </motion.button>
        </div>
      )}

      {/* 游戏说明 */}
      <div className="mt-4 text-center">
        <p className="text-memory-muted/60 text-xs">判断周深背的歌词是否正确</p>
      </div>
      </div>
    </div>
  );
};

export default LyricGame;