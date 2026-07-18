import { useState, useEffect } from 'react';

export const usePreloadAssets = (assetUrls) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!assetUrls || assetUrls.length === 0) {
      setLoaded(true);
      setProgress(100);
      return;
    }

    let loadedCount = 0;
    const total = assetUrls.length;

    const loadAsset = (url) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setProgress(Math.round((loadedCount / total) * 100));
        if (loadedCount === total) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setProgress(Math.round((loadedCount / total) * 100));
        if (loadedCount === total) {
          setLoaded(true);
        }
      };
      img.src = url;
    };

    assetUrls.forEach(loadAsset);

    return () => {
      setLoaded(false);
      setProgress(0);
    };
  }, [assetUrls]);

  return { loaded, progress };
};
