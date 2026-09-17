import React from 'react';

const CATEGORY_COLORS = {
  // Frontend
  React: 'badge-indigo',
  TypeScript: 'badge-indigo',
  TailwindCSS: 'badge-cyan',
  'Next.js': 'badge-indigo',
  Frontend: 'badge-cyan',
  'Three.js': 'badge-purple',

  // AI & Data
  Python: 'badge-amber',
  PyTorch: 'badge-amber',
  AI: 'badge-purple',
  LLM: 'badge-purple',
  'Gemini API': 'badge-cyan',
  TensorFlow: 'badge-amber',

  // Backend
  'Node.js': 'badge-emerald',
  Express: 'badge-emerald',
  MongoDB: 'badge-emerald',
  FastAPI: 'badge-amber',
  Docker: 'badge-indigo',

  // Design
  'UI/UX': 'badge-purple',
  Figma: 'badge-purple',
  'Design Systems': 'badge-purple',

  // Web3
  Solidity: 'badge-cyan',
  Blockchain: 'badge-cyan',
  Web3: 'badge-cyan',
  Rust: 'badge-amber'
};

export const SkillTag = ({ name, size = 'md', onRemove = null, isHighlight = false }) => {
  const badgeClass = CATEGORY_COLORS[name] || 'badge-indigo';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 ${badgeClass} ${sizeClasses} ${
        isHighlight ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-indigo-500/20' : ''
      }`}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          className="hover:text-red-400 transition-colors focus:outline-none text-gray-400 ml-0.5"
          title={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
