import { useState, useEffect } from 'react';
import LazyImage from './LazyImage';

const ProductImage = ({ year, accessStatus, additionalClass = '' }) => {
  const [imageSrc, setImageSrc] = useState(null);

  const basePath = `/images/${year}`;
  
  const formats = ['webp', 'png', 'jpg', 'jpeg'];

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

  useEffect(() => {
    if (!imageSrc) {
      tryLoadImage(basePath, setImageSrc);
    }
  }, [imageSrc, basePath]);

  const isAccessible = accessStatus === 'accessible';

  return (
    <div className={`absolute inset-0 ${isAccessible ? 'brightness-[0]' : ''}`} style={isAccessible ? { filter: 'brightness(0) drop-shadow(0 0 8px rgba(137, 128, 246, 0.6))' } : {}}>
      {imageSrc && (
        <LazyImage
          src={imageSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${additionalClass}`}
          preload={true}
        />
      )}
    </div>
  );
};

export default ProductImage;