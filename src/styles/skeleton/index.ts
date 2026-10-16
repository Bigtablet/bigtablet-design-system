import { baseColors } from "../colors";
import { radius } from "../radius";
import { spacing } from "../spacing";

export const skeleton = {
	// SCSS `$color_skeleton_*` 의 light 값과 같다. dark 테마를 따라가려면 `cssVars.colors.skeleton`.
	color: {
		base: baseColors.skeletonBase,
		wave: baseColors.skeletonWave,
		highlight: baseColors.skeletonHighlight,
	},

	gradient: `linear-gradient(90deg, ${baseColors.skeletonBase} 25%, ${baseColors.skeletonHighlight} 37%, ${baseColors.skeletonWave} 63%)`,

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
