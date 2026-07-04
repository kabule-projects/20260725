import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MiniGame from '../components/MiniGame';
import PhotoGallery from '../components/PhotoGallery';
import { contributeLight } from '../services/api';
import { formatCooldown, calculateThreshold } from '../utils/brightness';
import { getProductAccessStatus, calculateTotalLight, calculate2014Progress } from '../utils/accessControl';
import { PRODUCTS } from '../data/products';
import { GAME_CONFIGS } from '../data/gameConfigs';
import ProductImage from '../components/ProductImage';
import ProductDetailImage from '../components/ProductDetailImage';
// 2014年图集图片
const GALLERY_IMAGES_2014 = [
  '/images/gallery/1.webp',
  '/images/gallery/2.webp',
  '/images/gallery/3.webp',
  '/images/gallery/4.webp',
  '/images/gallery/5.webp',
  '/images/gallery/6.webp',
  '/images/gallery/7.webp',
  '/images/gallery/8.webp',
  '/images/gallery/9.webp',
  '/images/gallery/10.webp',
  '/images/gallery/11.webp',
  '/images/gallery/12.webp',
  '/images/gallery/13.gif',
];

// const ILLUMINATE_THRESHOLD = 500;
const ILLUMINATE_THRESHOLD = 5;
const COOLDOWN_KEY = (id) => `memoryStore:cooldown:${id}`;
// const COOLDOWN_DURATION = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_DURATION = 30 * 1000;

