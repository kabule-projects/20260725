import { useState, useEffect } from 'react';
import LazyImage from './LazyImage';

const ProductDetailImage = ({ year }) => {
  const [images, setImages] = useState([]);

  const loadDetailImages = () => {
    const detailImages = [];
    let index = 1;
    
    const tryLoad = () => {
      const formats = ['webp', 'png', 'jpg', 'jpeg'];
      const tryFormat = (fmtIdx) => {
        if (fmtIdx >= formats.length) {
          if (detailImages.length > 0 || index > 1) {
            setImages(detailImages);
          }
          return;
        }

        const url = `/images/${year}-detail-${index}.${formats[fmtIdx]}`;
        const img = new Image();
        img.onload = () => {
          detailImages.push(url);
          index++;
          tryLoad();
        };
        img.onerror = () => {
          tryFormat(fmtIdx + 1);
        };
        img.src = url;
      };
      tryFormat(0);
    };

    tryLoad();
  };

  useEffect(() => {
    if (images.length === 0) {
      loadDetailImages();
    }
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {images.map((url, index) => (
        <div
          key={index}
          className="relative w-full max-w-[900px] mx-auto aspect-[3/4] rounded-lg overflow-hidden"
        >
          <LazyImage
            src={url}
            alt={`Detail ${index + 1}`}
            className="w-full h-full object-contain bg-memory-dark/50"
          />
        </div>
      ))}
    </div>
  );
};

export default ProductDetailImage;
