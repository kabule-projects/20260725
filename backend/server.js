import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = join(__dirname, 'data', 'store.json');

const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { products: [], cooldowns: {} };
  }
};

const writeData = (data) => {
  const dir = join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip ||
         'unknown';
};

const isOnCooldown = (productId, ip) => {
  cleanExpiredCooldowns();
  const data = readData();
  const key = `${productId}:${ip}`;
  const cooldown = data.cooldowns[key];

  if (!cooldown) return false;

  const elapsed = Date.now() - cooldown.timestamp;
  return elapsed < 60 * 1000; // return elapsed < 10 * 60 * 1000;
};

const getRemainingCooldown = (productId, ip) => {
  cleanExpiredCooldowns();
  const data = readData();
  const key = `${productId}:${ip}`;
  const cooldown = data.cooldowns[key];

  if (!cooldown) return 0;

  const elapsed = Date.now() - cooldown.timestamp;
  const remaining = Math.max(0, 30 * 1000 - elapsed); // const remaining = Math.max(0, 10 * 60 * 1000 - elapsed);
  return Math.ceil(remaining / 1000);
};

const setCooldown = (productId, ip) => {
  cleanExpiredCooldowns();
  const data = readData();
  const key = `${productId}:${ip}`;
  data.cooldowns[key] = { timestamp: Date.now() };
  writeData(data);
};

const cleanExpiredCooldowns = () => {
  const data = readData();
  const now = Date.now();
  const expireTime = 30 * 1000;
  let changed = false;

  for (const key in data.cooldowns) {
    if (data.cooldowns[key].timestamp) {
      if (now - data.cooldowns[key].timestamp > expireTime) {
        delete data.cooldowns[key];
        changed = true;
      }
    }
  }

  if (changed) {
    writeData(data);
  }
};

app.get('/api/products', (req, res) => {
  try {
    const data = readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const data = readData();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read product' });
  }
});

app.get('/api/products/:id/cooldown', (req, res) => {
  try {
    const productId = req.params.id;
    const clientIP = getClientIP(req);
    const remaining = getRemainingCooldown(productId, clientIP);
    res.json({ remaining });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cooldown status' });
  }
});

app.get('/api/products/:id/light', (req, res) => {
  try {
    const data = readData();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ light: product.light || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read light count' });
  }
});

app.post('/api/products/:id/light', (req, res) => {
  try {
    const productId = req.params.id;
    const clientIP = getClientIP(req);

    if (isOnCooldown(productId, clientIP)) {
      const remaining = 30 * 1000 - (Date.now() - readData().cooldowns[`${productId}:${clientIP}`].timestamp); // const remaining = 10 * 60 * 1000 - (Date.now() - readData().cooldowns[`${productId}:${clientIP}`].timestamp);
      return res.status(429).json({
        error: 'Cooldown active',
        remaining: Math.ceil(remaining / 1000)
      });
    }

    const data = readData();
    const productIndex = data.products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    data.products[productIndex].light = (data.products[productIndex].light || 0) + 1;
    writeData(data);

    setCooldown(productId, clientIP);

    res.json({
      success: true,
      light: data.products[productIndex].light
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to contribute light' });
  }
});

app.get('/api/all-lights', (req, res) => {
  try {
    const data = readData();
    const lights = {};
    data.products.forEach(p => {
      lights[p.id] = p.light || 0;
    });
    res.json(lights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read lights' });
  }
});

app.get('/api/export', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.listen(PORT, () => {
  console.log(`Memory Store backend running on port ${PORT}`);
  setInterval(cleanExpiredCooldowns, 10 * 60 * 1000);
});