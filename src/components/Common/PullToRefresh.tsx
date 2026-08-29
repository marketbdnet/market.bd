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
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled || refreshingRef.current || event.touches.length !== 1) return;

    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (scrollTop <= 0) {
      startY.current = event.touches[0].clientY;
      pullingRef.current = false;
    } else {
      startY.current = null;
      pullingRef.current = false;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (
      disabled ||
      refreshingRef.current ||
      startY.current === null ||
      event.touches.length !== 1
    ) {
      return;
    }

    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (scrollTop > 0) {
      startY.current = null;
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const deltaY = event.touches[0].clientY - startY.current;

    if (deltaY <= 0) {
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }

    if (deltaY > 8) {
      pullingRef.current = true;

      const distance = Math.min(
        deltaY * 0.55,
        pullDownThreshold * 1.25
      );

      setPullDistance(distance);

      if (event.cancelable) {
        event.preventDefault();
      }
    }
  }, [disabled, pullDownThreshold]);

  const handleTouchEnd = useCallback(async () => {
    const distance = pullDistance;
    const wasPulling = pullingRef.current;

    startY.current = null;
    pullingRef.current = false;
    setPullDistance(0);

    if (
      disabled ||
      refreshingRef.current ||
      !wasPulling ||
      distance < pullDownThreshold
    ) {
      return;
    }

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

  const handleTouchCancel = useCallback(() => {
    startY.current = null;
    pullingRef.current = false;
    setPullDistance(0);
  }, []);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        minHeight: '100%',
        width: '100%',
        touchAction: 'pan-y',
        overscrollBehaviorY: 'auto',
        transform:
          pullDistance > 0
            ? `translateY(${Math.min(pullDistance * 0.35, 30)}px)`
            : undefined,
        transition:
          pullDistance === 0
            ? 'transform 180ms ease-out'
            : undefined,
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
            opacity: Math.min(
              pullDistance / pullDownThreshold,
              1
            ),
            pointerEvents: 'none',
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
