import { useState, useEffect, useRef } from 'react';

const ASSET_VERSION = '15';

const LazyImage = ({ src, alt = '', className = '', onLoad, style, preload = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(preload);
  const imgRef = useRef(null);

  useEffect(() => {
    if (preload) {
      setIsInView(true);
      return;
    }

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
  }, [preload]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-memory-dark/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-memory-accent animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
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