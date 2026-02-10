"use client";

import * as React from "react";

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
    const previousActiveElement = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Get all focusable elements
        const getFocusableElements = () => {
            return container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        };

        let wasTabIndexAdded = false;

        // Focus the first focusable element or the container itself
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            container.setAttribute('tabindex', '-1');
            wasTabIndexAdded = true;
            container.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) {
                e.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            // Remove tabindex if it was added by us
            if (wasTabIndexAdded) {
                container.removeAttribute('tabindex');
            }

            // Restore focus to the previously focused element
            if (previousActiveElement.current && previousActiveElement.current.focus) {
                previousActiveElement.current.focus();
            }
        };
    }, [isActive, containerRef]);
}
