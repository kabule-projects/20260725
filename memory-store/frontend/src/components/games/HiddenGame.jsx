import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const HiddenGame = ({ onComplete }) => {
  const [foundObjects, setFoundObjects] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const hintTimeoutRef = useRef(null);

  const objects = [
    { id: 1, x: 20, y: 30, icon: '◇', name: 'Dream' },
    { id: 2, x: 70, y: 15, icon: '○', name: 'Soul' },
    { id: 3, x: 45, y: 60, icon: '△', name: 'Star' },
    { id: 4, x: 15, y: 75, icon: '□', name: 'Heart' },
    { id: 5, x: 80, y: 65, icon: '☆', name: 'Light' },
  ];

  const hintObject = objects.find(obj => !foundObjects.includes(obj.id));

  useEffect(() => {
    if (foundObjects.length === objects.length && !gameComplete) {
      setGameComplete(true);
      setTimeout(onComplete, 800);
    }
  }, [foundObjects, objects.length, gameComplete, onComplete]);

  useEffect(() => {
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, 10000);

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const handleObjectClick = (id) => {
    if (foundObjects.includes(id) || gameComplete) return;

    setFoundObjects(prev => [...prev, id]);
    setShowHint(false);

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto bg-memory-dark/50 rounded-lg surreal-border overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-memory-glow/60 text-sm text-center px-4">
          找到隐藏的记忆碎片
        </p>
      </div>

      {objects.map((obj) => (
        <motion.button
          key={obj.id}
          className={`absolute w-10 h-10 flex items-center justify-center text-lg rounded-full transition-all duration-300 ${
            foundObjects.includes(obj.id)
              ? 'bg-memory-accent/50 text-memory-dark'
              : 'bg-transparent text-transparent hover:text-memory-glow/30'
          }`}
          style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
          onClick={() => handleObjectClick(obj.id)}
          whileHover={{ scale: foundObjects.includes(obj.id) ? 1 : 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          {obj.icon}
        </motion.button>
      ))}

      {showHint && hintObject && (
        <motion.div
          className="absolute px-3 py-1 bg-memory-accent/20 rounded-full text-xs text-memory-glow"
          style={{ left: `${hintObject.x}%`, top: `${hintObject.y + 8}%` }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          ?
        </motion.div>
      )}

      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {objects.map((obj) => (
          <div
            key={obj.id}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
              foundObjects.includes(obj.id)
                ? 'bg-memory-accent text-memory-dark'
                : 'bg-memory-muted/20 text-memory-muted'
            }`}
          >
            {foundObjects.includes(obj.id) ? '✓' : obj.id}
          </div>
        ))}
      </div>

      <div className="absolute top-2 right-2 text-xs text-memory-muted">
        {foundObjects.length}/{objects.length}
      </div>
    </div>
  );
};

export default HiddenGame;