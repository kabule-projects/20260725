import { useState, useEffect } from 'react';
import { IMAGE_BASE_URL } from '../config/imageConfig';

const ProductImage = ({ year }) => {
  const [imageSrc, setImageSrc] = useState(null);

  // 图片路径（本地存储）
  const basePath = `${IMAGE_BASE_URL}${year}`;
  
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

  // 初始化加载图片
  if (!imageSrc) tryLoadImage(basePath, setImageSrc);

  return (
    <div className="absolute inset-0">
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 1.0 }}
        />
      )}
    </div>
  );
};

export default ProductImage;
