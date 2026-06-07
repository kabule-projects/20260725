import { useState } from 'react';

const ProductImage = ({ year, light, threshold, isFullyIlluminated = false }) => {
  const [bottomSrc, setBottomSrc] = useState(null);
  const [productSrc, setProductSrc] = useState(null);
  const [topSrc, setTopSrc] = useState(null);

  // 图片路径（本地存储）
  const basePath = `/images/${year}`;
  
  // 支持的格式优先级：png > jpg > jpeg
  const formats = ['png', 'jpg', 'jpeg'];

  // 尝试加载图片，支持多种格式
  const tryLoadImage = (base, setSrc) => {
    const tryFormat = (index) => {
      if (index >= formats.length) return;
      
      const url = `${base}.${formats[index]}`;
      const img = new Image();
      img.onload = () => {
        setSrc(url);
      };
      img.onerror = () => {
        tryFormat(index + 1);
      };
      img.src = url;
    };
    tryFormat(0);
  };

  // 如果完全解锁，直接显示完全不透明
  if (isFullyIlluminated) {
    // 初始化加载图片
    if (!bottomSrc) tryLoadImage(`${basePath}-bottom`, setBottomSrc);
    if (!productSrc) tryLoadImage(`${basePath}-product`, setProductSrc);
    if (!topSrc) tryLoadImage(`${basePath}-top`, setTopSrc);

    return (
      <div className="absolute inset-0">
        {bottomSrc && (
          <img
            src={bottomSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 1.0 }}
          />
        )}
        {productSrc && (
          <img
            src={productSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 1.0 }}
          />
        )}
        {topSrc && (
          <img
            src={topSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 1.0 }}
          />
        )}
      </div>
    );
  }

  // 计算进度 (0-1)
  const progress = threshold > 0 ? Math.min(light / threshold, 1) : 1;

  // 计算各图层透明度
  // top/bottom: 50% → 100%
  const topBottomOpacity = 0.5 + (progress * 0.5);
  // product: 0% → 100%
  const productOpacity = progress * 1.0;

  // 初始化加载图片
  if (!bottomSrc) tryLoadImage(`${basePath}-bottom`, setBottomSrc);
  if (!productSrc) tryLoadImage(`${basePath}-product`, setProductSrc);
  if (!topSrc) tryLoadImage(`${basePath}-top`, setTopSrc);

  return (
    <div className="absolute inset-0">
      {/* bottom.png/jpg/jpeg - 底图 */}
      {bottomSrc && (
        <img
          src={bottomSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: topBottomOpacity }}
        />
      )}

      {/* product.png/jpg/jpeg - 商品本体 */}
      {productSrc && (
        <img
          src={productSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: productOpacity }}
        />
      )}

      {/* top.png/jpg/jpeg - 覆盖层（可选） */}
      {topSrc && (
        <img
          src={topSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: topBottomOpacity }}
        />
      )}
    </div>
  );
};

export default ProductImage;
