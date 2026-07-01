import { useState, useEffect } from 'react';

const ProductImage = ({ year, accessStatus }) => {
  const [imageSrc, setImageSrc] = useState(null);

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

  // 初始化加载图片
  if (!imageSrc) tryLoadImage(basePath, setImageSrc);

  const getImageStyle = () => {
    if (accessStatus === 'locked' || accessStatus === 'accessible') {
      return 'brightness-[0]';
    }
    return 'brightness-100';
  };

  return (
    <div className="absolute inset-0">
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${getImageStyle()}`}
        />
      )}
    </div>
  );
};

export default ProductImage;
