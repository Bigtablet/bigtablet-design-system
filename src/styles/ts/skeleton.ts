import { baseColors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";

export const skeleton = {
    color: {
        base:      baseColors.neutral50,
        wave:      baseColors.neutral200,
        highlight: baseColors.neutral0,
    },

    gradient: `linear-gradient(90deg, ${baseColors.neutral50} 25%, ${baseColors.neutral0} 37%, ${baseColors.neutral200} 63%)`,

    radius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
    },

    height: {
        xs: spacing["4"],
        sm: spacing["8"],
        md: spacing["12"],
        lg: spacing["16"],
        xl: spacing["20"],
    },

    animation: {
        duration: "1.4s",
        timing: "ease-in-out",
    },
} as const;
