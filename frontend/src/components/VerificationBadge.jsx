import React from 'react';
import { StatusBadge } from './StatusBadge';

/**
 * VerificationBadge - Composes canonical StatusBadge for verification states.
 * Preserves backwards-compatible API ({ status, size, className }).
 */
export const VerificationBadge = ({ status, size = 'sm', className = '', ...props }) => {
  const normStatus = status || 'Unverified';
  const resolvedSize = (size === 'md' || size === 'lg') ? 'md' : 'sm';
  return (
    <StatusBadge
      status={normStatus}
      type="verification"
      size={resolvedSize}
      className={className}
      {...props}
    />
  );
};

export default VerificationBadge;
