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

  const YEAR_2026_TOTAL_THRESHOLD = 725;
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
        <div>
          <motion.div
            className={`memory-card rounded-xl p-4 cursor-not-allowed relative overflow-hidden ${
              isLocked ? 'opacity-60' : ''
            }`}
          >
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-memory-dark/50 surreal-border">
              {/* 2014年在unlocked状态之前显示❔ */}
              {product.year === 2014 && accessStatus !== 'unlocked' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-memory-muted">❔</span>
                </div>
              ) : (
                <ProductImage year={product.year} />
              )}

              {!isFullyIlluminated && isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-memory-muted">
                    🔒
                  </span>
                </div>
              )}

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-memory-dark/60">
                  <span className="text-memory-muted text-xs uppercase tracking-widest">
                    预售
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-memory-accent text-sm font-medium">
                  {product.year}
                </span>
                <span className="text-memory-muted text-xs">
                  {product.branch}
                </span>
              </div>

              <h3 className="text-memory-glow font-serif text-lg leading-tight">
                {product.title}
              </h3>

              <div className="flex items-center gap-2 pt-2 h-3">
                {!isFullyIlluminated && (
                  <div className="flex-1 h-1 bg-memory-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-memory-accent to-memory-glow"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <Link to={`/product/${product.id}`}>
          <motion.div
            className={`memory-card rounded-xl p-4 cursor-pointer relative overflow-hidden ${
              isLocked ? 'opacity-60' : ''
            }`}
            whileHover={isLocked ? {} : { y: -5, scale: 1.02 }}
            whileTap={isLocked ? {} : { scale: 0.98 }}
          >
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-memory-dark/50 surreal-border">
              {/* 2014年在unlocked状态之前显示❔ */}
              {product.year === 2014 && accessStatus !== 'unlocked' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-memory-muted">❔</span>
                </div>
              ) : (
                <ProductImage year={product.year} />
              )}

              {!isFullyIlluminated && isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl text-memory-muted">
                    🔒
                  </span>
                </div>
              )}

              {!isLocked && light > 0 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-memory-accent/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-memory-dark/60">
                  <span className="text-memory-muted text-xs uppercase tracking-widest">
                    预售
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-memory-accent text-sm font-medium">
                  {product.year}
                </span>
                <span className="text-memory-muted text-xs">
                  {product.branch}
                </span>
              </div>

              <h3 className="text-memory-glow font-serif text-lg leading-tight">
                {product.title}
              </h3>

              <div className="flex items-center gap-2 pt-2 h-3">
                {!isFullyIlluminated && (
                  <div className="flex-1 h-1 bg-memory-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-memory-accent to-memory-glow"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Link>
      )}
    </motion.div>
  );
};

export default ProductCard;