import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IMAGE_BASE_URL } from '../config/imageConfig';
import { getProductAccessStatus, calculateTotalLight } from '../utils/accessControl';
import { calculateThreshold } from '../utils/brightness';
import { PRODUCTS } from '../data/products';

const YEAR_2026_TOTAL_THRESHOLD = 725;

// 商品图组件 - 支持透明底PNG
const ProductSilhouetteImage = ({ year, isActive }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const basePath = `${IMAGE_BASE_URL}${year}`;
  const formats = ['png', 'jpg', 'jpeg'];

  const tryLoadImage = (base, setSrc) => {
    const tryFormat = (index) => {
      if (index >= formats.length) return;
      const url = `${base}.${formats[index]}`;
      const img = new Image();
      img.onload = () => setSrc(url);
      img.onerror = () => tryFormat(index + 1);
      img.src = url;
    };
    tryFormat(0);
  };

  useEffect(() => {
    tryLoadImage(basePath, setImageSrc);
  }, [basePath]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            isActive ? 'drop-shadow-[0_0_20px_rgba(255,200,100,0.8)] scale-105' : ''
          }`}
        />
      ) : (
        <div className="w-full h-full bg-memory-dark/30 rounded" />
      )}
    </div>
  );
};

// 判断商品显示状态
const getProductDisplayStatus = (product, accessStatus, light, threshold) => {
  if (product.year === 2014) {
    // 2014: locked/accessible 显示剪影, unlocked 显示商品+发光
    return accessStatus === 'unlocked' ? 'unlocked-glow' : 'silhouette';
  } else if (product.year === 2026) {
    // 2026: locked/accessible 显示剪影, unlocked 显示商品+发光
    return accessStatus === 'unlocked' ? 'unlocked-glow' : 'silhouette';
  } else {
    // 其他年份: locked 显示剪影, accessible 显示商品, unlocked 显示商品+发光
    if (accessStatus === 'locked') return 'silhouette';
    if (accessStatus === 'accessible') return 'normal';
    return 'unlocked-glow';
  }
};

const Showcase = ({ lights, onProductClick }) => {
  // 组织商品布局：1行2014 + 4行每行3个（共13个商品）
  const product2014 = PRODUCTS.find(p => p.year === 2014);
  const otherProducts = PRODUCTS.filter(p => p.year !== 2014);
  
  // 将其他年份（12个）分成4行，每行3个
  const rows = [];
  for (let i = 0; i < 12; i += 4) {
    rows.push(otherProducts.slice(i, i + 4));
  }

  const handleProductClick = (product) => {
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
    const displayStatus = getProductDisplayStatus(product, accessStatus, light, threshold);
    
    let message = '';
    
    switch (displayStatus) {
      case 'silhouette':
        message = '还没找到这里的商品，晚点再来吧';
        break;
      case 'normal':
        message = '大家的回忆还不够解锁这件商品呢，可以再帮我想想吗？';
        break;
      case 'unlocked-glow':
        message = product.moreInfo?.text || '记忆已照亮';
        break;
      default:
        message = '';
    }
    
    onProductClick(product, message);
  };

  return (
    <div className="relative w-full h-full">
      {/* 橱窗背景 */}
      <img
        src={`${IMAGE_BASE_URL}main/橱窗.png`}
        alt="橱窗"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* 商品陈列区域 */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[6%] px-[8%]">
        {/* 第一排：2014（居中，大尺寸） */}
        <div className="w-full flex justify-center mb-[2%]">
          {product2014 && (
            <ShowcaseItem
              product={product2014}
              lights={lights}
              size="large"
              onClick={() => handleProductClick(product2014)}
            />
          )}
        </div>
        
        {/* 接下来4排，每排4个 */}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="w-full flex justify-center gap-[4%] mb-[1.5%]">
            {row.map((product) => (
              <ShowcaseItem
                key={product.id}
                product={product}
                lights={lights}
                size="small"
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// 展示单个商品
const ShowcaseItem = ({ product, lights, size, onClick }) => {
  const light = lights[product.id] || 0;
  const threshold = calculateThreshold(product.year);
  const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
  const totalLight = calculateTotalLight(lights, PRODUCTS);
  
  const displayStatus = getProductDisplayStatus(product, accessStatus, light, threshold);
  
  const isClickable = displayStatus === 'silhouette' || displayStatus === 'normal' || displayStatus === 'unlocked-glow';
  
  const sizeClasses = size === 'large' 
    ? 'w-[18%] aspect-square' 
    : 'w-[15%] aspect-square';

  return (
    <motion.div
      className={`${sizeClasses} relative cursor-pointer`}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      {/* 剪影层 - 用于所有非unlocked-glow状态 */}
      {displayStatus !== 'unlocked-glow' && (
        <div className="absolute inset-0 bg-memory-dark/70 rounded-lg flex items-center justify-center">
          <ProductSilhouetteImage year={product.year} isActive={false} />
        </div>
      )}
      
      {/* 正常商品层 - 用于accessible和unlocked-glow状态 */}
      {(displayStatus === 'normal' || displayStatus === 'unlocked-glow') && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center">
          <ProductSilhouetteImage year={product.year} isActive={displayStatus === 'unlocked-glow'} />
        </div>
      )}
      
      {/* 发光特效 - 仅unlocked-glow状态 */}
      {displayStatus === 'unlocked-glow' && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-memory-accent/30 to-transparent animate-pulse" />
      )}
    </motion.div>
  );
};

export default Showcase;
