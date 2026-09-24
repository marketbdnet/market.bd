/// <reference types="vite/client" />

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module 'react-pull-to-refresh' {
  import * as React from 'react';
  export interface ReactPullToRefreshProps {
    onRefresh: () => Promise<any> | void;
    icon?: React.ReactNode;
    loading?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    distanceToRefresh?: number;
    resistance?: number;
    hammerOptions?: Record<string, any>;
    children?: React.ReactNode;
  }
  const ReactPullToRefresh: React.ComponentType<ReactPullToRefreshProps>;
  export default ReactPullToRefresh;
}
