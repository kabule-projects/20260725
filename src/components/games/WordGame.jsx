import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 游戏配置接口 - 方便修改题目和选项
const WORD_GAME_CONFIG = {
  question: '宫廷_液酒，_百_一杯，这_怎么样，听我给你_',
  options: ['八', '一', '吹', '玉', '酒'],
  answers: ['玉', '一', '八', '酒', '吹'], // 正确答案顺序
  successMessage: '你想起了那段旋律...',
  errorMessage: '眼前的景象变得模糊，你渐渐从梦中苏醒，不知怎么才能回到那里。'
};

const WordGame = ({ onComplete }) => {
  const [gameState, setGameState] = useState('start'); // start, playing, win, gameover
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 用户已选择的答案
  const [availableOptions, setAvailableOptions] = useState([...WORD_GAME_CONFIG.options]); // 可用选项
  const [history, setHistory] = useState([]); // 撤销历史

  // 解析题目，找出空格位置
  const parseQuestion = () => {
    const parts = [];
    let currentText = '';
    
    for (let i = 0; i < WORD_GAME_CONFIG.question.length; i++) {
      if (WORD_GAME_CONFIG.question[i] === '_') {
        if (currentText) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        parts.push({ type: 'blank', index: parts.filter(p => p.type === 'blank').length });
      } else {
        currentText += WORD_GAME_CONFIG.question[i];
      }
    }
    
    if (currentText) {
      parts.push({ type: 'text', content: currentText });
    }
    
    return parts;
  };

  const parsedQuestion = parseQuestion();

  // 获取空格位置的答案
  const getAnswerAt = (index) => {
    if (selectedAnswers[index] !== undefined) {
      return selectedAnswers[index];
    }
    return null;
  };

  // 检查是否所有空格都已填满
  const isComplete = () => {
    return selectedAnswers.length >= WORD_GAME_CONFIG.answers.length &&
           selectedAnswers.filter(a => a !== undefined).length === WORD_GAME_CONFIG.answers.length;
  };

  // 检查答案是否正确
  const checkAnswers = () => {
    for (let i = 0; i < WORD_GAME_CONFIG.answers.length; i++) {
      if (selectedAnswers[i] !== WORD_GAME_CONFIG.answers[i]) {
        return false;
      }
    }
    return true;
  };

  // 选择选项
  const selectOption = useCallback((option) => {
    if (gameState !== 'playing') return;
    
    // 找到第一个空的空格位置
    let emptyIndex = selectedAnswers.findIndex(a => a === undefined);
    // 如果数组为空或所有元素都已填满，检查是否需要扩展数组
    if (emptyIndex === -1) {
      if (selectedAnswers.length < WORD_GAME_CONFIG.answers.length) {
        emptyIndex = selectedAnswers.length;
      } else {
        return;
      }
    }
    
    // 保存历史记录用于撤销
    setHistory(prev => [...prev, {
      type: 'select',
      option,
      position: emptyIndex,
      previousValue: selectedAnswers[emptyIndex],
      previousAvailable: [...availableOptions]
    }]);
    
    // 更新答案和可用选项
    const newAnswers = [...selectedAnswers];
    newAnswers[emptyIndex] = option;
    setSelectedAnswers(newAnswers);
    setAvailableOptions(prev => prev.filter(o => o !== option));
    
    // 使用新答案检查是否完成
    const isCompleteNow = newAnswers.length >= WORD_GAME_CONFIG.answers.length &&
                          newAnswers.filter(a => a !== undefined).length === WORD_GAME_CONFIG.answers.length;
    
    if (isCompleteNow) {
      let isCorrect = true;
      for (let i = 0; i < WORD_GAME_CONFIG.answers.length; i++) {
        if (newAnswers[i] !== WORD_GAME_CONFIG.answers[i]) {
          isCorrect = false;
          break;
        }
      }
      
      if (isCorrect) {
        // 正确答案直接跳转记忆已刻印
        onComplete();
      } else {
        setGameState('gameover');
      }
    }
  }, [gameState, selectedAnswers, availableOptions, onComplete]);

  // 撤销上一步
  const undo = useCallback(() => {
    if (gameState !== 'playing' || history.length === 0) return;
    
    const lastAction = history[history.length - 1];
    
    if (lastAction.type === 'select') {
      const newAnswers = [...selectedAnswers];
      newAnswers[lastAction.position] = lastAction.previousValue;
      setSelectedAnswers(newAnswers);
      setAvailableOptions(lastAction.previousAvailable);
    }
    
    setHistory(prev => prev.slice(0, -1));
  }, [gameState, history, selectedAnswers]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setSelectedAnswers([]);
    setAvailableOptions([...WORD_GAME_CONFIG.options]);
    setHistory([]);
    setGameState('playing');
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="relative w-full max-w-[340px] aspect-square mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none flex flex-col justify-center">
      {/* 标题 */}
      <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">记忆回溯</h2>
      </div>

      {/* 题目区域 */}
      <div className="bg-black/50 rounded-lg p-4 mb-4 flex items-center justify-center">
        <div className="text-memory-glow text-sm leading-relaxed">
          {parsedQuestion.map((part, index) => (
            part.type === 'text' ? (
              <span key={index}>{part.content}</span>
            ) : (
              <span 
                key={index} 
                className="inline-block mx-1 px-2 py-0.5 bg-memory-glow/20 border border-memory-glow/30 rounded text-center min-w-[24px]"
              >
                {getAnswerAt(part.index) || ' '}
              </span>
            )
          ))}
        </div>
      </div>

      {/* 选项区域 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <AnimatePresence>
            {availableOptions.map((option) => (
              <motion.button
                key={option}
                className="w-8 h-8 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-lg font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectOption(option)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {option}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 已选择的答案 */}
      {selectedAnswers.filter(a => a !== undefined).length > 0 && gameState === 'playing' && (
        <div className="flex justify-center mb-4">
          <motion.button
            className="px-4 py-2 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info text-sm"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={undo}
            disabled={history.length === 0}
          >
            ↩ 撤销
          </motion.button>
        </div>
      )}

      {/* 开始画面 */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div
            className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center z-10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-memory-glow text-xl mb-4">填词游戏</h2>
            <p className="text-memory-glow/70 text-sm mb-4 text-center px-4">
              按顺序点击选项，将正确的字填入空格中
            </p>
            <motion.button
              className="px-6 py-2 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
            >
              开始游戏
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 失败画面 */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center z-10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-memory-glow text-sm mb-4">记忆好像有些差错……</p>
            <motion.button
              className="px-6 py-2 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
            >
              再试一次
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordGame;
