import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LazyImage from './LazyImage';

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
  const [containerHeight, setContainerHeight] = useState(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const imageStartX = useRef(0);
  const containerRef = useRef(null);
  const imageHeights = useRef({});
  const scrollContainerRef = useRef(null);
  const isSpecialDragging = useRef(false);
  
  const isSpecialImage = currentIndex === TOTAL_IMAGES - 1;

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

  // 预加载图片并计算高度
  useEffect(() => {
    if (unlockedCount === 0) return;
    
    const containerWidth = containerRef.current?.offsetWidth || 300;
    
    for (let i = 0; i < unlockedCount; i++) {
      if (i === TOTAL_IMAGES - 1) {
        const img = new Image();
        img.onload = () => {
          const ratio = img.height / img.width;
          const scrollbarHeight = 20;
          imageHeights.current[i] = containerWidth * ratio + scrollbarHeight;
          if (i === currentIndex) {
            setContainerHeight(imageHeights.current[i]);
          }
        };
        img.src = `/images/gallery/13.1.webp`;
      } else {
        const img = new Image();
        img.onload = () => {
          const ratio = img.height / img.width;
          imageHeights.current[i] = containerWidth * ratio;
          if (i === currentIndex) {
            setContainerHeight(imageHeights.current[i]);
          }
        };
        img.src = images[i];
      }
    }
  }, [unlockedCount, images]);

  // 更新容器高度
  useEffect(() => {
    if (imageHeights.current[currentIndex]) {
      setContainerHeight(imageHeights.current[currentIndex]);
    }
  }, [currentIndex]);

  // 导航到指定图片
  const goToImage = useCallback((index) => {
    if (index < unlockedCount) {
      if (imageHeights.current[index]) {
        setContainerHeight(imageHeights.current[index]);
      }
      setCurrentIndex(index);
    }
  }, [unlockedCount]);

  // 上一张
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      if (imageHeights.current[nextIndex]) {
        setContainerHeight(imageHeights.current[nextIndex]);
      }
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex]);

  // 下一张
  const goToNext = useCallback(() => {
    if (currentIndex < unlockedCount - 1) {
      const nextIndex = currentIndex + 1;
      if (imageHeights.current[nextIndex]) {
        setContainerHeight(imageHeights.current[nextIndex]);
      }
      setCurrentIndex(nextIndex);
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

  // 第13张图片触摸开始
  const handleSpecialTouchStart = useCallback((e) => {
    e.stopPropagation();
    if (!scrollContainerRef.current) return;
    startX.current = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    isSpecialDragging.current = true;
  }, []);

  // 第13张图片触摸移动
  const handleSpecialTouchMove = useCallback((e) => {
    e.stopPropagation();
    if (!isSpecialDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  // 第13张图片触摸结束
  const handleSpecialTouchEnd = useCallback((e) => {
    e.stopPropagation();
    isSpecialDragging.current = false;
  }, []);

  // 第13张图片鼠标拖动开始
  const handleSpecialMouseDown = useCallback((e) => {
    e.stopPropagation();
    if (!scrollContainerRef.current) return;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    isSpecialDragging.current = true;
    document.addEventListener('mousemove', handleSpecialMouseMove);
    document.addEventListener('mouseup', handleSpecialMouseUp);
  }, []);

  // 第13张图片鼠标拖动移动
  const handleSpecialMouseMove = useCallback((e) => {
    if (!isSpecialDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  // 第13张图片鼠标拖动释放
  const handleSpecialMouseUp = useCallback((e) => {
    if (!isSpecialDragging.current) return;
    isSpecialDragging.current = false;
    document.removeEventListener('mousemove', handleSpecialMouseMove);
    document.removeEventListener('mouseup', handleSpecialMouseUp);
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
  const specialImages = isSpecialImage ? [
    `/images/gallery/13.1.webp`,
    `/images/gallery/13.2.webp`,
    `/images/gallery/13.3.webp`,
    `/images/gallery/13.4.webp`
  ] : null;

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* 大图展示区域 - 支持左右swipe */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden bg-memory-dark/80 border border-memory-muted/20 transition-all duration-300"
        style={{ height: containerHeight ? `${containerHeight}px` : undefined }}
        onTouchStart={handleImageTouchStart}
        onTouchMove={handleImageTouchMove}
        onTouchEnd={handleImageTouchEnd}
        onMouseDown={handleImageMouseDown}
      >
        <AnimatePresence>
          {unlockedCount > 0 && (isSpecialImage ? (
            <motion.div
              key={currentIndex}
              ref={scrollContainerRef}
              className="flex w-full h-full overflow-x-auto overflow-y-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onTouchStart={handleSpecialTouchStart}
              onTouchMove={handleSpecialTouchMove}
              onTouchEnd={handleSpecialTouchEnd}
              onMouseDown={handleSpecialMouseDown}
            >
              {specialImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`图片 13.${idx + 1}`}
                  className="flex-shrink-0 w-full h-auto"
                />
              ))}
            </motion.div>
          ) : (
            <motion.img
              key={currentIndex}
              src={currentImage}
              alt={`图片 ${2014 + currentIndex}`}
              className="w-full h-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </AnimatePresence>

        {/* 图片计数器 */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white/80 text-xs">
          {unlockedCount > 0 ? `${2014 + currentIndex} / 2026` : `2014 / 2026`}
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
              <LazyImage
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