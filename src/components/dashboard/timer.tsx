"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  className?: string;
}

export function Timer({ duration, onComplete, className }: TimerProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      onComplete();
      setKey((prevKey) => prevKey + 1);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        'absolute top-4 right-4 h-10 w-10 z-50',
        className
      )}
    >
      <svg
        className="transform -rotate-90"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          key={key}
          cx="50"
          cy="50"
          r="45"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-timer"
          style={{ animationDuration: `${duration}ms` }}
        />
      </svg>
       <style jsx>{`
        @keyframes countdown {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 283;
          }
        }
        .animate-timer {
          animation-name: countdown;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
