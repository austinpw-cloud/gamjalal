import { useState, useEffect } from 'react';

interface StatBarProps {
  label: string;
  value: number; // 0-100
  color: string;
}

export default function StatBar({ label, value, color }: StatBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="stat-bar">
        <div
          className="stat-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
