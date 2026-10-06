// ── Base typography tokens ────────────────────────────────────────────────────

export const baseTypography = {
	fontFamily: {
		primary: "Pretendard",
	},

	fontSize: {
		"10": "10px",
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

	// CSS font-weight 값 - SCSS `$font_weight_*` 와 같다. tokens.json 은 Figma 스타일 이름("Regular")을
	// 쓰지만 이 객체는 `style` 에 바로 펼쳐 쓰는 값이라 숫자여야 한다(이름이면 font-weight 가 무시된다).
	fontWeight: {
		thin: 100,
		extraLight: 200,
		light: 300,
		regular: 400,
		medium: 500,
		semiBold: 600,
		bold: 700,
		extraBold: 800,
		black: 900,
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
		tight: "0.32px",
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
		// 굵은 강조 - letter-spacing 은 SCSS `@mixin display_large_bold` 와 같은 값
		largeBold: {
			fontSize: fs["48"],
			fontWeight: fw.bold,
			lineHeight: lh["60"],
			letterSpacing: "-0.02em",
		},
		mediumBold: {
			fontSize: fs["40"],
			fontWeight: fw.bold,
			lineHeight: lh["50"],
			letterSpacing: "-0.02em",
		},
		smallBold: {
			fontSize: fs["32"],
			fontWeight: fw.bold,
			lineHeight: lh["40"],
			letterSpacing: "-0.015em",
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
		// 굵은 강조 - letter-spacing 은 SCSS `@mixin heading_large_bold` 와 같은 값
		largeBold: {
			fontSize: fs["28"],
			fontWeight: fw.bold,
			lineHeight: lh["36"],
			letterSpacing: "-0.01em",
		},
		mediumBold: {
			fontSize: fs["24"],
			fontWeight: fw.bold,
			lineHeight: lh["32"],
			letterSpacing: "-0.01em",
		},
		smallBold: {
			fontSize: fs["20"],
			fontWeight: fw.bold,
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
		// 굵은 강조 - letter-spacing 은 SCSS `@mixin title_large_bold` 와 같은 값
		largeBold: {
			fontSize: fs["18"],
			fontWeight: fw.bold,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		mediumBold: {
			fontSize: fs["16"],
			fontWeight: fw.bold,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		smallBold: {
			fontSize: fs["14"],
			fontWeight: fw.bold,
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
		// 굵은 강조 - letter-spacing 은 SCSS `@mixin body_large_bold` 와 같은 값
		largeBold: {
			fontSize: fs["16"],
			fontWeight: fw.bold,
			lineHeight: lh["24"],
			letterSpacing: ls.normal,
		},
		mediumBold: {
			fontSize: fs["15"],
			fontWeight: fw.bold,
			lineHeight: lh["22-5"],
			letterSpacing: ls.normal,
		},
		smallBold: {
			fontSize: fs["14"],
			fontWeight: fw.bold,
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
		// 굵은 강조 - letter-spacing 은 SCSS `@mixin label_large_bold` 와 같은 값
		largeBold: {
			fontSize: fs["14"],
			fontWeight: fw.bold,
			lineHeight: lh["20"],
			letterSpacing: ls.tight,
		},
		mediumBold: {
			fontSize: fs["13"],
			fontWeight: fw.bold,
			lineHeight: lh["18"],
			letterSpacing: ls.tight,
		},
		smallBold: {
			fontSize: fs["12"],
			fontWeight: fw.bold,
			lineHeight: lh["16"],
			letterSpacing: ls.tight,
		},
	},
	// ── 의미 이름 (SCSS `@mixin caption` 등과 같은 값) ─────────────────────────
	caption: {
		fontSize: fs["12"],
		fontWeight: fw.regular,
		lineHeight: lh["16"],
		letterSpacing: ls.tight,
	},
	captionBold: {
		fontSize: fs["12"],
		fontWeight: fw.bold,
		lineHeight: lh["16"],
		letterSpacing: ls.tight,
	},
	/** 섹션 머리 라벨 - 대문자 변환까지 포함한다 */
	overline: {
		fontSize: fs["12"],
		fontWeight: fw.semiBold,
		lineHeight: lh["16"],
		letterSpacing: "0.08em",
		textTransform: "uppercase",
	},
	subtitle: {
		fontSize: fs["15"],
		fontWeight: fw.medium,
		lineHeight: lh["22-5"],
		letterSpacing: ls.normal,
	},
	code: {
		fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
		fontSize: fs["13"],
		lineHeight: lh["18"],
	},
} as const;
