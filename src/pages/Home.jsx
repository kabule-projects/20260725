import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Showcase from '../components/Showcase';
import BillboardCharacter from '../components/BillboardCharacter';
import { PRODUCTS } from '../data/products';

const Home = ({ lights }) => {
  const [dialogMessage, setDialogMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const totalLight = Object.values(lights).reduce((sum, val) => sum + val, 0);

  const handleProductClick = (product, message) => {
    setMessageKey(prev => prev + 1);
    setDialogMessage(message);
  };

  return (
    <div className="min-h-screen bg-memory-dark">
      <div className="relative w-full">
        <img
          src="/images/ui/home/首页头图底.webp"
          alt="首页头图底"
          className="w-full h-auto"
        />
        
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <motion.button
            className="absolute top-6 right-6 px-4 py-2 text-memory-glow text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/staffing">ℹ️</Link>
          </motion.button>

          <motion.img
            src="/images/ui/home/主页头图.webp"
            alt="主页头图"
            className="max-w-full h-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <main className="px-4 md:px-6">
        <motion.div
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div 
            className="relative w-full"
            style={{ paddingBottom: '66.67%' }}
          >
            <div className="absolute inset-0 flex gap-2">
              <div className="w-[60%] h-full">
                <Showcase lights={lights} onProductClick={handleProductClick} />
              </div>
              
              <div className="w-[40%] h-full">
                <BillboardCharacter message={dialogMessage} key={messageKey} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative inline-flex items-center justify-center">
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

      <footer className="relative mt-16">
        <img
          src="/images/ui/home/首页尾图底.webp"
          alt="首页尾图底"
          className="w-full h-auto"
        />
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <p className="text-memory-muted/50 text-xs tracking-wider">
            不朽的 没有了 没人记得
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
