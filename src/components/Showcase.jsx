import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IMAGE_BASE_URL } from '../config/imageConfig';
import { getProductAccessStatus } from '../utils/accessControl';
import { calculateThreshold } from '../utils/brightness';
import { PRODUCTS } from '../data/products';

// 商品图组件 - 支持透明底PNG
// displayStatus: 'silhouette' | 'normal' | 'unlocked-glow'
const ProductSilhouetteImage = ({ year, displayStatus }) => {
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

  // 根据状态设置样式
  const getImageStyle = () => {
    switch (displayStatus) {
      case 'silhouette':
        return 'brightness-[0.3]';
      case 'normal':
        return 'brightness-100';
      case 'unlocked-glow':
        return 'brightness-100 drop-shadow-[0_0_15px_rgba(255,200,100,0.8)]';
      default:
        return 'brightness-100';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${getImageStyle()}`}
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
  // 组织商品布局：1行2014 + 3行每行4个（共13个商品）
  const product2014 = PRODUCTS.find(p => p.year === 2014);
  const otherProducts = PRODUCTS.filter(p => p.year !== 2014);
  
  // 将其他年份（12个）分成3行，每行4个
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
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[12%] px-[2%]">
        {/* 第一排：2014（居中） */}
        <div className="w-full flex justify-center mb-[2%]">
          {product2014 && (
            <ShowcaseItem
              product={product2014}
              lights={lights}
              onClick={() => handleProductClick(product2014)}
            />
          )}
        </div>
        
        {/* 接下来3排，每排4个 */}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="w-full flex justify-center gap-[1%] mb-[2%]">
            {row.map((product) => (
              <ShowcaseItem
                key={product.id}
                product={product}
                lights={lights}
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
const ShowcaseItem = ({ product, lights, onClick }) => {
  const light = lights[product.id] || 0;
  const threshold = calculateThreshold(product.year);
  const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
  
  const displayStatus = getProductDisplayStatus(product, accessStatus, light, threshold);
  
  const isClickable = displayStatus === 'silhouette' || displayStatus === 'normal' || displayStatus === 'unlocked-glow';
  
  return (
    <motion.div
      className="w-[18%] aspect-square relative cursor-pointer"
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      {/* 背景遮罩 - 仅剪影状态 */}
      {displayStatus === 'silhouette' && (
        <div className="absolute inset-0 bg-memory-dark/50 rounded-lg" />
      )}
      
      {/* 商品图片 */}
      <div className="absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden">
        <ProductSilhouetteImage year={product.year} displayStatus={displayStatus} />
      </div>
    </motion.div>
  );
};

export default Showcase;
