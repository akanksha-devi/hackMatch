import { useState, useRef, useCallback } from 'react';

/**
 * useFormErrors - Reusable hook for accessible form validation, error state tracking,
 * and automated navbar-aware viewport scrolling & focus management.
 *
 * @param {Object} options
 * @param {number} options.navbarOffset - Vertical clearance in pixels to prevent elements from being hidden under sticky headers (defaults to 88px).
 * @param {string} options.summaryId - DOM element ID of the global error summary banner (defaults to 'form-error-summary').
 */
export function useFormErrors({
  navbarOffset = 88,
  summaryId = 'form-error-summary',
} = {}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const summaryRef = useRef(null);

  /**
   * Scrolls an element or ID into view with proper navbar offset and sets focus.
   * Respects user's 'prefers-reduced-motion' settings.
   */
  const scrollToTarget = useCallback((target, shouldFocus = true) => {
    if (typeof window === 'undefined') return;

    let el = null;
    if (typeof target === 'string') {
      el = document.getElementById(target) || document.querySelector(`[name="${target}"]`);
    } else if (target instanceof HTMLElement) {
      el = target;
    }

    if (!el) return;

    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = el.getBoundingClientRect();
    const absoluteElementTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop);
    const targetScrollTop = Math.max(0, absoluteElementTop - navbarOffset);

    window.scrollTo({
      top: targetScrollTop,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });

    if (shouldFocus) {
      // Focus without browser default jerky jump
      const focusTarget = el.matches('input, select, textarea, button, [tabindex]') 
        ? el 
        : el.querySelector('input, select, textarea, button, [tabindex]') || el;

      if (focusTarget && typeof focusTarget.focus === 'function') {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch {
          focusTarget.focus();
        }
      }
    }
  }, [navbarOffset]);

  /**
   * Scans for the first invalid field in DOM order or the error summary banner,
   * bringing it smoothly into view and applying accessible focus.
   */
  const scrollToFirstError = useCallback((currentFieldErrors = null, currentFormError = null) => {
    const fErrors = currentFieldErrors !== null ? currentFieldErrors : fieldErrors;
    const globalErr = currentFormError !== null ? currentFormError : formError;

    // Use requestAnimationFrame to ensure React has flushed state updates to the DOM
    requestAnimationFrame(() => {
      const errorKeys = Object.keys(fErrors || {}).filter((k) => Boolean(fErrors[k]));

      if (errorKeys.length > 0) {
        // Collect all matching invalid DOM elements
        const invalidElements = [];
        for (const key of errorKeys) {
          const el = document.getElementById(key) || 
                     document.getElementById(`signup-${key}`) ||
                     document.getElementById(`field-${key}`) ||
                     document.querySelector(`[name="${key}"]`);
          if (el) invalidElements.push(el);
        }

        // Sort elements by document position to guarantee logical first field
        invalidElements.sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
        });

        if (invalidElements.length > 0) {
          scrollToTarget(invalidElements[0], true);
          return;
        }
      }

      // If no specific field element matched or it's a form-level API error, scroll to error banner
      if (globalErr) {
        const summaryEl = summaryRef.current || document.getElementById(summaryId);
        if (summaryEl) {
          scrollToTarget(summaryEl, true);
        }
      }
    });
  }, [fieldErrors, formError, summaryId, scrollToTarget]);

  /**
   * Sets field errors and automatically scrolls to the first invalid field.
   */
  const handleFieldErrors = useCallback((errorsObj) => {
    setFieldErrors(errorsObj);
    scrollToFirstError(errorsObj, null);
  }, [scrollToFirstError]);

  /**
   * Sets an API/server error and automatically scrolls to the error summary banner.
   */
  const handleApiError = useCallback((errorMessage) => {
    setFormError(errorMessage);
    scrollToFirstError(null, errorMessage);
  }, [scrollToFirstError]);

  /**
   * Clears a single field error when the user interacts with that field.
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  /**
   * Clears all form errors.
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setFormError('');
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    summaryRef,
    summaryId,
    handleFieldErrors,
    handleApiError,
    clearFieldError,
    clearAllErrors,
    scrollToFirstError,
    scrollToTarget,
  };
}

export default useFormErrors;
