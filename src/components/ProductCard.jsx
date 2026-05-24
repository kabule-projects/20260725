import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateBrightness, getBrightnessClass, calculateThreshold } from '../utils/brightness';

const ProductCard = ({ product, light = 0, index }) => {
  const threshold = calculateThreshold(product.year);
  const brightness = calculateBrightness(light, product.locked);
  const brightnessClass = getBrightnessClass(brightness);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`}>
        <motion.div
          className={`memory-card rounded-xl p-4 cursor-pointer relative overflow-hidden ${
            product.locked ? 'opacity-60' : ''
          }`}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-memory-dark/50 surreal-border">
            <div
              className={`absolute inset-0 bg-gradient-to-br from-memory-glow/10 to-memory-accent/20 ${brightnessClass}`}
              style={{
                filter: `brightness(${brightness})`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-4xl ${
                    product.locked
                      ? 'text-memory-muted'
                      : 'text-memory-glow/40'
                  }`}
                >
                  {product.locked ? '🔒' : '✧'}
                </span>
              </div>

              {!product.locked && light > 0 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-memory-accent/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </div>

            {product.locked && (
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

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-1 bg-memory-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-memory-accent to-memory-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((light / threshold) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;