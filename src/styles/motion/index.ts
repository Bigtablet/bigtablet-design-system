export const motion = {
	transition: {
		fast: "0.1s ease-in-out",

		base: "0.2s ease-in-out",

		slow: "0.3s ease-in-out",

		emphasized: "0.25s cubic-bezier(0.4, 0, 0.2, 1)",

		bounce: "0.3s cubic-bezier(0.16, 1, 0.3, 1)",

		fade: "0.15s ease-in-out",

		slide: "0.25s ease-in-out",

		scale: "0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",

		state: "0.18s ease-in-out",

		enterFast: "0.15s cubic-bezier(0.16, 1, 0.3, 1)",

		enterBase: "0.2s cubic-bezier(0.16, 1, 0.3, 1)",

		exitFast: "0.12s cubic-bezier(0.4, 0, 1, 1)",

		exitBase: "0.15s cubic-bezier(0.4, 0, 1, 1)",
	},

	easing: {
		enter: "cubic-bezier(0.16, 1, 0.3, 1)",
		exit: "cubic-bezier(0.4, 0, 1, 1)",
	},
} as const;
