import React, { useCallback, useRef, useState } from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<any> | void;
  pullDownThreshold?: number;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullDownThreshold = 80,
  disabled = false,
}) => {
  const startY = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled || refreshingRef.current) return;

    if (window.scrollY <= 0) {
      startY.current = event.touches[0]?.clientY ?? null;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (
      disabled ||
      refreshingRef.current ||
      startY.current === null ||
      window.scrollY > 0
    ) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? startY.current;
    const distance = Math.max(0, Math.min(currentY - startY.current, pullDownThreshold * 1.5));

    if (distance > 0) {
      setPullDistance(distance);
    }
  }, [disabled, pullDownThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || refreshingRef.current) {
      startY.current = null;
      setPullDistance(0);
      return;
    }

    const distance = pullDistance;
    startY.current = null;
    setPullDistance(0);

    if (distance < pullDownThreshold) return;

    refreshingRef.current = true;
    setIsRefreshing(true);

    try {
      await onRefresh();
    } catch (error) {
      console.warn('Pull-to-refresh error:', error);
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [disabled, onRefresh, pullDistance, pullDownThreshold]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100%',
        transform: pullDistance > 0
          ? `translateY(${Math.min(pullDistance * 0.35, 30)}px)`
          : undefined,
        transition: pullDistance === 0 ? 'transform 180ms ease-out' : undefined,
      }}
    >
      {pullDistance > 0 && (
        <div
          aria-hidden="true"
          style={{
            height: Math.min(pullDistance * 0.5, 40),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: 12,
            opacity: Math.min(pullDistance / pullDownThreshold, 1),
          }}
        >
          {isRefreshing
            ? 'Refreshing…'
            : pullDistance >= pullDownThreshold
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </div>
      )}

      {children}
    </div>
  );
};

export default PullToRefresh;
