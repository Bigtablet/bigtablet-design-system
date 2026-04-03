// ── Base typography tokens ────────────────────────────────────────────────────

export const baseTypography = {
	fontFamily: {
		primary: "Pretendard",
	},

	fontSize: {
		"12": "12px",
		"13": "13px",
		"14": "14px",
		"15": "15px",
		"16": "16px",
		"18": "18px",
		"20": "20px",
		"24": "24px",
		"28": "28px",
		"32": "32px",
		"40": "40px",
		"48": "48px",
	},

	fontWeight: {
		regular: "Regular",
		medium: "Medium",
	},

	lineHeight: {
		"16": "16px",
		"18": "18px",
		"20": "20px",
		"22-5": "22.5px",
		"24": "24px",
		"28": "28px",
		"32": "32px",
		"36": "36px",
		"40": "40px",
		"50": "50px",
		"60": "60px",
	},

	letterSpacing: {
		normal: "0px",
	},
} as const;

// ── Semantic typography tokens ────────────────────────────────────────────────

const { fontSize: fs, fontWeight: fw, lineHeight: lh, letterSpacing: ls } = baseTypography;

export const typography = {
	fontFamily: {
		primary: `'${baseTypography.fontFamily.primary}', sans-serif`,
	},

	display: {
		large: {
			fontSize: fs["48"],
			fontWeight: fw.regular,
			lineHeight: lh["60"],
			letterSpacing: ls.normal,
		},
		largeMedium: {
			fontSize: fs["48"],
			fontWeight: fw.medium,
			lineHeight: lh["60"],
			letterSpacing: ls.normal,
		},
		medium: {
			fontSize: fs["40"],
			fontWeight: fw.regular,
			lineHeight: lh["50"],
			letterSpacing: ls.normal,
		},
		mediumMedium: {
			fontSize: fs["40"],
			fontWeight: fw.medium,
			lineHeight: lh["50"],
			letterSpacing: ls.normal,
		},
		small: {
			fontSize: fs["32"],
			fontWeight: fw.regular,
			lineHeight: lh["40"],
			letterSpacing: ls.normal,
		},
		smallMedium: {
			fontSize: fs["32"],
			fontWeight: fw.medium,
			lineHeight: lh["40"],
			letterSpacing: ls.normal,
		},
	},

	heading: {
		large: {
			fontSize: fs["28"],
			fontWeight: fw.regular,
			lineHeight: lh["36"],
			letterSpacing: ls.normal,
		},
		largeMedium: {
			fontSize: fs["28"],
			fontWeight: fw.medium,
			lineHeight: lh["36"],
			letterSpacing: ls.normal,
		},
		medium: {
			fontSize: fs["24"],
			fontWeight: fw.regular,
			lineHeight: lh["32"],
			letterSpacing: ls.normal,
		},
		mediumMedium: {
			fontSize: fs["24"],
			fontWeight: fw.medium,
			lineHeight: lh["32"],
			letterSpacing: ls.normal,
		},
		small: {
			fontSize: fs["20"],
			fontWeight: fw.regular,
			lineHeight: lh["28"],
			letterSpacing: ls.normal,
		},
		smallMedium: {
			fontSize: fs["20"],
			fontWeight: fw.medium,
			lineHeight: lh["28"],
			letterSpacing: ls.normal,
		},
	},

	title: {
		large: {
			fontSize: fs["18"],
			fontWeight: fw.regular,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		largeMedium: {
			fontSize: fs["18"],
			fontWeight: fw.medium,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		medium: {
			fontSize: fs["16"],
			fontWeight: fw.regular,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		mediumMedium: {
			fontSize: fs["16"],
			fontWeight: fw.medium,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		small: {
			fontSize: fs["14"],
			fontWeight: fw.regular,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
		smallMedium: {
			fontSize: fs["14"],
			fontWeight: fw.medium,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
	},

	body: {
		large: {
			fontSize: fs["16"],
			fontWeight: fw.regular,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		largeMedium: {
			fontSize: fs["16"],
			fontWeight: fw.medium,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		medium: {
			fontSize: fs["15"],
			fontWeight: fw.regular,
			lineHeight: lh["22-5"],
			letterSpacing: ls.normal,
		},
		mediumMedium: {
			fontSize: fs["15"],
			fontWeight: fw.medium,
			lineHeight: lh["22-5"],
			letterSpacing: ls.normal,
		},
		small: {
			fontSize: fs["14"],
			fontWeight: fw.regular,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
		smallMedium: {
			fontSize: fs["14"],
			fontWeight: fw.medium,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
	},

	label: {
		large: {
			fontSize: fs["14"],
			fontWeight: fw.regular,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
		largeMedium: {
			fontSize: fs["14"],
			fontWeight: fw.medium,
			lineHeight: lh["20"],
			letterSpacing: ls.normal,
		},
		medium: {
			fontSize: fs["13"],
			fontWeight: fw.regular,
			lineHeight: lh["18"],
			letterSpacing: ls.normal,
		},
		mediumMedium: {
			fontSize: fs["13"],
			fontWeight: fw.medium,
			lineHeight: lh["18"],
			letterSpacing: ls.normal,
		},
		small: {
			fontSize: fs["12"],
			fontWeight: fw.regular,
			lineHeight: lh["16"],
			letterSpacing: ls.normal,
		},
		smallMedium: {
			fontSize: fs["12"],
			fontWeight: fw.medium,
			lineHeight: lh["16"],
			letterSpacing: ls.normal,
		},
	},
} as const;
