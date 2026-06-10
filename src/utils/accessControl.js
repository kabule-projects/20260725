import { calculateThreshold } from './brightness';

// 阶段划分配置
export const PHASES = [
  { id: 'phase1', years: [2014], unlockDate: null },
  { id: 'phase2', years: [2015, 2016], unlockDate: null },
  { id: 'phase3', years: [2017, 2018], unlockDate: null },
  { id: 'phase4', years: [2019, 2020], unlockDate: null },
  { id: 'phase5', years: [2021, 2022], unlockDate: null },
  { id: 'phase6', years: [2023, 2024], unlockDate: null },
  { id: 'phase7', years: [2025, 2026], unlockDate: null },
];

// 基础开放日期（北京时间2026年7月18日零点）
// 留空则不启用日期解锁机制（用于测试）
export const BASE_UNLOCK_DATE = null; // '2026-07-18T00:00:00+08:00';

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
  
  // 第一个阶段默认解锁
  if (currentPhaseIndex === 0) return true;
  
  // 检查所有前置阶段的商品是否都已解锁
  for (let i = 0; i < currentPhaseIndex; i++) {
    const prevPhase = PHASES[i];
    const isPrevPhaseUnlocked = prevPhase.years.every(year => {
      const product = products.find(p => p.year === year);
      if (!product) return false;
      
      const light = lights[product.id] || 0;
      const threshold = calculateThreshold(product.year);
      return light >= threshold;
    });
    
    if (!isPrevPhaseUnlocked) return false;
  }
  
  return true;
};

// 判断商品访问状态：'locked' | 'accessible' | 'unlocked'
export const getProductAccessStatus = (product, lights, products) => {
  const phase = getProductPhase(product.year);
  if (!phase) return 'locked';
  
  // 检查日期解锁（仅当开放日期已定义时）
  if (BASE_UNLOCK_DATE && isPhaseUnlockedByDate(phase.id)) {
    // 检查是否已完全解锁
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    return light >= threshold ? 'unlocked' : 'accessible';
  }
  
  // 检查进度解锁
  if (isPhaseUnlockedByProgress(phase.id, lights, products)) {
    const light = lights[product.id] || 0;
    const threshold = calculateThreshold(product.year);
    return light >= threshold ? 'unlocked' : 'accessible';
  }
  
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