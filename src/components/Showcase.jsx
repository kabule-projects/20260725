import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProductAccessStatus } from '../utils/accessControl';
import { PRODUCTS } from '../data/products';
import { getBillboardMessage } from '../data/billboardMessages';

const ProductSilhouetteImage = ({ year, accessStatus }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const basePath = `/images/${year}`;
  const formats = ['webp', 'png', 'jpg', 'jpeg'];

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

  const getImageStyle = () => {
    if (accessStatus === 'locked' || accessStatus === 'accessible') {
      return 'brightness-[0]';
    }
    return 'brightness-100';
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

const Showcase = ({ lights, onProductClick }) => {
  const isAllUnlocked = PRODUCTS.every(product => {
    const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
    return accessStatus === 'unlocked';
  });

  const product2014 = PRODUCTS.find(p => p.year === 2014);
  const otherProducts = PRODUCTS.filter(p => p.year !== 2014);
  
  // 将其他年份（12个）分成3行，每行4个
  const rows = [];
  for (let i = 0; i < 12; i += 4) {
    rows.push(otherProducts.slice(i, i + 4));
  }

  const handleProductClick = (product) => {
    const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
    const message = getBillboardMessage(product.year, accessStatus);
    onProductClick(product, message);
  };

  return (
    <div className="relative w-full h-full">
      {/* 底层：橱窗背景 */}
      <img
        src="/images/main/橱窗.webp"
        alt="橱窗"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ zIndex: 1 }}
      />
      
      {/* 中间层：商品陈列 */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15%] px-[2%]" style={{ zIndex: 2 }}>
        <div className="w-full flex justify-center mb-[2%]">
          {product2014 && (
            <ShowcaseItem
              product={product2014}
              lights={lights}
              onClick={() => handleProductClick(product2014)}
            />
          )}
        </div>
        
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

      {/* 顶层：玻璃贴图 */}
      {!isAllUnlocked && (
        <img
          src="/images/main/玻璃.webp"
          alt="玻璃"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: 3 }}
        />
      )}
    </div>
  );
};

// 展示单个商品
const ShowcaseItem = ({ product, lights, onClick }) => {
  const accessStatus = getProductAccessStatus(product, lights, PRODUCTS);
  
  return (
    <motion.div
      className="w-[18%] aspect-square relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden">
        <ProductSilhouetteImage year={product.year} accessStatus={accessStatus} />
      </div>
    </motion.div>
  );
};

export default Showcase;
