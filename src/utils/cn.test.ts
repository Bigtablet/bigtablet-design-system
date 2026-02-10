import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
    it("joins multiple class names", () => {
        expect(cn("btn", "btn--primary")).toBe("btn btn--primary");
    });

    it("filters out falsy values", () => {
        expect(cn("btn", false, undefined, null, "active")).toBe("btn active");
    });

    it("handles conditional classes", () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn("btn", isActive && "btn--active", isDisabled && "btn--disabled")).toBe(
            "btn btn--active"
        );
    });

    it("returns empty string for no valid classes", () => {
        expect(cn(false, undefined, null)).toBe("");
    });

    it("filters out empty strings", () => {
        expect(cn("btn", "", "active")).toBe("btn active");
    });
});
