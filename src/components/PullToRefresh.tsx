'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart === 0 || isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStart;

    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setTouchStart(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, pullDistance, isRefreshing]);

  const rotation = (pullDistance / threshold) * 360;
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
        style={{
          height: `${pullDistance}px`,
          opacity,
        }}
      >
        <RefreshCw
          className="w-6 h-6 text-primary"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
