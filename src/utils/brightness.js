export const calculateBrightness = (light, locked = false) => {
  if (locked) return 0.3;

  const minLight = 0;
  const maxLight = 500;
  const minBrightness = 0.4;
  const maxBrightness = 1.0;

  const clampedLight = Math.min(Math.max(light, minLight), maxLight);
  const normalized = (clampedLight - minLight) / (maxLight - minLight);

  return minBrightness + (maxBrightness - minBrightness) * normalized;
};

export const getBrightnessClass = (brightness) => {
  if (brightness >= 0.9) return 'brightness-[1.0]';
  if (brightness >= 0.7) return 'brightness-[0.85]';
  if (brightness >= 0.5) return 'brightness-[0.7]';
  if (brightness >= 0.4) return 'brightness-[0.55]';
  return 'brightness-[0.4]';
};

export const formatCooldown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateThreshold = (year) => {
  const currentYear = 2026;
  const earliestYear = 2014;
  const minThreshold = 10;
  const maxThreshold = 20;
  
  const yearDifference = currentYear - year;
  const maxDifference = currentYear - earliestYear;
  
  if (yearDifference <= 0) return minThreshold;
  
  const ratio = yearDifference / maxDifference;
  const threshold = minThreshold + (maxThreshold - minThreshold) * ratio;
  
  return Math.round(threshold);
};

export const is2026Unlocked = (lights, products) => {
  const totalLight = products.reduce((total, product) => {
    return total + (lights[product.id] || 0);
  }, 0);
  
  return totalLight >= 725;
};