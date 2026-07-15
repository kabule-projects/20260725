import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const PeekGame = ({ onComplete }) => {
  const [won, setWon] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [items, setItems] = useState([]);
  const [sceneSize, setSceneSize] = useState({ width: 500, height: 500 });
  const [viewSize, setViewSize] = useState({ width: 300, height: 300 });

  const viewXRef = useRef(0);
  const viewYRef = useRef(0);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const TOTAL_ITEMS = 4;
  const ITEM_SIZE = 70;
  const CLICK_RADIUS = 50;
  const MARGIN_PERCENT = 0.15;
  const SCENE_SCALE = 1.5;

  const itemImages = [
    '/images/peek/1.webp',
    '/images/peek/2.webp',
    '/images/peek/3.webp',
    '/images/peek/4.webp'
  ];

  useEffect(() => {
    const baseImg = new Image();
    baseImg.onload = () => {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        setViewSize({ width: containerWidth, height: containerWidth });

        const sceneWidth = containerWidth * SCENE_SCALE;
        const sceneHeight = containerWidth * SCENE_SCALE;
        setSceneSize({ width: sceneWidth, height: sceneHeight });

        initializeItems(sceneWidth, sceneHeight);
      }
    };
    baseImg.src = '/images/peek/base.webp';
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        setViewSize({ width: containerWidth, height: containerWidth });

        const sceneWidth = containerWidth * SCENE_SCALE;
        const sceneHeight = containerWidth * SCENE_SCALE;
        setSceneSize({ width: sceneWidth, height: sceneHeight });

        initializeItems(sceneWidth, sceneHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initializeItems = useCallback((sceneWidth, sceneHeight) => {
    const marginX = sceneWidth * MARGIN_PERCENT;
    const marginY = sceneHeight * MARGIN_PERCENT;
    const safeWidth = sceneWidth - marginX * 2 - ITEM_SIZE;
    const safeHeight = sceneHeight - marginY * 2 - ITEM_SIZE;

    const newItems = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      let x, y;
      let attempts = 0;
      let valid = false;

      do {
        x = marginX + Math.random() * safeWidth;
        y = marginY + Math.random() * safeHeight;
        attempts++;

        valid = true;
        for (const item of newItems) {
          const distance = Math.sqrt(
            Math.pow(x - item.x, 2) +
            Math.pow(y - item.y, 2)
          );
          if (distance < ITEM_SIZE * 1.5) {
            valid = false;
            break;
          }
        }
      } while (!valid && attempts < 100);

      newItems.push({
        id: i,
        x,
        y,
        image: itemImages[i],
        found: false
      });
    }
    setItems(newItems);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (won) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [won]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || won) return;

    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    const maxX = sceneSize.width - viewSize.width;
    const maxY = sceneSize.height - viewSize.height;

    viewXRef.current = Math.max(-maxX, Math.min(0, viewXRef.current + deltaX));
    viewYRef.current = Math.max(-maxY, Math.min(0, viewYRef.current + deltaY));

    setViewX(viewXRef.current);
    setViewY(viewYRef.current);

    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [won, sceneSize, viewSize]);

  const handleTouchStart = useCallback((e) => {
    if (won) return;
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [won]);

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current || won) return;

    const deltaX = e.touches[0].clientX - lastPosRef.current.x;
    const deltaY = e.touches[0].clientY - lastPosRef.current.y;

    const maxX = sceneSize.width - viewSize.width;
    const maxY = sceneSize.height - viewSize.height;

    viewXRef.current = Math.max(-maxX, Math.min(0, viewXRef.current + deltaX));
    viewYRef.current = Math.max(-maxY, Math.min(0, viewYRef.current + deltaY));

    setViewX(viewXRef.current);
    setViewY(viewYRef.current);

    lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [won, sceneSize, viewSize]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleClick = useCallback((e) => {
    if (won) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - viewXRef.current;
    const clickY = e.clientY - rect.top - viewYRef.current;

    setItems(prevItems => {
      let found = false;
      const newItems = prevItems.map(item => {
        if (item.found) return item;
        const itemCenterX = item.x + ITEM_SIZE / 2;
        const itemCenterY = item.y + ITEM_SIZE / 2;
        const distance = Math.sqrt(
          Math.pow(clickX - itemCenterX, 2) +
          Math.pow(clickY - itemCenterY, 2)
        );
        if (distance < CLICK_RADIUS) {
          found = true;
          return { ...item, found: true };
        }
        return item;
      });

      if (found) {
        const newCount = newItems.filter(i => i.found).length;
        setFoundCount(newCount);
        if (newCount >= TOTAL_ITEMS) {
          setWon(true);
          onComplete();
        }
      }

      return newItems;
    });
  }, [won, onComplete]);

  const restartGame = () => {
    viewXRef.current = 0;
    viewYRef.current = 0;
    setViewX(0);
    setViewY(0);
    setFoundCount(0);
    setWon(false);
    isDraggingRef.current = false;

    const marginX = sceneSize.width * MARGIN_PERCENT;
    const marginY = sceneSize.height * MARGIN_PERCENT;
    const safeWidth = sceneSize.width - marginX * 2 - ITEM_SIZE;
    const safeHeight = sceneSize.height - marginY * 2 - ITEM_SIZE;

    const newItems = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      let x, y;
      let attempts = 0;
      let valid = false;

      do {
        x = marginX + Math.random() * safeWidth;
        y = marginY + Math.random() * safeHeight;
        attempts++;

        valid = true;
        for (const item of newItems) {
          const distance = Math.sqrt(
            Math.pow(x - item.x, 2) +
            Math.pow(y - item.y, 2)
          );
          if (distance < ITEM_SIZE * 1.5) {
            valid = false;
            break;
          }
        }
      } while (!valid && attempts < 100);

      newItems.push({
        id: i,
        x,
        y,
        image: itemImages[i],
        found: false
      });
    }
    setItems(newItems);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-memory-dark/50 rounded-lg p-4 select-none">
      <p className="text-memory-glow/60 text-sm text-center mb-2 select-none">
        拖动寻找隐藏的物品
      </p>

      <div
        ref={containerRef}
        className="relative w-full rounded overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ 
          aspectRatio: '1/1',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 120px)'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className="absolute select-none"
          style={{
            width: sceneSize.width,
            height: sceneSize.height,
            left: viewX,
            top: viewY,
          }}
        >
          <img
            src="/images/peek/base.webp"
            alt="背景"
            className="w-full h-full object-cover"
            style={{ WebkitUserDrag: 'none', userDrag: 'none' }}
          />

          {items.map(item => (
            item.found ? null : (
              <motion.div
                key={item.id}
                className="absolute select-none"
                style={{
                  left: item.x,
                  top: item.y,
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.image}
                  alt={`物品 ${item.id + 1}`}
                  className="w-full h-full object-contain"
                  style={{ 
                    WebkitUserDrag: 'none', 
                    userDrag: 'none',
                    filter: 'drop-shadow(0 0 12px rgba(255, 255, 155, 1))'
                  }}
                />
              </motion.div>
            )
          ))}
        </div>

        <img
          src="/images/peek/mask.webp"
          alt="遮挡层"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ WebkitUserDrag: 'none', userDrag: 'none' }}
        />
      </div>

      <div className="mt-2 text-center select-none">
        <p className="text-memory-glow/60 text-xs">
          已找到: {foundCount} / {TOTAL_ITEMS}
        </p>
      </div>

      {won && (
        <motion.div
          className="absolute inset-0 bg-memory-dark/90 flex flex-col items-center justify-center rounded-lg select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-memory-glow text-lg mb-2 select-none">成功!</p>
          <p className="text-memory-muted text-sm mb-4 select-none">已找到所有物品</p>
          <motion.button
            className="px-6 py-2 bg-memory-info/10 text-memory-info rounded-lg border border-memory-info select-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartGame}
          >
            再试一次
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PeekGame;