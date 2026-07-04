import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 基础开放日期（北京时间2026年7月17日中午12点）
const BASE_UNLOCK_DATE = '2026-07-17T12:00:00+08:00';
const UNLOCK_INTERVAL = 12 * 60 * 60 * 1000; // 12小时
const TOTAL_IMAGES = 13;

// 测试模式：是否解锁所有图片
const TEST_MODE = true;

const PhotoGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const imageStartX = useRef(0);
  const containerRef = useRef(null);

  // 计算已解锁的图片数量
  useEffect(() => {
    if (TEST_MODE) {
      setUnlockedCount(TOTAL_IMAGES);
      setCurrentIndex(0);
    } else {
      const baseDate = new Date(BASE_UNLOCK_DATE).getTime();
      const now = new Date().getTime();
      
      if (now < baseDate) {
        setUnlockedCount(0);
      } else {
        const elapsed = now - baseDate;
        const unlocked = Math.min(Math.floor(elapsed / UNLOCK_INTERVAL) + 1, TOTAL_IMAGES);
        setUnlockedCount(unlocked);
        setCurrentIndex(unlocked - 1);
      }
    }
  }, []);

  // 导航到指定图片
  const goToImage = useCallback((index) => {
    if (index < unlockedCount) {
      setCurrentIndex(index);
    }
  }, [unlockedCount]);

  // 上一张
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // 下一张
  const goToNext = useCallback(() => {
    if (currentIndex < unlockedCount - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, unlockedCount]);

  // 触摸开始
  const handleTouchStart = useCallback((e) => {
    if (!containerRef.current) return;
    startX.current = e.touches[0].pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    setIsDragging(true);
  }, []);

  // 触摸移动
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // 增加滑动速度
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, [isDragging]);

  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 鼠标拖动开始
  const handleMouseDown = useCallback((e) => {
    if (!containerRef.current) return;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    setIsDragging(true);
  }, []);

  // 鼠标拖动移动
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, [isDragging]);

  // 鼠标拖动结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 大图触摸开始
  const handleImageTouchStart = useCallback((e) => {
    imageStartX.current = e.touches[0].pageX;
    setIsImageDragging(true);
  }, []);

  // 大图触摸移动
  const handleImageTouchMove = useCallback((e) => {
    if (!isImageDragging) return;
    e.preventDefault();
  }, [isImageDragging]);

  // 大图触摸结束 - 判断swipe方向
  const handleImageTouchEnd = useCallback(() => {
    if (!isImageDragging) return;
    setIsImageDragging(false);
    
    const currentX = imageStartX.current;
    const touchEndX = event.changedTouches[0].pageX;
    const diff = touchEndX - currentX;
    
    // 滑动距离超过50px才触发切换
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
  }, [isImageDragging, goToPrev, goToNext]);

  // 大图鼠标拖动开始
  const handleImageMouseDown = useCallback((e) => {
    imageStartX.current = e.pageX;
    setIsImageDragging(true);
  }, []);

  // 大图鼠标移动
  const handleImageMouseMove = useCallback((e) => {
    if (!isImageDragging) return;
  }, [isImageDragging]);

  // 大图鼠标释放
  const handleImageMouseUp = useCallback(() => {
    if (!isImageDragging) return;
    setIsImageDragging(false);
    
    const diff = event.pageX - imageStartX.current;
    
    // 滑动距离超过50px才触发切换
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
  }, [isImageDragging, goToPrev, goToNext]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 添加大图鼠标事件监听
  useEffect(() => {
    if (isImageDragging) {
      document.addEventListener('mousemove', handleImageMouseMove);
      document.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleImageMouseMove);
        document.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [isImageDragging, handleImageMouseMove, handleImageMouseUp]);

  const currentImage = unlockedCount > 0 ? images[currentIndex] : null;

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* 大图展示区域 - 支持左右swipe */}
      <div 
        className="relative aspect-square rounded-lg overflow-hidden bg-memory-dark/80 border border-memory-muted/20"
        onTouchStart={handleImageTouchStart}
        onTouchMove={handleImageTouchMove}
        onTouchEnd={handleImageTouchEnd}
        onMouseDown={handleImageMouseDown}
      >
        <AnimatePresence mode="wait">
          {unlockedCount > 0 && currentImage ? (
            <motion.img
              key={currentIndex}
              src={currentImage}
              alt={`图片 ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-memory-dark">
              <motion.div
                className="text-6xl text-memory-accent/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                ✧
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 图片计数器 */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white/80 text-xs">
          {unlockedCount > 0 ? `${currentIndex + 1} / ${unlockedCount}` : `0 / ${TOTAL_IMAGES}`}
        </div>
      </div>

      {/* 小预览图区域 - 支持触摸拖动 */}
      <div 
        ref={containerRef}
        className="flex gap-2 mt-4 overflow-x-auto pb-2 select-none thin-scrollbar cursor-grab active:cursor-grabbing" 
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => !isDragging && goToImage(index)}
            disabled={index >= unlockedCount}
            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index
                ? 'border-memory-accent ring-2 ring-memory-accent/50'
                : index < unlockedCount
                ? 'border-memory-accent/50 hover:border-memory-accent'
                : 'border-memory-muted/20 opacity-30 cursor-not-allowed'
            }`}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: 'none' }}
          >
            {index < unlockedCount ? (
              <img
                src={image}
                alt={`预览 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-memory-dark flex items-center justify-center">
                <span className="text-memory-accent/30 text-sm">✧</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* 解锁进度提示 */}
      <div className="mt-4 text-center">
        <p className="text-memory-muted/60 text-xs">
          {unlockedCount >= TOTAL_IMAGES
            ? '已解锁所有记忆'
            : unlockedCount === 0
            ? '等待解锁记忆...'
            : `${unlockedCount} / ${TOTAL_IMAGES} 张图片已解锁`}
        </p>
      </div>
    </div>
  );
};

export default PhotoGallery;