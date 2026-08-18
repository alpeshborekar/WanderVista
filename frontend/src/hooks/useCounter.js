import { useState, useEffect } from 'react';
export function useCounter(target, duration = 2000, isActive = false, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(parseFloat(start.toFixed(decimals))); }
    }, 16);
    return () => clearInterval(timer);
  }, [isActive, target, duration, decimals]);
  return count;
}
