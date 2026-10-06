import React, { useState } from 'react';

/**
 * SpatialTooltip - Floating micro glass tooltip with backdrop blur.
 */
export const SpatialTooltip = ({
  content,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute ${positionStyles} z-30 px-2.5 py-1 text-xs font-medium rounded-lg liquid-glass-floating text-white light:text-slate-900 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default SpatialTooltip;
