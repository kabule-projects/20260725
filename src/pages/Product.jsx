import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MiniGame from '../components/MiniGame';
import PhotoGallery from '../components/PhotoGallery';
import { contributeLight } from '../services/api';
import { formatCooldown, calculateThreshold } from '../utils/brightness';
import { getProductAccessStatus, calculateTotalLight, calculate2014Progress, getProductPhase, isPhaseUnlockedByDate } from '../utils/accessControl';
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

const COOLDOWN_KEY = (id) => `memoryStore:cooldown:${id}`;
const COOLDOWN_DURATION = 120 * 1000;

const Product = ({ lights, setLights }) => {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localFeedback, setLocalFeedback] = useState(false);
  const [cooldownRestored, setCooldownRestored] = useState(false);
  const [showFullscreenGame, setShowFullscreenGame] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);

  const GALLERY_DEADLINE = new Date('2026-07-18T00:00:00+08:00');
  const isBeforeDeadline = new Date() < GALLERY_DEADLINE;

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
      setCooldown(Math.ceil(COOLDOWN_DURATION / 1000));
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

  const phase = getProductPhase(product.year);
  const isDateUnlocked = phase ? isPhaseUnlockedByDate(phase.id) : false;

  useEffect(() => {
    if (!isDateUnlocked) {
      window.location.href = '/';
    }
  }, [isDateUnlocked]);

  if (!isDateUnlocked) {
    return null;
  }

  const isLightsLoaded = Object.keys(lights).length > 0;
  
  const accessStatus = isLightsLoaded ? getProductAccessStatus(product, lights, PRODUCTS) : 'loading';
  const isLocked = accessStatus === 'locked';
  const isUnlocked = accessStatus === 'unlocked';
  const isSilhouette = accessStatus === 'locked' || accessStatus === 'accessible';

  useEffect(() => {
    if (isLightsLoaded && isLocked) {
      window.location.href = '/';
    }
  }, [isLightsLoaded, isLocked]);

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
  const YEAR_2026_TOTAL_THRESHOLD = 72500;
  let progress = 0;
  
  if (product.year === 2014) {
    progress = calculate2014Progress(lights, PRODUCTS);
  } else if (product.year === 2026) {
    progress = Math.min((totalLight / YEAR_2026_TOTAL_THRESHOLD) * 100, 100);
  } else {
    progress = Math.min((currentLight / threshold) * 100, 100);
  }

  return (
    <div className="min-h-screen bg-memory-dark pb-12">
      <div className="relative w-full pb-48">
        <img
          src="/images/ui/product/顶部底图.webp"
          alt="顶部底图"
          className="w-full h-auto"
        />

        <div className="absolute top-4 left-2 right-2 z-10">
          <div className="w-full max-w-6xl mx-auto px-4 flex items-start justify-between">
            <Link to="/" className="w-16 h-auto" style={{ marginTop: '9px' }}>
              <img
                src="/images/ui/product/返回键.webp"
                alt="返回"
                className="w-full h-auto"
              />
            </Link>

            <img
              src="/images/ui/product/logo.webp"
              alt="logo"
              className="h-auto"
              style={{ width: '32%' }}
            />

            <span className="text-memory-info text-base" style={{ marginTop: '12px', marginRight: '12px' }}>{product.year}</span>
          </div>
        </div>

        <div className="absolute top-[25%] left-0 right-0 z-0">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative" style={{ maxWidth: '75%', margin: '0 auto' }}>
              <img
                src="/images/ui/product/椭圆阴影.webp"
                alt="椭圆阴影"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-auto pointer-events-none z-0"
              />

              <div
                className="relative aspect-square z-10"
              >
                <ProductImage year={product.year} accessStatus={accessStatus} />

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
            </div>

            {isUnlocked && (
              <div 
                className="rounded-xl p-6 space-y-4 bg-memory-dark"
                style={{ 
                  border: '1px solid #8980ff',
                  maxWidth: '88%',
                  margin: '15px auto 0',
                  marginTop: '15px'
                }}
              >
                <p className="text-memory-muted leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {!isLocked && !isUnlocked && product.moreInfo && (
              <div 
                className="rounded-xl p-6 bg-memory-dark"
                style={{ 
                  border: '1px solid #8980ff',
                  boxShadow: '0 0 15px rgba(137, 128, 246, 0.3)',
                  margin: '20px auto 0'
                }}
              >
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <span className="text-memory-muted text-base">✧</span>
                  <span className="text-memory-muted text-base uppercase tracking-wider">
                    隐藏的记忆
                  </span>
                  <span className="text-memory-muted text-base">✧</span>
                </div>
                <p className="text-memory-muted text-sm mt-3 text-center">
                  模糊的记忆碎片，或许大家还能再想起些什么……<br />点击下方加入回忆，一起找回这件商品吧
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-[20%] left-0 right-0 z-20">
          <div className="text-center">
            <h1 className="text-5xl font-serif font-bold text-memory-accent tracking-[0.1em]">
              {product.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="relative">
      <main className="px-4 max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >

          <AnimatePresence>
            {isUnlocked && product.moreInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="rounded-xl">
                  <div className="text-center relative z-10">
                    <h3 className="font-medium text-memory-muted text-2xl">
                      记忆已照亮
                    </h3>
                  </div>

                  <div className="relative" style={{ maxWidth: '95%', margin: '64px auto 40px', padding: '30px' }}>
                    <ProductDetailImage year={product.year}/>
                    <img
                      src="/images/ui/product/画框.webp"
                      alt="画框"
                      className="absolute inset-[30px] w-[calc(100%-60px)] h-[calc(100%-60px)] object-contain pointer-events-none"
                      style={{ transform: 'scale(1.3)' }}
                    />
                  </div>

                  <p className="text-memory-muted leading-relaxed text-sm text-right pt-4 mr-8">
                    {product.moreInfo.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(product.year !== 2026 || !isLocked) && product.year !== 2014 && (
            <div className="rounded-xl p-6 pb-32">
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
              ) : (
                <>
                  {!isUnlocked && (
                    <div 
                      className="rounded-xl p-4 mb-4"
                      style={{ 
                        border: '1px solid #8980ff',
                        boxShadow: '0 0 15px rgba(137, 128, 246, 0.3)'
                      }}
                    >
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
                  <motion.button
                    className="w-3/4 mx-auto block"
                    onClick={() => setShowFullscreenGame(true)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src="/images/ui/product/加入回忆.webp"
                      alt="加入回忆"
                      className="w-full h-auto"
                    />
                  </motion.button>
                </>
              )}
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
              <div className="pb-32 relative">
                <PhotoGallery images={GALLERY_IMAGES_2014} lights={lights} products={PRODUCTS} />
                {isBeforeDeadline && (
                  <motion.div
                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowGalleryDialog(true)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <img
        src="/images/ui/product/尾部底图.webp"
        alt="尾部底图"
        className="absolute bottom-0 left-0 w-full h-auto"
      />
      </div>

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
                      className="text-memory-info text-xl"
                      onClick={() => {
                        handleGameComplete();
                        setShowFullscreenGame(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      style={{ backgroundImage: 'url(/images/ui/home/告示牌.webp)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', padding: '0', border: 'none', borderRadius: '0', width: '300px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                    artist={product.gameArtist}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 图集遮照对话框 */}
        <AnimatePresence>
          {showGalleryDialog && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGalleryDialog(false)}
            >
              <motion.div
                className="bg-memory-card/65 backdrop-blur-sm rounded-xl p-6 border border-memory-accent/30 shadow-lg max-w-sm mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-memory-card/95" />
                  <p className="text-memory-glow/90 text-sm text-center leading-relaxed">
                    似乎还没有什么能给他的……再等等看吧
                  </p>
                </div>
                <motion.button
                  className="mt-4 w-full py-2 text-memory-accent text-sm border border-memory-accent/50 rounded hover:bg-memory-accent/10 transition-colors"
                  onClick={() => setShowGalleryDialog(false)}
                  whileTap={{ scale: 0.98 }}
                >
                  好的
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default Product;