import { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

export default function CountUp({ end, duration = 1000, suffix = '' }: CountUpProps) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{current.toLocaleString()}{suffix}</>;
}
