import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { RADIUS, FOCUS } from '../../design-system/tokens';
import { useTheme } from '../../context/ThemeContext';

/**
 * FormErrorSummary - Canonical accessible error summary banner.
 * Serves as an assertive live region for screen readers and programmatically
 * focusable target when form submission or API errors occur.
 */
export const FormErrorSummary = React.forwardRef(({
  error = null,
  fieldErrors = {},
  onFieldClick = null,
  id = 'form-error-summary',
  className = '',
  title = 'Please correct the errors before proceeding',
}, ref) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const hasFormError = Boolean(error);
  const fieldErrorEntries = Object.entries(fieldErrors).filter(([_, msg]) => Boolean(msg));
  const hasFieldErrors = fieldErrorEntries.length > 0;

  if (!hasFormError && !hasFieldErrors) return null;

  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className={`w-full p-4 ${RADIUS.card} border transition-all duration-200 outline-none ${FOCUS.ringDanger} ${
        isLight
          ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-sm'
          : 'bg-rose-950/40 border-rose-500/30 text-rose-200 shadow-lg shadow-rose-950/20'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-900/60 text-rose-400'}`}>
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        </div>

        <div className="space-y-1.5 flex-1 text-xs sm:text-sm">
          <h4 className="font-bold text-sm tracking-tight">
            {hasFormError && !hasFieldErrors ? 'Submission Error' : title}
          </h4>

          {hasFormError && (
            <p className={`leading-relaxed ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
              {error}
            </p>
          )}

          {hasFieldErrors && (
            <ul className="space-y-1 pt-1 list-disc list-inside">
              {fieldErrorEntries.map(([fieldKey, msg]) => (
                <li key={fieldKey} className="leading-snug">
                  {onFieldClick ? (
                    <button
                      type="button"
                      onClick={() => onFieldClick(fieldKey)}
                      aria-label={`Jump to ${msg}`}
                      className={`inline-flex items-center gap-1 text-left font-medium underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer ${FOCUS.ringDanger} rounded ${
                        isLight ? 'text-rose-800' : 'text-rose-300'
                      }`}
                    >
                      <span>{msg}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </button>
                  ) : (
                    <span>{msg}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

FormErrorSummary.displayName = 'FormErrorSummary';

export default FormErrorSummary;
