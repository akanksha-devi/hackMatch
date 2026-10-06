import React from 'react';
import { SkillChip, CATEGORY_COLORS } from './SkillChip';

export { CATEGORY_COLORS };

/**
 * SkillTag - Backwards-compatible wrapper delegating to canonical SkillChip.
 * Preserves the existing API ({ name, size, onRemove, isHighlight }) while guaranteeing
 * unified visual system and zero light-mode ring leaks.
 */
export const SkillTag = ({ name, size = 'md', onRemove = null, isHighlight = false, className = '' }) => {
  return (
    <SkillChip
      name={name}
      size={size}
      variant={isHighlight ? 'required' : onRemove ? 'removable' : 'default'}
      onRemove={onRemove}
      className={className}
    />
  );
};

export default SkillTag;
