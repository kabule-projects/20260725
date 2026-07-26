import { useState, useEffect } from 'react';

// 7月17日19:25北京时间（UTC+8）= 11:25 UTC
const UNLOCK_TIME = new Date('2026-07-17T19:25:00+08:00').getTime();

// 判断当前是否在营业时间内（7:25 - 24:00）
const isBusinessHours = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 0:00 - 7:25 关门
  if (hours < 7 || (hours === 7 && minutes < 25)) {
    return false;
  }
  // 7:25 - 24:00 营业
  return true;
};

// 获取营业时间提示文字
const getBusinessMessage = () => {
  const now = Date.now();
  
  // 未到首次营业时间
  if (now < UNLOCK_TIME) {
    return '本店将于今晚19:25开始营业';
  }
  
  // 已开业，关门时间显示打烊提示
  if (!isBusinessHours()) {
    return '出门右转去时空美味侦查组报个到就睡吧，别熬夜了';
  }
  
  return '';
};

const WelcomePage = ({ onStart }) => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'fading' | 'done'
  const [showButton, setShowButton] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [businessMessage, setBusinessMessage] = useState('');

  // 后门：两步激活模式 - 先按 Ctrl+Shift+\ 激活，然后5秒内按 Q 键强制显示推门按钮
  const [backdoorActive, setBackdoorActive] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '\\')) {
        setBackdoorActive(true);
        setTimeout(() => setBackdoorActive(false), 5000);
        return;
      }
      if (backdoorActive && (e.key === 'q' || e.key === 'Q')) {
        setShowButton(true);
        setBackdoorActive(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [backdoorActive]);

  // 更新营业时间提示
  useEffect(() => {
    const updateMessage = () => {
      setBusinessMessage(getBusinessMessage());
    };
    
    updateMessage();
    // 每分钟更新一次
    const timer = setInterval(updateMessage, 60000);
    return () => clearInterval(timer);
  }, []);

  // 延迟1秒淡入按钮（营业时显示Enter，关门时显示Closed）
  useEffect(() => {
    const now = Date.now();
    const isUnlocked = now >= UNLOCK_TIME || showButton;
    
    if (isUnlocked) {
      const timer = setTimeout(() => {
        setButtonVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setButtonVisible(false);
    }
  }, [showButton]);

  const handleStart = () => {
    setPhase('fading');

    setTimeout(() => {
      setPhase('done');
      onStart();
    }, 2000);
  };

  const getContainerStyle = () => {
    switch (phase) {
      case 'fading':
        return { opacity: 0, transition: 'opacity 2s ease-out' };
      case 'done':
        return { opacity: 0, pointerEvents: 'none' };
      default:
        return { opacity: 1 };
    }
  };

  // lighton层：始终保持闪烁动画
  const getLightOnStyle = () => {
    return { animation: 'morseFlicker 4.8s linear infinite' };
  };

  const now = Date.now();
  const isTimeUnlocked = now >= UNLOCK_TIME || showButton;
  const isOpen = isBusinessHours() || showButton;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={getContainerStyle()}
    >
      <style>{`
        @keyframes morseFlicker {
          0% { opacity: 0; }
          2.08% { opacity: 1; }
          10.42% { opacity: 1; }
          12.5% { opacity: 0; }
          16.67% { opacity: 0; }
          18.75% { opacity: 1; }
          27.08% { opacity: 1; }
          29.17% { opacity: 0; }
          33.33% { opacity: 0; }
          34.38% { opacity: 1; }
          36.46% { opacity: 1; }
          37.5% { opacity: 0; }
          41.67% { opacity: 0; }
          42.71% { opacity: 1; }
          44.79% { opacity: 1; }
          45.83% { opacity: 0; }
          58.33% { opacity: 0; }
          59.38% { opacity: 1; }
          61.46% { opacity: 1; }
          62.5% { opacity: 0; }
          66.67% { opacity: 0; }
          67.71% { opacity: 1; }
          69.79% { opacity: 1; }
          70.83% { opacity: 0; }
          75% { opacity: 0; }
          76.04% { opacity: 1; }
          78.13% { opacity: 1; }
          79.17% { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* 默认背景：lightoff */}
      <div className="absolute inset-0">
        <img
          src="/images/welcome/welcom-light-off.webp"
          alt="Welcome"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 叠加层：lighton，通过不透明度闪烁（仅营业期间显示） */}
      {(isOpen || now < UNLOCK_TIME) && (
        <div
          className="absolute inset-0"
          style={getLightOnStyle()}
        >
          <img
            src="/images/welcome/welcome-light-on.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 漂浮光点效果 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-memory-glow/40 floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--tx': `${(Math.random() - 0.5) * 60}px`,
              '--ty': `${(Math.random() - 0.5) * 60}px`,
              '--delay': `${Math.random() * 24}s`,
            }}
          />
        ))}
      </div>

      {/* 营业时间提示文字 */}
      {phase === 'idle' && businessMessage && (
        <div
          className="absolute left-[50%] top-[85%] -translate-x-1/2 text-center"
          style={{ opacity: 0, animation: 'fadeIn 1s ease-in 1s forwards' }}
        >
          <p className="text-white/80 font-medium text-lg md:text-xl drop-shadow-lg">
            {businessMessage}
          </p>
        </div>
      )}

      {/* 关门状态：显示Closed按钮，不可点击 */}
      {phase === 'idle' && isTimeUnlocked && !isOpen && !showButton && (
        <div
          className="absolute left-[50%] top-[80%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ opacity: 0, animation: 'fadeIn 1s ease-in forwards' }}
        >
          <img
            src="/images/welcome/推门.webp"
            alt="Closed"
            className="w-[120px] h-auto object-contain opacity-70 grayscale"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white/60 font-bold text-lg">
            Closed
          </span>
        </div>
      )}

      {/* 营业状态 / 后门激活：显示Enter按钮，可点击 */}
      {phase === 'idle' && isTimeUnlocked && (isOpen || showButton) && buttonVisible && (
        <button
          className="absolute left-[50%] top-[80%] -translate-x-1/2 -translate-y-1/2 hover:scale-105 active:scale-95 transition-all duration-1000"
          style={{ opacity: 0, animation: 'fadeIn 1s ease-in forwards' }}
          onClick={handleStart}
        >
          <img
            src="/images/welcome/推门.webp"
            alt="Enter"
            className="w-[120px] h-auto object-contain"
          />
          <span className="absolute inset-0 flex items-center justify-center text-memory-accent font-bold text-lg">
            Enter
          </span>
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
