import { calculateThreshold } from './brightness';

const BYPASS_DATE_LOCK_KEY = 'memoryStore:bypassDateLock';

export const getBypassDateLock = () => {
  return localStorage.getItem(BYPASS_DATE_LOCK_KEY) === 'true';
};

export const setBypassDateLock = (value) => {
  localStorage.setItem(BYPASS_DATE_LOCK_KEY, value ? 'true' : 'false');
};

// 阶段划分配置
export const PHASES = [
  { id: 'phase1', years: [2014], unlockDate: '2026-07-17T19:25:00+08:00' },
  { id: 'phase2', years: [2015, 2016], unlockDate: '2026-07-18T07:25:00+08:00' },
  { id: 'phase3', years: [2017, 2018], unlockDate: '2026-07-19T07:25:00+08:00' },
  { id: 'phase4', years: [2019, 2020], unlockDate: '2026-07-20T07:25:00+08:00' },
  { id: 'phase5', years: [2021, 2022], unlockDate: '2026-07-21T07:25:00+08:00' },
  { id: 'phase6', years: [2023, 2024], unlockDate: '2026-07-22T07:25:00+08:00' },
  { id: 'phase7', years: [2025, 2026], unlockDate: '2026-07-23T07:25:00+08:00' },
];

export const BASE_UNLOCK_DATE = '2026-07-17T19:25:00+08:00';

// 获取商品所在阶段
export const getProductPhase = (year) => {
  return PHASES.find(phase => phase.years.includes(year));
};

// 获取阶段索引
export const getPhaseIndex = (phaseId) => {
  return PHASES.findIndex(p => p.id === phaseId);
};

// 检查阶段是否通过日期开放（仅当开放日期已定义时生效）
export const isPhaseUnlockedByDate = (phaseId) => {
  if (getBypassDateLock()) return true;
  
  if (!BASE_UNLOCK_DATE) return false;
  
  const phaseIndex = getPhaseIndex(phaseId);
  const unlockDate = new Date(BASE_UNLOCK_DATE);
  unlockDate.setDate(unlockDate.getDate() + phaseIndex);
  
  const now = new Date();
  return now >= unlockDate;
};

// 检查阶段是否通过前置阶段解锁
export const isPhaseUnlockedByProgress = (phaseId, lights, products) => {
  const currentPhaseIndex = getPhaseIndex(phaseId);
  
  // 第一个阶段默认解锁（2014默认accessible）
  if (currentPhaseIndex === 0) return true;
  
  // 检查所有前置阶段的商品是否都已解锁或可访问
  for (let i = 0; i < currentPhaseIndex; i++) {
    const prevPhase = PHASES[i];
    const isPrevPhaseAccessible = prevPhase.years.every(year => {
      const product = products.find(p => p.year === year);
      if (!product) return false;
      
      // 2014年特殊处理：直接视为可访问
      if (year === 2014) return true;
      
      const light = lights[product.id] || 0;
      const threshold = calculateThreshold(product.year);
      return light >= threshold;
    });
    
    if (!isPrevPhaseAccessible) return false;
  }
  
  return true;
};

// 计算所有年份的 light 值总和
export const calculateTotalLight = (lights, products) => {
  return products.reduce((total, product) => {
    return total + (lights[product.id] || 0);
  }, 0);
};

// 计算2014年的进度：剩余商品的解锁进度
export const calculate2014Progress = (lights, products) => {
  const otherProducts = products.filter(p => p.year !== 2014);
  if (otherProducts.length === 0) return 0;
  
  const unlockedCount = otherProducts.filter(product => {
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    return light >= threshold;
  }).length;
  
  return (unlockedCount / otherProducts.length) * 100;
};

// 判断2014是否已解锁（所有剩余商品都已解锁）
export const is2014Unlocked = (lights, products) => {
  const otherProducts = products.filter(p => p.year !== 2014);
  return otherProducts.every(product => {
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    return light >= threshold;
  });
};

// 2026 解锁阈值：所有年份 light 值总和
const YEAR_2026_TOTAL_THRESHOLD = 72500;

// 判断商品访问状态：'locked' | 'accessible' | 'unlocked'
export const getProductAccessStatus = (product, lights, products) => {
  const phase = getProductPhase(product.year);
  if (!phase) return 'locked';
  
  // 2014 特殊处理：默认 accessible，解锁条件为所有其他商品都已解锁
  if (product.year === 2014) {
    return is2014Unlocked(lights, products) ? 'unlocked' : 'accessible';
  }
  
  // 2026 特殊处理
  if (product.year === 2026) {
    // 检查是否可以访问（进入 phase 7）
    const isPhase7Accessible = BASE_UNLOCK_DATE 
      ? isPhaseUnlockedByDate(phase.id)
      : isPhaseUnlockedByProgress(phase.id, lights, products);
    
    if (!isPhase7Accessible) {
      return 'locked';
    }
    
    // 检查是否已解锁（所有年份 light 值总和达到 725）
    const totalLight = calculateTotalLight(lights, products);
    return totalLight >= YEAR_2026_TOTAL_THRESHOLD ? 'unlocked' : 'accessible';
  }
  
  // 2015-2025：必须先日期解锁才能进入 accessible/unlocked 状态
  // 检查日期解锁（仅当开放日期已定义时）
  if (BASE_UNLOCK_DATE && isPhaseUnlockedByDate(phase.id)) {
    // 检查是否已完全解锁
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    return light >= threshold ? 'unlocked' : 'accessible';
  }
  
  // 日期未解锁，保持锁定状态
  return 'locked';
};

// 判断商品是否可访问（可进入商品页）
export const isProductAccessible = (product, lights, products) => {
  const status = getProductAccessStatus(product, lights, products);
  return status !== 'locked';
};

// 判断商品是否已解锁（显示所有资源）
export const isProductUnlocked = (product, lights, products) => {
  const status = getProductAccessStatus(product, lights, products);
  return status === 'unlocked';
};