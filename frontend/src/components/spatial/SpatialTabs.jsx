import React, { useRef } from 'react';
import { RADIUS, MOTION, FOCUS } from '../../design-system/tokens';

/**
 * SpatialTabs - Canonical segmented tab bar and pill navigation container.
 * Fully WAI-ARIA compliant tablist with keyboard arrow navigation, roving tabindex,
 * count/badge normalization, and responsive horizontal overflow handling.
 */
export const SpatialTabs = React.forwardRef(({
  tabs = [],
  activeTab,
  onChange,
  variant = 'segmented', // 'segmented' | 'pill' | 'underline'
  size = 'sm',           // 'sm' | 'md'
  className = '',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const tabRefs = useRef([]);

  const containerClasses = {
    segmented: `p-1 inline-flex items-center gap-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md backdrop-saturate-140 border border-slate-200/80 dark:border-white/10 shadow-sm ${RADIUS.control} overflow-x-auto max-w-full scrollbar-none`,
    pill: 'inline-flex items-center gap-2 flex-wrap overflow-x-auto max-w-full scrollbar-none',
    underline: 'inline-flex items-center gap-6 border-b border-slate-200 dark:border-white/10 overflow-x-auto max-w-full scrollbar-none',
  }[variant] || '';


  const itemSizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[30px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[36px] gap-2',
  }[size] || 'text-xs px-3 py-1.5 min-h-[30px] gap-1.5';

  const handleKeyDown = (e, currentIndex) => {
    const enabledTabs = tabs
      .map((tab, idx) => ({ ...tab, originalIndex: idx }))
      .filter((tab) => !tab.disabled);

    if (enabledTabs.length === 0) return;

    const currentEnabledIndex = enabledTabs.findIndex(
      (t) => t.originalIndex === currentIndex
    );

    let nextIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentEnabledIndex + 1) % enabledTabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex >= 0 && nextIndex < enabledTabs.length) {
      const targetTab = enabledTabs[nextIndex];
      const targetElement = tabRefs.current[targetTab.originalIndex];
      if (targetElement) {
        targetElement.focus();
      }
      if (onChange) {
        onChange(targetTab.id);
      }
    }
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      className={`${containerClasses} ${className}`}
      {...props}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const isDisabled = Boolean(tab.disabled);
        const count = tab.count !== undefined ? tab.count : tab.badge;
        const showCount = count !== undefined && count !== null;

        let activeStyles = '';
        if (variant === 'segmented') {
          activeStyles = isActive
            ? 'bg-white dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-bold'
            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium';
        } else if (variant === 'pill') {
          activeStyles = isActive
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] font-bold'
            : 'bg-white/70 dark:bg-slate-900/50 backdrop-blur-md backdrop-saturate-125 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-slate-400 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800/60 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-medium';
        } else if (variant === 'underline') {

          activeStyles = isActive
            ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold pb-2'
            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium pb-2 border-b-2 border-transparent';
        }

        const badgeActiveStyles = {
          segmented: isActive
            ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-200/80 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
          pill: isActive
            ? 'bg-white/25 text-white'
            : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
          underline: isActive
            ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
        }[variant] || '';

        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            type="button"
            id={tab.tabId || `tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={tab.panelId || `panel-${tab.id}`}
            aria-disabled={isDisabled || undefined}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`inline-flex items-center justify-center shrink-0 whitespace-nowrap ${RADIUS.control} transition-all ${MOTION.duration.micro} ease-out select-none cursor-pointer ${FOCUS.ring} ${MOTION.activePress} ${MOTION.reducedMotion} disabled:opacity-40 disabled:cursor-not-allowed ${itemSizeClasses} ${activeStyles}`}
          >
            {Icon && <Icon className={`${size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} aria-hidden="true" />}
            <span>{tab.label}</span>
            {showCount && (
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeActiveStyles}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

SpatialTabs.displayName = 'SpatialTabs';

export default SpatialTabs;
