import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = process.env.SERVER_URL || 'http://43.129.250.140';
const STORE_PATH = path.join(__dirname, '../backend/data/store.json');

const fetchStore = async () => {
  console.log(`\n正在从服务器 ${SERVER_URL} 获取 store.json...`);
  
  try {
    const response = await fetch(`${SERVER_URL}/api/export`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const jsonContent = JSON.stringify(data, null, 2);
    
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(STORE_PATH, jsonContent, 'utf-8');
    
    console.log('✅ 成功！已保存到:', STORE_PATH);
    console.log('\n数据概览:');
    console.log(`  - 商品数量: ${data.products?.length || 0}`);
    console.log(`  - 冷却记录: ${Object.keys(data.cooldowns || {}).length}`);
    
    if (data.products) {
      const lights = data.products.reduce((acc, p) => {
        acc[p.id] = p.light || 0;
        return acc;
      }, {});
      console.log(`  - 灯光数据: ${JSON.stringify(lights)}`);
    }
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    process.exit(1);
  }
};

fetchStore();
