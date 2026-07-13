import { useState, useEffect } from 'react';
import LazyImage from './LazyImage';

const ProductImage = ({ year, accessStatus }) => {
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

  const getImageStyle = () => {
    if (accessStatus === 'locked' || accessStatus === 'accessible') {
      return 'brightness-[0]';
    }
    return 'brightness-100';
  };

  return (
    <div className="absolute inset-0">
      {imageSrc && (
        <LazyImage
          src={imageSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${getImageStyle()}`}
        />
      )}
    </div>
  );
};

export default ProductImage;
