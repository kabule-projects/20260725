import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Product from './pages/Product';
import WelcomePage from './pages/WelcomePage';
import { fetchAllLights } from './services/api';
import { usePolling } from './hooks/usePolling';

const VERSION = 11;
const VERSION_KEY = 'memoryStore:version';
const WELCOME_KEY = 'memoryStore:welcomeDate';

function clearOldData() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('memoryStore:'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem(VERSION_KEY, VERSION.toString());
}

function checkVersion() {
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored === null || parseInt(stored) < VERSION) {
    clearOldData();
  }
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/product/')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  return null;
}

const shouldShowWelcome = () => {
  const today = getTodayDate();
  const lastWelcome = localStorage.getItem(WELCOME_KEY);
  return lastWelcome !== today;
};

function App() {
  const [lights, setLights] = useState({});
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome());
  const navigate = useNavigate();

  useEffect(() => {
    checkVersion();
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const LAST_REFRESH_KEY = 'memoryStore:lastRefreshDate';
    
    const getTodayDate = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const today = getTodayDate();
    const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);

    if (lastRefresh !== today) {
      localStorage.setItem(LAST_REFRESH_KEY, today);
      window.location.reload();
      return;
    }

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    const timer = setTimeout(() => {
      localStorage.setItem(LAST_REFRESH_KEY, getTodayDate());
      window.location.reload();
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const updateLights = async () => {
    try {
      const data = await fetchAllLights();
      setLights(data);
    } catch (error) {
      console.error('Failed to fetch lights:', error);
    }
  };

  usePolling(updateLights, 20000);

  useEffect(() => {
    updateLights();
  }, []);

  const handleStart = () => {
    localStorage.setItem(WELCOME_KEY, getTodayDate());
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-memory-glow/30 floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--tx': `${(Math.random() - 0.5) * 100}px`,
              '--ty': `${(Math.random() - 0.5) * 100}px`,
              '--delay': `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <ScrollToTop />
      <Routes>
          <Route path="/" element={<Home lights={lights} />} />
          <Route path="/product/:id" element={<Product lights={lights} setLights={setLights} />} />
        </Routes>
      </div>

      {showWelcome && (
        <WelcomePage onStart={handleStart} />
      )}
    </div>
  );
}

export default App;