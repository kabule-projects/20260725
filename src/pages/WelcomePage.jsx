import { useState } from 'react';

const WelcomePage = ({ onStart }) => {
  const [phase, setPhase] = useState('idle');

  const handleStart = () => {
    setPhase('dimming');
    
    setTimeout(() => {
      setPhase('fading');
    }, 800);
    
    setTimeout(() => {
      setPhase('done');
      onStart();
    }, 1800);
  };

  const getContainerStyle = () => {
    switch (phase) {
      case 'dimming':
        return { opacity: 1, transition: 'none' };
      case 'fading':
        return { opacity: 0, transition: 'opacity 1s ease-out' };
      case 'done':
        return { opacity: 0, pointerEvents: 'none' };
      default:
        return { opacity: 1 };
    }
  };

  const getBackgroundStyle = () => {
    switch (phase) {
      case 'dimming':
        return { filter: 'brightness(0)', transition: 'filter 0.8s ease-out' };
      case 'fading':
      case 'done':
        return { filter: 'brightness(0)', transition: 'none' };
      default:
        return {};
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={getContainerStyle()}
    >
      <div 
        className="absolute inset-0"
        style={getBackgroundStyle()}
      >
        <img
          src="/images/welcome/welcome-bg.webp"
          alt="Welcome"
          className="w-full h-full object-cover"
        />
      </div>

      {phase === 'idle' && (
        <button
          className="absolute top-[85%] left-[50%] -translate-x-1/2 px-8 py-3 bg-memory-accent/80 hover:bg-memory-accent hover:scale-105 active:scale-95 text-memory-dark font-bold rounded-lg transition-transform duration-200"
          onClick={handleStart}
        >
          开始
        </button>
      )}
    </div>
  );
};

export default WelcomePage;