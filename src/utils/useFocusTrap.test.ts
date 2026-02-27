import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

// Helper: container with focusable buttons
function createContainer(buttonCount: number): HTMLDivElement {
    const container = document.createElement("div");
    for (let i = 0; i < buttonCount; i++) {
        const btn = document.createElement("button");
        btn.textContent = `Button ${i + 1}`;
        container.appendChild(btn);
    }
    document.body.appendChild(container);
    return container;
}

const containers: HTMLElement[] = [];
afterEach(() => {
    containers.forEach((c) => c.isConnected && document.body.removeChild(c));
    containers.length = 0;
});

function tracked<T extends HTMLElement>(el: T): T {
    containers.push(el);
    return el;
}

describe("useFocusTrap", () => {
    it("focuses first element when activated", () => {
        const container = tracked(createContainer(3));

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, true));

        const buttons = container.querySelectorAll("button");
        expect(document.activeElement).toBe(buttons[0]);
    });

    it("does nothing when isActive is false", () => {
        const container = tracked(createContainer(2));
        const originalActive = document.activeElement;

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, false));

        expect(document.activeElement).toBe(originalActive);
    });

    it("cycles focus to first element on Tab from last element", () => {
        const container = tracked(createContainer(3));
        const buttons = container.querySelectorAll<HTMLButtonElement>("button");

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, true));

        // Move focus to last button
        buttons[buttons.length - 1].focus();
        expect(document.activeElement).toBe(buttons[buttons.length - 1]);

        // Tab from last element
        const tabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            bubbles: true,
            cancelable: true,
        });
        const preventDefault = vi.spyOn(tabEvent, "preventDefault");

        act(() => {
            document.dispatchEvent(tabEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(document.activeElement).toBe(buttons[0]);
    });

    it("cycles focus to last element on Shift+Tab from first element", () => {
        const container = tracked(createContainer(3));
        const buttons = container.querySelectorAll<HTMLButtonElement>("button");

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, true));

        // Focus is already on first button (activated)
        expect(document.activeElement).toBe(buttons[0]);

        // Shift+Tab from first element
        const shiftTabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        const preventDefault = vi.spyOn(shiftTabEvent, "preventDefault");

        act(() => {
            document.dispatchEvent(shiftTabEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    });

    it("prevents Tab when no focusable elements exist", () => {
        const container = document.createElement("div");
        container.textContent = "No focusable content";
        document.body.appendChild(container);
        tracked(container);

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, true));

        const tabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            bubbles: true,
            cancelable: true,
        });
        const preventDefault = vi.spyOn(tabEvent, "preventDefault");

        act(() => {
            document.dispatchEvent(tabEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
    });

    it("does not intercept non-Tab keys", () => {
        const container = tracked(createContainer(2));

        const containerRef = { current: container };
        renderHook(() => useFocusTrap(containerRef, true));

        const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
        });
        const preventDefault = vi.spyOn(enterEvent, "preventDefault");

        act(() => {
            document.dispatchEvent(enterEvent);
        });

        expect(preventDefault).not.toHaveBeenCalled();
    });

    it("restores focus to previous element on deactivation", () => {
        const triggerBtn = document.createElement("button");
        triggerBtn.textContent = "Trigger";
        document.body.appendChild(triggerBtn);
        tracked(triggerBtn);
        triggerBtn.focus();

        const container = tracked(createContainer(2));
        const containerRef = { current: container };

        const { unmount } = renderHook(() => useFocusTrap(containerRef, true));

        unmount();

        expect(document.activeElement).toBe(triggerBtn);
    });
});
