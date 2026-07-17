import { useState, useEffect, useRef } from 'react';

const ASSET_VERSION = 12;

const LazyImage = ({ src, alt = '', className = '', onLoad, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-memory-dark/30 animate-pulse" />
      )}
      {isInView && (
        <img
          src={`${src}${src.includes('?') ? '&' : '?'}v=${ASSET_VERSION}`}
          alt={alt}
          className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};

export default LazyImage;