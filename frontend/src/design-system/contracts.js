/**
 * HackMatch Design System - Canonical Component API Contracts
 * Defines standard prop schemas, variants, and behavior rules for all shared primitives.
 */

/**
 * Button Contract
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant='primary']
 * @property {'sm' | 'md' | 'lg'} [size='md']
 * @property {boolean} [loading=false] - Shows loading spinner, disables interaction
 * @property {boolean} [disabled=false] - Disables interaction and lowers opacity
 * @property {React.ComponentType} [icon=null] - Lucide icon component
 * @property {'left' | 'right'} [iconPosition='left']
 * @property {string} [className='']
 * @property {React.ReactNode} children
 */
export const ButtonContract = {
  variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
  sizes: ['sm', 'md', 'lg'],
  defaultProps: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    iconPosition: 'left',
  },
};

/**
 * IconButton Contract
 * @typedef {Object} IconButtonProps
 * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant='ghost']
 * @property {'sm' | 'md' | 'lg'} [size='md']
 * @property {React.ComponentType} icon - Required Lucide icon
 * @property {string} [tooltip] - Optional tooltip text
 * @property {boolean} [disabled=false]
 * @property {string} ariaLabel - Required accessible label
 */
export const IconButtonContract = {
  variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
  sizes: ['sm', 'md', 'lg'],
  defaultProps: {
    variant: 'ghost',
    size: 'md',
    disabled: false,
  },
};

/**
 * SkillChip Contract
 * Universal component for all skills, tags, tech stacks, and selection chips.
 * @typedef {Object} SkillChipProps
 * @property {string} name - Skill or tech name (determines category color)
 * @property {'default' | 'required' | 'matched' | 'selected' | 'interactive' | 'removable'} [variant='default']
 * @property {'sm' | 'md' | 'lg'} [size='md']
 * @property {boolean} [selected=false] - Active toggle state for 'interactive'
 * @property {boolean} [disabled=false]
 * @property {function(string): void} [onToggle] - Callback for 'interactive' variant
 * @property {function(string): void} [onRemove] - Callback for 'removable' variant
 * @property {string} [className='']
 */
export const SkillChipContract = {
  variants: ['default', 'required', 'matched', 'selected', 'interactive', 'removable'],
  sizes: ['sm', 'md', 'lg'],
  defaultProps: {
    variant: 'default',
    size: 'md',
    selected: false,
    disabled: false,
  },
};

/**
 * StatusBadge Contract
 * Unified badge for verification, request status, hackathon status, and experience level.
 * @typedef {Object} StatusBadgeProps
 * @property {string} status - Raw status string (e.g. 'Verified', 'Open', 'Advanced', 'Active')
 * @property {'status' | 'verification' | 'experience' | 'mode' | 'source'} [type='status']
 * @property {'sm' | 'md'} [size='sm']
 * @property {string} [label] - Optional custom label override
 * @property {React.ComponentType} [icon] - Optional custom icon override
 * @property {string} [className='']
 */
export const StatusBadgeContract = {
  types: ['status', 'verification', 'experience', 'mode', 'source'],
  sizes: ['sm', 'md'],
  defaultProps: {
    type: 'status',
    size: 'sm',
  },
};

/**
 * SpatialInput Contract
 * Form text input with unified theme awareness and accessible focus states.
 * @typedef {Object} SpatialInputProps
 * @property {'sm' | 'md' | 'lg'} [size='md']
 * @property {string | boolean} [error] - Error message or boolean flag
 * @property {boolean} [disabled=false]
 * @property {React.ComponentType} [icon] - Leading icon
 * @property {React.ComponentType} [actionIcon] - Trailing action icon
 * @property {function} [onAction] - Trailing action callback
 * @property {string} [className='']
 */
export const SpatialInputContract = {
  sizes: ['sm', 'md', 'lg'],
  defaultProps: {
    size: 'md',
    disabled: false,
  },
};

/**
 * SpatialCard Contract
 * Translucent glass container for user cards, team requests, and hackathons.
 * @typedef {Object} SpatialCardProps
 * @property {'glass' | 'panel' | 'flat'} [variant='glass']
 * @property {'flat' | 'raised' | 'floating'} [elevation='raised']
 * @property {boolean} [hover=true] - Enables smooth hover elevation
 * @property {boolean} [accentLine=false] - Decorative top gradient line
 * @property {string} [className='']
 */
export const SpatialCardContract = {
  variants: ['glass', 'panel', 'flat'],
  elevations: ['flat', 'raised', 'floating'],
  defaultProps: {
    variant: 'glass',
    elevation: 'raised',
    hover: true,
    accentLine: false,
  },
};

/**
 * FilterChip / Tabs Contract
 * Unified segmented tab and filter pill controls.
 * @typedef {Object} TabsProps
 * @property {Array<{ id: string, label: string, icon?: React.ComponentType, count?: number }>} tabs
 * @property {string} activeTab
 * @property {function(string): void} onChange
 * @property {'pill' | 'tab'} [variant='pill']
 * @property {'sm' | 'md'} [size='sm']
 */
export const TabsContract = {
  variants: ['pill', 'tab'],
  sizes: ['sm', 'md'],
  defaultProps: {
    variant: 'pill',
    size: 'sm',
  },
};

/**
 * Avatar Contract
 * Image avatar with fallback monogram and status indicators.
 * @typedef {Object} AvatarProps
 * @property {string} [src] - Image source URL
 * @property {string} [name='User'] - User name for fallback monogram and alt text
 * @property {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} [size='md']
 * @property {boolean} [ring=true] - Shows subtle theme-aware ring
 * @property {boolean} [verified=false] - Shows verification badge dot
 * @property {string} [className='']
 */
export const AvatarContract = {
  sizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  defaultProps: {
    size: 'md',
    ring: true,
    verified: false,
  },
};

export default {
  ButtonContract,
  IconButtonContract,
  SkillChipContract,
  StatusBadgeContract,
  SpatialInputContract,
  SpatialCardContract,
  TabsContract,
  AvatarContract,
};
