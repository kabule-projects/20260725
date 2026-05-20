import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Product from './pages/Product';
import { fetchAllLights } from './services/api';
import { usePolling } from './hooks/usePolling';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function App() {
  const [lights, setLights] = useState({});

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
    </div>
  );
}

export default App;