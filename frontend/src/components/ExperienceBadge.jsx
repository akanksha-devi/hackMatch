import React from 'react';
import { StatusBadge } from './StatusBadge';

/**
 * ExperienceBadge - Specialized canonical badge for developer experience levels.
 * Composes canonical StatusBadge with semantic experience tokens.
 *
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} level - Developer experience level
 * @param {'sm' | 'md' | 'lg'} size - Badge size (sm: 20px, md/lg: 24px)
 * @param {boolean} showIcon - Whether to render experience tier icon (default: true)
 */
export const ExperienceBadge = ({
  level = 'Beginner',
  status,
  size = 'sm',
  showIcon = true,
  className = '',
  ...props
}) => {
  const normLevel = level || status || 'Beginner';
  const resolvedSize = (size === 'md' || size === 'lg') ? 'md' : 'sm';

  return (
    <StatusBadge
      status={normLevel}
      type="experience"
      size={resolvedSize}
      showIcon={showIcon}
      className={className}
      {...props}
    />
  );
};

export default ExperienceBadge;
