import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Showcase from '../components/Showcase';
import BillboardCharacter from '../components/BillboardCharacter';
import { PRODUCTS } from '../data/products';
import { setBypassDateLock, getBypassDateLock } from '../utils/accessControl';

const Home = ({ lights }) => {
  const [dialogMessage, setDialogMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [totalLight, setTotalLight] = useState(0);
  const [allUnlocked, setAllUnlocked] = useState(false);
  const [bypassActive, setBypassActive] = useState(getBypassDateLock());

  useEffect(() => {
    const stored = localStorage.getItem('memoryStore:fallbackLights');
    let currentLights = lights;
    if (stored) {
      const localLights = JSON.parse(stored);
      currentLights = { ...currentLights, ...localLights };
    }
    const sum = Object.values(currentLights).reduce((acc, val) => acc + (Number(val) || 0), 0);
    setTotalLight(sum);
    
    const unlockedCount = PRODUCTS.filter(product => {
      const light = currentLights[product.id] || 0;
      const threshold = product.year === 2026 ? 72500 : 
        Math.round(product.year === 2014 ? 0 : (product.year - 2013) * 500);
      return light >= threshold;
    }).length;
    setAllUnlocked(unlockedCount === PRODUCTS.length);
  }, [lights]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        const newState = !bypassActive;
        setBypassDateLock(newState);
        setBypassActive(newState);
        setMessageKey(prev => prev + 1);
        setDialogMessage(newState ? '日期限制已解除' : '日期限制已启用');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [bypassActive]);

  const handleProductClick = (product, message) => {
    setMessageKey(prev => prev + 1);
    setDialogMessage(message);
  };

  return (
    <div className="min-h-screen bg-memory-dark">
      <div className="relative w-full">
        <motion.button
          className="absolute top-8 right-[1px] z-20 w-[60px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/staffing" className="relative w-full h-full flex items-center justify-center">
            <img
              src="/images/ui/home/info.webp"
              alt="staffing"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span className="relative z-10 text-memory-accent font-bold text-sm">i</span>
          </Link>
        </motion.button>

        <img
          src="/images/ui/home/首页头图底.webp"
          alt="首页头图底"
          className="w-full h-auto"
        />

        <div className="absolute inset-0">
          <motion.img
            src="/images/ui/home/主页头图.webp"
            alt="主页头图"
            className="w-full h-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 mb-4">
          <div 
            className="relative w-full"
            style={{ paddingBottom: '70%' }}
          >
            <div className="absolute inset-0 flex gap-0">
              <div className="w-[75%] h-full pl-[7%] pb-[7%]" style={{ zIndex: 1 }}>
                <Showcase lights={lights} onProductClick={handleProductClick} />
              </div>

              <div className="w-[45%] h-full -ml-[10%] relative" style={{ zIndex: 2 }}>
                <BillboardCharacter message={dialogMessage} key={messageKey} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="px-4 md:px-6">
        <motion.div
          className="max-w-6xl mx-auto mb-12 flex justify-center pt-[10%]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative w-[55%]">
            <img
              src="/images/ui/home/告示牌.webp"
              alt="告示牌"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <span className="text-sm text-memory-info">已收集的记忆碎片：</span>
              <span className="font-medium text-sm text-memory-accent">{totalLight}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <ProductCard
                product={product}
                light={lights[product.id] || 0}
                index={index}
                lights={lights}
              />
            </motion.div>
          ))}
        </div>
      </main>

      <div className="relative mt-16 pb-72">
      <footer className="absolute bottom-16 left-0 right-0 z-10 flex justify-center">
        <p className="text-memory-info/70 text-sm tracking-wider">
          {allUnlocked ? '不朽的 永恒了 我们记得' : '不朽的 没有了 没人记得'}
        </p>
      </footer>
      <img
        src="/images/ui/home/首页尾图底.webp"
        alt="首页尾图底"
        className="absolute bottom-0 left-0 w-full h-auto"
      />
      </div>
    </div>
  );
};

export default Home;