const Product = ({ lights, setLights }) => {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localFeedback, setLocalFeedback] = useState(false);
  const [cooldownRestored, setCooldownRestored] = useState(false);
  const [showFullscreenGame, setShowFullscreenGame] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // 全屏游戏时禁止滚动
  useEffect(() => {
    if (showFullscreenGame) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFullscreenGame]);

  useEffect(() => {
    // Check localStorage for local cooldown
    const savedCooldown = localStorage.getItem(COOLDOWN_KEY(id));
    if (savedCooldown) {
      const elapsed = Date.now() - parseInt(savedCooldown);
      const remaining = Math.max(0, Math.ceil((COOLDOWN_DURATION - elapsed) / 1000));
      setCooldown(remaining);
    }
    setCooldownRestored(true);
  }, [id]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else if (cooldown === 0) {
      setGameCompleted(false);
    }
  }, [cooldown]);

  const handleGameComplete = useCallback(async () => {
    if (!product) return;
    const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
    if (contributing || accessStatus === 'locked') return;

    setContributing(true);
    setLocalFeedback(true);

    try {
      const result = await contributeLight(product.id);
      setLights((prev) => ({
        ...prev,
        [product.id]: result.light,
      }));
      // Save cooldown timestamp to localStorage
      localStorage.setItem(COOLDOWN_KEY(id), Date.now().toString());
      // setCooldown(600);
      setCooldown(30);
      // Reset gameCompleted after successful contribution
      setGameCompleted(false);
    } catch (error) {
      // handle backend cooldown as fallback
      if (error.status === 429) {
        localStorage.setItem(COOLDOWN_KEY(id), (Date.now() - error.remaining * 1000).toString());
        setCooldown(error.remaining);
      } else {
        // Reset game state on failure so user can try again
        setGameCompleted(false);
      }
      console.error('Failed to contribute light:', error);
    } finally {
      setContributing(false);
      setTimeout(() => setLocalFeedback(false), 2000);
    }
  }, [product, contributing, setLights, id, lights, PRODUCTS]);

  if (!product) return null;

  // 判断 lights 是否已加载（非空对象）
  const isLightsLoaded = Object.keys(lights).length > 0;
  
  // 只有在 lights 加载完成后才进行权限判断
  const accessStatus = isLightsLoaded ? getProductAccessStatus(product, lights, PRODUCTS) : 'loading';
  const isLocked = accessStatus === 'locked';
  const isUnlocked = accessStatus === 'unlocked';
  const isSilhouette = accessStatus === 'locked' || accessStatus === 'accessible';

  // 锁定状态下重定向回首页（仅在数据加载完成后）
  useEffect(() => {
    if (isLightsLoaded && isLocked) {
      window.location.href = '/';
    }
  }, [isLightsLoaded, isLocked]);

  // 数据未加载完成时显示加载状态
  if (!isLightsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-memory-glow text-lg">加载中...</div>
      </div>
    );
  }

  const currentLight = lights[product.id] || 0;
  const threshold = calculateThreshold(product.year);
  const isFullyIlluminated = isUnlocked;

  const totalLight = calculateTotalLight(lights, PRODUCTS);
  const YEAR_2026_TOTAL_THRESHOLD = 725;
  let progress = 0;
  
  if (product.year === 2014) {
    progress = calculate2014Progress(lights, PRODUCTS);
  } else if (product.year === 2026) {
    progress = Math.min((totalLight / YEAR_2026_TOTAL_THRESHOLD) * 100, 100);
  } else {
    progress = Math.min((currentLight / threshold) * 100, 100);
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-50 bg-memory-dark/80 backdrop-blur-md border-b border-memory-accent/10">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <Link
            to="/"
            className="text-memory-glow/60 hover:text-memory-glow transition-colors"
          >
            ← 返回
          </Link>
          <span className="text-memory-accent text-sm">{product.year}</span>
        </div>
      </header>

      <main className="px-4 py-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif text-gradient">
              {product.title}
            </h1>
            <p className="text-memory-muted text-sm uppercase tracking-widest">
              {product.branch}
            </p>
          </div>

          <div
            className="relative aspect-square rounded-xl overflow-hidden bg-memory-dark/50 surreal-border"
          >
            {/* 使用商品图片组件 */}
            <ProductImage year={product.year} accessStatus={accessStatus} />

            {/* 如果没有图片则显示占位符 */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl text-memory-glow/30">
                  🔒
                </span>
              </div>
            )}

            <AnimatePresence>
              {localFeedback && (
                <motion.div
                  className="absolute inset-0 bg-memory-accent/20 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              )}
            </AnimatePresence>
          </div>

          {isUnlocked && (
            <div className="memory-card rounded-xl p-6 space-y-4">
              <p className="text-memory-glow/90 leading-relaxed italic">
                "{product.description}"
              </p>
            </div>
          )}

          <AnimatePresence>
            {isUnlocked && product.moreInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="memory-card rounded-xl p-6 space-y-4 border-memory-accent/30">
                  <div className="flex items-center gap-2">
                    <span className="text-memory-accent">★</span>
                    <h3 className="text-memory-accent font-medium">
                      记忆已照亮
                    </h3>
                    <span className="text-memory-accent">★</span>
                  </div>

                  {/* 详情图 */}
                  <ProductDetailImage year={product.year} />

                  <p className="text-memory-glow/80 leading-relaxed">
                    {product.moreInfo.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLocked && !isUnlocked && product.moreInfo && (
            <div className="memory-card rounded-xl p-6 border-memory-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-memory-muted text-sm">✧</span>
                <span className="text-memory-muted text-sm uppercase tracking-wider">
                  隐藏的记忆
                </span>
                <span className="text-memory-muted text-sm">✧</span>
              </div>
              <p className="text-memory-muted text-xs mt-3 text-center">
                模糊的记忆碎片，或许大家还能再想起些什么……<br />点击下方加入回忆，一起找回这件商品吧
              </p>
            </div>
          )}

          {(product.year !== 2026 || !isLocked) && product.year !== 2014 && (
            <div className="memory-card rounded-xl p-6">
              {isLocked ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-memory-muted">
                    他说想再荡个秋千
                  </p>
                  <p className="text-memory-muted/60 text-sm">
                    {product.year === 2026 ? '完成所有年份的回忆收集后解锁' : '记忆有些模糊'}
                  </p>
                </div>
              ) : cooldown > 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-memory-muted">
                    正在拼凑记忆碎片...
                  </p>
                  <p className="text-memory-accent text-2xl font-mono">
                    {formatCooldown(cooldown)}
                  </p>
                  <p className="text-memory-muted/60 text-sm">
                    这刹那的感受足够算不朽，稍后再回来吧
                  </p>
                </div>
              ) : contributing ? (
                <div className="text-center py-8">
                  <motion.div
                    className="text-memory-accent text-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    ✧
                  </motion.div>
                  <p className="text-memory-glow mt-4">米子星正在发光...</p>
                </div>
              ) : !cooldownRestored ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-memory-muted">检查中...</p>
                </div>
              ) : gameCompleted ? (
                <div className="text-center space-y-4">
                  <motion.div
                    className="py-8 space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-memory-accent text-lg">
                      ✧ 记忆已刻印 ✧
                    </p>
                    <p className="text-memory-muted text-sm">
                      我们听到了 我们看到了
                    </p>
                  </motion.div>
                  <motion.button
                    className="w-full py-3 rounded-lg bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors"
                    onClick={handleGameComplete}
                    whileTap={{ scale: 0.98 }}
                  >
                    不朽的 永恒了 我们记得
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  className="w-full py-6 rounded-xl bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors text-lg font-medium"
                  onClick={() => setShowFullscreenGame(true)}
                  whileTap={{ scale: 0.98 }}
                >
                  加入回忆
                </motion.button>
              )}
            </div>
          )}

          {!isLocked && !isUnlocked && (
            <div className="memory-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-memory-accent">✧</span>
                <div className="flex-1">
                  <div className="h-2 bg-memory-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-memory-accent to-memory-glow"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${progress}%`,
                      }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <span className="text-memory-muted text-xs">
                  已刻印{Math.round(progress)}%</span> 
              </div>
            </div>
          )}

          {/* 2014年图集 */}
          {product.year === 2014 && (
            <motion.div
              className="mt-48"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-memory-accent text-lg mb-6 text-center">记忆刻印</h3>
              <PhotoGallery images={GALLERY_IMAGES_2014} />
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* 全屏游戏模态框 */}
      <AnimatePresence>
          {showFullscreenGame && (
            <motion.div
              className="fixed inset-0 z-50 bg-memory-dark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 返回按钮 - 游戏进行中显示 */}
              {!gameCompleted && (
                <motion.button
                  className="absolute top-4 left-4 px-4 py-2 text-memory-glow/70 hover:text-memory-glow transition-colors z-10"
                  onClick={() => setShowFullscreenGame(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← 返回
                </motion.button>
              )}

              {/* 游戏内容 */}
              <div className="h-screen flex items-center justify-center px-4 py-3">
                {gameCompleted ? (
                  <motion.div
                    className="text-center space-y-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-memory-accent text-2xl">
                      ✧ 记忆已刻印 ✧
                    </p>
                    <p className="text-memory-muted text-lg">
                      我们听到了 我们看到了
                    </p>
                    <motion.button
                      className="px-8 py-4 rounded-xl bg-memory-accent/20 text-memory-accent hover:bg-memory-accent/30 transition-colors text-lg font-medium"
                      onClick={() => {
                        handleGameComplete();
                        setShowFullscreenGame(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      不朽的 永恒了 我们记得
                    </motion.button>
                  </motion.div>
                ) : product.videoUrl ? (
                  // B站视频嵌入模式
                  <div className="w-full max-w-3xl aspect-video">
                    <iframe
                      src={product.videoUrl}
                      className="w-full h-full rounded-lg"
                      allow="autoplay; fullscreen"
                      scrolling="no"
                      frameBorder="0"
                      title="B站视频"
                    />
                  </div>
                ) : (
                  <MiniGame
                    gameType={product.gameType}
                    config={GAME_CONFIGS[product.id]}
                    onComplete={() => setGameCompleted(true)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

// 已刻印{Math.min(Math.round((currentLight / 500) * 100), 100)}%

export default Product;