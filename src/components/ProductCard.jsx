import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateThreshold } from '../utils/brightness';
import { getProductAccessStatus, calculateTotalLight, calculate2014Progress } from '../utils/accessControl';
import ProductImage from './ProductImage';
import { PRODUCTS } from '../data/products';

const ProductCard = ({ product, light = 0, index, lights }) => {
  const threshold = calculateThreshold(product.year);
  const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
  const isLocked = accessStatus === 'locked';
  const isFullyIlluminated = accessStatus === 'unlocked';

  const YEAR_2026_TOTAL_THRESHOLD = 25700;
  let progress = 0;
  
  if (product.year === 2014) {
    progress = calculate2014Progress(lights, PRODUCTS);
  } else if (product.year === 2026) {
    progress = Math.min((calculateTotalLight(lights, PRODUCTS) / YEAR_2026_TOTAL_THRESHOLD) * 100, 100);
  } else {
    progress = Math.min((light / threshold) * 100, 100);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {isLocked ? (
        <div className="relative">
          <img
            src="/images/ui/home/商品卡.webp"
            alt="商品卡背景"
            className="w-full h-auto"
          />
          <span 
            className="absolute left-[50%] top-[0.5%] -translate-x-[50%] font-medium text-memory-accent"
            style={{ fontSize: 'clamp(12px, 5px + 1.2vmax, 40px)' }}
          >
            {product.year}
          </span>
          <div 
            className="absolute left-[7.5%] top-[5%]"
            style={{ 
              width: '85%',
              aspectRatio: '1'
            }}
          >
            <img
              src="/images/ui/home/未解锁.webp"
              alt="未解锁"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 
            className="absolute font-serif leading-tight text-memory-accent text-left"
            style={{ 
              top: '76%',
              left: '7%',
              width: '86%',
              fontSize: 'clamp(12px, 8px + 1.2vmax, 50px)'
            }}
          >
            {product.title}
          </h3>
        </div>
      ) : (
        <Link to={`/product/${product.id}`}>
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/images/ui/home/商品卡.webp"
              alt="商品卡背景"
              className="w-full h-auto"
            />
            <span 
              className="absolute left-[50%] top-[0.5%] -translate-x-[50%] font-medium text-memory-accent"
              style={{ fontSize: 'clamp(12px, 5px + 1.2vmax, 40px)' }}
            >
              {product.year}
            </span>
            <div 
              className="absolute"
              style={{ 
                top: '5%',
                left: '7.5%',
                width: '85%',
                aspectRatio: '1'
              }}
            >
              <ProductImage 
                year={product.year} 
                accessStatus={accessStatus} 
                additionalClass={accessStatus === 'accessible' ? 'brightness-[0]' : ''}
              />
            </div>
            <h3 
              className="absolute font-serif leading-tight text-memory-accent text-left"
              style={{ 
                top: '76%',
                left: '7%',
                width: '86%',
                fontSize: 'clamp(12px, 8px + 1.2vmax, 50px)'
              }}
            >
              {product.title}
            </h3>
            {!isFullyIlluminated && (
              <div 
                className="absolute w-full h-1.5 bg-memory-dark rounded-full overflow-hidden"
                style={{ 
                  top: '92%',
                  left: '7.5%',
                  width: '85%'
                }}
              >
                <motion.div
                  className="h-full bg-memory-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            )}
          </motion.div>
        </Link>
      )}
    </motion.div>
  );
};

export default ProductCard;