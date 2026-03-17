import { colors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";

export const skeleton = {
    color: {
        base: colors.backgroundNeutral,
        wave: colors.backgroundMuted,
        highlight: colors.backgroundSecondary,
    },

    gradient: `linear-gradient(90deg, ${colors.backgroundNeutral} 25%, ${colors.backgroundSecondary} 37%, ${colors.backgroundMuted} 63%)`,

    radius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
    },

    height: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
    },

    animation: {
        duration: "1.4s",
        timing: "ease-in-out",
    },
} as const;
