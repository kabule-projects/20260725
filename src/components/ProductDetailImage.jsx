import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailImage = ({ year }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);

  // 尝试加载详情图
  const loadDetailImages = () => {
    const detailImages = [];
    let index = 1;
    
    const tryLoad = () => {
      const formats = ['png', 'jpg', 'jpeg'];
      const tryFormat = (fmtIdx) => {
        if (fmtIdx >= formats.length) {
          // 所有格式都尝试完了，检查是否还有下一张
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

  // 初始加载
  if (images.length === 0 && !selectedImage) {
    loadDetailImages();
  }

  // 打开图片
  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  // 关闭图片
  const handleClose = () => {
    setSelectedImage(null);
  };

  // 如果没有图片，不渲染
  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        {images.map((url, index) => (
          <div
            key={index}
            className="relative w-full max-w-[900px] mx-auto aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(url)}
          >
            <img
              src={url}
              alt={`Detail ${index + 1}`}
              className="w-full h-full object-contain bg-memory-dark/50"
            />
          </div>
        ))}
      </div>

      {/* 点击放大 Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={selectedImage}
              alt="Detail"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* 关闭按钮 */}
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:opacity-70 transition-opacity"
              onClick={handleClose}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailImage;
