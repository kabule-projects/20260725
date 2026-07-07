import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BINS = [
  { id: 'bin1', category: 'category1', label: '类别1', image: '/images/sort/bin1.webp' },
  { id: 'bin2', category: 'category2', label: '类别2', image: '/images/sort/bin2.webp' },
  { id: 'bin3', category: 'category3', label: '类别3', image: '/images/sort/bin3.webp' },
  { id: 'bin4', category: 'category4', label: '类别4', image: '/images/sort/bin4.webp' },
];

const ITEMS = [
  { id: 1, category: 'category1', image: '/images/sort/item1.webp' },
  { id: 2, category: 'category2', image: '/images/sort/item2.webp' },
  { id: 3, category: 'category3', image: '/images/sort/item3.webp' },
  { id: 4, category: 'category4', image: '/images/sort/item4.webp' },
  { id: 5, category: 'category1', image: '/images/sort/item5.webp' },
  { id: 6, category: 'category2', image: '/images/sort/item6.webp' },
  { id: 7, category: 'category3', image: '/images/sort/item7.webp' },
  { id: 8, category: 'category4', image: '/images/sort/item8.webp' },
];

const SortGame = ({ onComplete }) => {
  const [items, setItems] = useState([...ITEMS]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [targetBin, setTargetBin] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  
  const itemRef = useRef(null);
  const startPoint = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const currentItem = items[currentItemIndex];

  const handleDragStart = useCallback((e) => {
    if (!itemRef.current || gameState !== 'playing') return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    startPoint.current = { x: clientX, y: clientY };
    
    const rect = itemRef.current.getBoundingClientRect();
    startOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    setIsDragging(true);
  }, [gameState]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !itemRef.current) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPoint.current.x;
    const deltaY = clientY - startPoint.current.y;
    
    itemRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
    itemRef.current.style.transition = 'none';
    itemRef.current.style.zIndex = '1000';
    itemRef.current.style.position = 'fixed';

    const bins = document.querySelectorAll('[data-bin]');
    let found = null;
    
    bins.forEach(bin => {
      const binRect = bin.getBoundingClientRect();
      if (clientX >= binRect.left && clientX <= binRect.right &&
          clientY >= binRect.top && clientY <= binRect.bottom) {
        found = bin.dataset.bin;
      }
    });
    
    setTargetBin(found);
  }, [isDragging]);

  const handleDragEnd = useCallback((e) => {
    if (!isDragging || !itemRef.current) return;
    
    setIsDragging(false);
    
    if (targetBin) {
      const bin = BINS.find(b => b.id === targetBin);
      if (bin && currentItem.category === bin.category) {
        setIsCorrect(true);
        setScore(prev => prev + 1);
        
        itemRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        itemRef.current.style.transform = 'scale(0)';
        itemRef.current.style.opacity = '0';
        
        setTimeout(() => {
          const newItems = items.slice(0, currentItemIndex).concat(items.slice(currentItemIndex + 1));
          setItems(newItems);
          
          if (newItems.length === 0) {
            setGameState('win');
            onComplete();
          } else {
            setCurrentItemIndex(0);
          }
          setIsCorrect(null);
        }, 300);
      } else {
        setIsCorrect(false);
        
        itemRef.current.style.transition = 'transform 0.3s ease-out';
        itemRef.current.style.transform = 'translate(0, 0) scale(1)';
        itemRef.current.style.zIndex = '1';
        itemRef.current.style.position = 'relative';
        
        setTimeout(() => {
          setIsCorrect(null);
        }, 500);
      }
    } else {
      itemRef.current.style.transition = 'transform 0.3s ease-out';
      itemRef.current.style.transform = 'translate(0, 0) scale(1)';
      itemRef.current.style.zIndex = '1';
      itemRef.current.style.position = 'relative';
    }
    
    setTargetBin(null);
  }, [isDragging, targetBin, currentItem, items, currentItemIndex, onComplete]);

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e) => handleDragMove(e);
      const endHandler = (e) => handleDragEnd(e);
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', endHandler);
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler);
      
      return () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (gameState === 'win') {
    return (
      <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
        <div className="text-center py-8">
          <h2 className="text-memory-glow text-xl mb-4">分类完成！</h2>
          <p className="text-memory-accent">所有物品已正确分类</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-memory-dark/50 rounded-lg surreal-border p-4 select-none">
      <div className="flex justify-center mb-4">
        <h2 className="text-memory-glow text-lg">分类整理</h2>
      </div>

      <div className="text-center mb-4">
        <p className="text-memory-accent text-sm">
          {score} / {ITEMS.length}
        </p>
      </div>

      <div className="w-full h-2 bg-memory-dark/80 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-memory-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(score / ITEMS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {BINS.map((bin) => (
          <motion.div
            key={bin.id}
            data-bin={bin.id}
            className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
              targetBin === bin.id 
                ? 'border-memory-accent bg-memory-accent/20 scale-105' 
                : 'border-memory-accent/30 bg-memory-dark/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={bin.image}
              alt={bin.label}
              className="w-[60px] h-[60px] object-contain"
            />
            <p className="text-memory-glow/80 text-xs mt-2">{bin.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="relative w-[120px] h-[120px]">
          <div 
            className="absolute inset-0 rounded-xl bg-memory-dark/60 border-2 border-memory-accent/30 flex items-center justify-center"
            style={{ backgroundColor: isCorrect === false ? 'rgba(255, 100, 100, 0.3)' : undefined }}
          >
            <AnimatePresence mode="wait">
              {currentItem && (
                <div
                  key={currentItem.id}
                  ref={itemRef}
                  className="w-[100px] h-[100px] cursor-grab active:cursor-grabbing"
                  draggable={false}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                  style={{
                    transition: 'transform 0.2s ease-out',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <img
                    src={currentItem.image}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
          {!isDragging && (
            <p className="absolute -bottom-6 left-0 right-0 text-center text-memory-muted/60 text-xs">
              拖拽到正确的分类
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortGame;