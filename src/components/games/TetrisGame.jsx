import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TetrisGame = ({ onComplete }) => {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [board, setBoard] = useState([]);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [currentPos, setCurrentPos] = useState({ row: 0, col: 0 });
  const [isDropping, setIsDropping] = useState(false);
  
  const ROWS = 16;
  const COLS = 10;
  const CELL_SIZE = 18;
  const WIN_SCORE = 92;

  const SHAPES = [
    { shape: [[1, 1, 1, 1]], type: 'i' },
    { shape: [[1, 1], [1, 1]], type: 'o' },
    { shape: [[0, 1, 0], [1, 1, 1]], type: 't' },
    { shape: [[1, 1, 0], [0, 1, 1]], type: 's' },
    { shape: [[0, 1, 1], [1, 1, 0]], type: 'z' },
    { shape: [[1, 0, 0], [1, 1, 1]], type: 'j' },
    { shape: [[0, 0, 1], [1, 1, 1]], type: 'l' }
  ];

  const COLORS = {
    i: '#00f0f0',
    o: '#f0f000',
    t: '#a000f0',
    s: '#00f000',
    z: '#f00000',
    j: '#0000f0',
    l: '#f0a000'
  };

  const createEmptyBoard = () => {
    return Array.from(Array(ROWS), () => new Array(COLS).fill(null));
  };

  const getRandomPiece = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    return { ...SHAPES[randomIndex], shape: SHAPES[randomIndex].shape.map(row => [...row]) };
  }, []);

  const checkCollision = useCallback((piece, pos, boardState) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const newRow = pos.row + r;
          const newCol = pos.col + c;
          if (
            newRow >= ROWS ||
            newCol < 0 ||
            newCol >= COLS ||
            (newRow >= 0 && boardState[newRow][newCol])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const rotatePiece = useCallback((piece) => {
    const rotated = [];
    for (let c = 0; c < piece.shape[0].length; c++) {
      const newRow = [];
      for (let r = piece.shape.length - 1; r >= 0; r--) {
        newRow.push(piece.shape[r][c]);
      }
      rotated.push(newRow);
    }
    return { ...piece, shape: rotated };
  }, []);

  const mergePiece = useCallback((boardState, piece, pos) => {
    const newBoard = boardState.map(row => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const newRow = pos.row + r;
          const newCol = pos.col + c;
          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            newBoard[newRow][newCol] = piece.type;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((boardState) => {
    let cleared = 0;
    let newBoard = boardState.map(row => [...row]);
    
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r].every(cell => cell !== null)) {
        newBoard.splice(r, 1);
        newBoard.unshift(new Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    
    return { board: newBoard, lines: cleared };
  }, []);

  const startGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    const firstPiece = getRandomPiece();
    const secondPiece = getRandomPiece();
    
    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setCurrentPos({ 
      row: 0, 
      col: Math.floor(COLS / 2) - Math.floor(firstPiece.shape[0].length / 2)
    });
    setScore(0);
    setLines(0);
    setGameState('playing');
  }, [getRandomPiece]);

  const gameOver = useCallback(() => {
    setGameState('gameover');
  }, []);

  const moveDown = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece || isDropping) return;

    const newPos = { ...currentPos, row: currentPos.row + 1 };
    
    if (checkCollision(currentPiece, newPos, board)) {
      // 落地
      const mergedBoard = mergePiece(board, currentPiece, currentPos);
      const { board: clearedBoard, lines: clearedLines } = clearLines(mergedBoard);
      
      let newScore = score;
      if (clearedLines > 0) {
        const points = [0, 40, 100, 300, 1200][clearedLines];
        newScore = score + points;
        setScore(newScore);
        setLines(prev => prev + clearedLines);
      }
      
      // 检查是否达到胜利分数
      if (newScore >= WIN_SCORE) {
        setGameState('win');
        setTimeout(() => {
          onComplete();
        }, 1500);
        return;
      }
      
      // 检查游戏结束
      if (checkCollision(nextPiece, { row: 0, col: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2) }, clearedBoard)) {
        gameOver();
        return;
      }
      
      setBoard(clearedBoard);
      setCurrentPiece(nextPiece);
      setNextPiece(getRandomPiece());
      setCurrentPos({ 
        row: 0, 
        col: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2)
      });
    } else {
      setCurrentPos(newPos);
    }
  }, [gameState, currentPiece, currentPos, board, nextPiece, score, checkCollision, mergePiece, clearLines, getRandomPiece, gameOver, isDropping]);

  const moveLeft = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece || isDropping) return;
    const newPos = { ...currentPos, col: currentPos.col - 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setCurrentPos(newPos);
    }
  }, [gameState, currentPiece, currentPos, board, checkCollision, isDropping]);

  const moveRight = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece || isDropping) return;
    const newPos = { ...currentPos, col: currentPos.col + 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setCurrentPos(newPos);
    }
  }, [gameState, currentPiece, currentPos, board, checkCollision, isDropping]);

  const rotate = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece || isDropping) return;
    const rotated = rotatePiece(currentPiece);
    
    // 墙踢
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const newPos = { ...currentPos, col: currentPos.col + kick };
      if (!checkCollision(rotated, newPos, board)) {
        setCurrentPiece(rotated);
        setCurrentPos(newPos);
        return;
      }
    }
  }, [gameState, currentPiece, currentPos, board, rotatePiece, checkCollision, isDropping]);

  const hardDrop = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece || isDropping) return;
    
    // 标记正在 hardDrop
    setIsDropping(true);
    
    // 计算最终位置
    let newRow = currentPos.row;
    while (!checkCollision(currentPiece, { ...currentPos, row: newRow + 1 }, board)) {
      newRow++;
    }
    
    // 保存当前状态的快照
    const finalPos = { ...currentPos, row: newRow };
    const savedBoard = board;
    const savedCurrentPiece = currentPiece;
    const savedNextPiece = nextPiece;
    const savedScore = score;
    
    // 先更新位置，让用户看到方块在最下面
    setCurrentPos(finalPos);
    
    // 延迟一点时间后落地
    setTimeout(() => {
      const mergedBoard = mergePiece(savedBoard, savedCurrentPiece, finalPos);
      const { board: clearedBoard, lines: clearedLines } = clearLines(mergedBoard);
      
      let newScore = savedScore;
      if (clearedLines > 0) {
        const points = [0, 40, 100, 300, 1200][clearedLines];
        newScore = savedScore + points;
        setScore(newScore);
        setLines(prev => prev + clearedLines);
      }
      
      // 检查是否达到胜利分数
      if (newScore >= WIN_SCORE) {
        setGameState('win');
        setTimeout(() => {
          onComplete();
        }, 1500);
        setIsDropping(false);
        return;
      }
      
      // 检查游戏结束
      if (checkCollision(savedNextPiece, { row: 0, col: Math.floor(COLS / 2) - Math.floor(savedNextPiece.shape[0].length / 2) }, clearedBoard)) {
        gameOver();
        setIsDropping(false);
        return;
      }
      
      setBoard(clearedBoard);
      setCurrentPiece(savedNextPiece);
      setNextPiece(getRandomPiece());
      setCurrentPos({ 
        row: 0, 
        col: Math.floor(COLS / 2) - Math.floor(savedNextPiece.shape[0].length / 2)
      });
      
      // 结束 hardDrop
      setIsDropping(false);
    }, 50);
  }, [gameState, currentPiece, currentPos, board, nextPiece, score, checkCollision, mergePiece, clearLines, getRandomPiece, gameOver, onComplete, isDropping]);

  // 自动下落
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(moveDown, 800);
    return () => clearInterval(interval);
  }, [gameState, moveDown]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // 绘制幽灵方块
    let ghostRow = currentPos.row;
    if (currentPiece && gameState === 'playing') {
      while (!checkCollision(currentPiece, { ...currentPos, row: ghostRow + 1 }, board)) {
        ghostRow++;
      }
      
      if (ghostRow !== currentPos.row) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
          for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
              const newRow = ghostRow + r;
              const newCol = currentPos.col + c;
              if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                displayBoard[newRow][newCol] = 'ghost';
              }
            }
          }
        }
      }
      
      // 绘制当前方块
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const newRow = currentPos.row + r;
            const newCol = currentPos.col + c;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
              displayBoard[newRow][newCol] = currentPiece.type;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="relative w-full max-w-sm mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      {/* 标题和分数 */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-memory-glow font-mono text-sm">
          消除了 {lines} 行
        </div>
        <div className="text-memory-glow font-mono text-sm">
          {score} / {WIN_SCORE} 分
        </div>
      </div>

      {/* 游戏区域 - 使用正方形方块，高度根据行数动态计算 */}
      <div className="flex justify-center">
        <div className="relative bg-black/80 rounded-lg overflow-hidden">
          <div className="relative" style={{ width: `${COLS * CELL_SIZE}px`, height: `${ROWS * CELL_SIZE}px` }}>
            {/* 棋盘格 */}
            <div className="absolute inset-0 opacity-20">
              {Array.from(Array(ROWS)).map((_, r) => (
                <div key={r} className="flex">
                  {Array.from(Array(COLS)).map((_, c) => (
                    <div 
                      key={c} 
                      className="border border-gray-700"
                      style={{ width: '18px', height: '18px' }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* 方块 */}
            {displayBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                if (!cell) return null;
                
                const isGhost = cell === 'ghost';
                const color = isGhost ? 'rgba(255,255,255,0.15)' : COLORS[cell];
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`absolute ${isGhost ? 'border-dashed border-white/50' : 'rounded-sm'}`}
                    style={{
                      width: '18px',
                      height: '18px',
                      top: `${rowIndex * 18}px`,
                      left: `${colIndex * 18}px`,
                      backgroundColor: color,
                      border: isGhost ? '1px dashed rgba(255,255,255,0.5)' : '1px solid rgba(0,0,0,0.3)'
                    }}
                  />
                );
              })
            )}

            {/* 下一个方块预览 */}
            {nextPiece && gameState === 'playing' && (
              <div 
                className="absolute top-1 right-1 p-1 bg-black/50 rounded"
                style={{ width: '50px', height: '50px' }}
              >
                {nextPiece.shape.map((row, r) =>
                  row.map((cell, c) => {
                    if (!cell) return null;
                    return (
                      <div
                        key={`next-${r}-${c}`}
                        className="absolute rounded-sm"
                        style={{
                          width: '10px',
                          height: '10px',
                          top: `${r * 10 + 5}px`,
                          left: `${c * 10 + 5}px`,
                          backgroundColor: COLORS[nextPiece.type]
                        }}
                      />
                    );
                  })
                )}
              </div>
            )}

            {/* 开始画面 */}
            <AnimatePresence>
              {gameState === 'start' && (
                <motion.div
                  className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-memory-glow text-xl mb-4">俄罗斯方块</h2>
                  <motion.button
                    className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                  >
                    开始游戏
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 游戏胜利画面 */}
            <AnimatePresence>
              {gameState === 'win' && (
                <motion.div
                  className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-green-400 text-xl mb-2">游戏完成！</h2>
                  <p className="text-memory-glow text-sm mb-4">得分: {score}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 游戏失败画面 */}
            <AnimatePresence>
              {gameState === 'gameover' && (
                <motion.div
                  className="absolute inset-0 bg-memory-dark/95 flex flex-col items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-red-400 text-xl mb-2">游戏结束</h2>
                  <p className="text-memory-glow text-sm mb-2">得分: {score}</p>
                  <p className="text-memory-glow text-sm mb-4">目标: {WIN_SCORE} 分</p>
                  <motion.button
                    className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                  >
                    再试一次
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 触屏控制按钮 */}
      {gameState === 'playing' && (
        <div className="flex justify-center gap-2 mt-3">
          <motion.button
            className="w-12 h-12 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={moveLeft}
          >
            ←
          </motion.button>
          <motion.button
            className="w-12 h-12 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={rotate}
          >
            ↻
          </motion.button>
          <motion.button
            className="w-12 h-12 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={hardDrop}
          >
            ↓
          </motion.button>
          <motion.button
            className="w-12 h-12 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={moveRight}
          >
            →
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TetrisGame;
