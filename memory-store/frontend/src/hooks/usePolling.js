import { useEffect, useRef } from 'react';

export const usePolling = (callback, interval = 20000) => {
  const savedCallback = useRef(callback);
  const isMounted = useRef(true);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    isMounted.current = true;

    const tick = () => {
      if (isMounted.current) {
        savedCallback.current();
      }
    };

    tick();
    const id = setInterval(tick, interval);

    return () => {
      isMounted.current = false;
      clearInterval(id);
    };
  }, [interval]);
};

export default usePolling;