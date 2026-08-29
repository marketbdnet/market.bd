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

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || refreshingRef.current) return;

      // Pull-to-refresh only starts when the page is actually at the top.
      if (window.scrollY <= 0 && event.touches.length === 1) {
        startY.current = event.touches[0].clientY;
        pullingRef.current = false;
      } else {
        startY.current = null;
        pullingRef.current = false;
      }
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (
        disabled ||
        refreshingRef.current ||
        startY.current === null ||
        event.touches.length !== 1
      ) {
        return;
      }

      // If the user has started scrolling normally, completely release
      // the pull-to-refresh gesture and let the browser/WebView scroll.
      if (window.scrollY > 0) {
        startY.current = null;
        pullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Upward movement is normal page scrolling.
      if (deltaY <= 0) {
        pullingRef.current = false;
        setPullDistance(0);
        return;
      }

      // Only activate pull-to-refresh after a small downward gesture.
      if (deltaY > 5) {
        pullingRef.current = true;

        const distance = Math.min(
          deltaY,
          pullDownThreshold * 1.5
        );

        setPullDistance(distance);

        // Prevent browser overscroll ONLY while the actual pull gesture
        // is active. Normal scrolling is never prevented.
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    },
    [disabled, pullDownThreshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || refreshingRef.current) {
      startY.current = null;
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const distance = pullDistance;
    const wasPulling = pullingRef.current;

    startY.current = null;
    pullingRef.current = false;
    setPullDistance(0);

    if (!wasPulling || distance < pullDownThreshold) {
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
