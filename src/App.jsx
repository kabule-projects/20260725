import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Product from './pages/Product';
import Staffing from './pages/Staffing';
import WelcomePage from './pages/WelcomePage';
import { fetchAllLights } from './services/api';
import { usePolling } from './hooks/usePolling';

const VERSION = 12;
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

    const now = new Date();
    const nextRefresh = new Date(now);
    nextRefresh.setHours(7, 25, 0, 0);
    if (nextRefresh <= now) {
      nextRefresh.setDate(nextRefresh.getDate() + 1);
    }
    const msUntilNextRefresh = nextRefresh - now;

    const timer = setTimeout(() => {
      localStorage.setItem(LAST_REFRESH_KEY, getTodayDate());
      window.location.reload();
    }, msUntilNextRefresh);

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

  // 后门：按 W 键回到 welcome page
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'w' || e.key === 'W') {
        setShowWelcome(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <ScrollToTop />
      <Routes>
          <Route path="/" element={<Home lights={lights} />} />
          <Route path="/product/:id" element={<Product lights={lights} setLights={setLights} />} />
          <Route path="/staffing" element={<Staffing />} />
        </Routes>
      </div>

      {showWelcome && (
        <WelcomePage onStart={handleStart} />
      )}
    </div>
  );
};

export default App;