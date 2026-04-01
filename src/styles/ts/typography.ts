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

export const typography = {
    fontFamily: {
        primary: `'${baseTypography.fontFamily.primary}', sans-serif`,
    },

    display: {
        large:        { fontSize: "48px", fontWeight: "Regular", lineHeight: "60px", letterSpacing: "0px" },
        largeMedium:  { fontSize: "48px", fontWeight: "Medium",  lineHeight: "60px", letterSpacing: "0px" },
        medium:       { fontSize: "40px", fontWeight: "Regular", lineHeight: "50px", letterSpacing: "0px" },
        mediumMedium: { fontSize: "40px", fontWeight: "Medium",  lineHeight: "50px", letterSpacing: "0px" },
        small:        { fontSize: "32px", fontWeight: "Regular", lineHeight: "40px", letterSpacing: "0px" },
        smallMedium:  { fontSize: "32px", fontWeight: "Medium",  lineHeight: "40px", letterSpacing: "0px" },
    },

    heading: {
        large:        { fontSize: "28px", fontWeight: "Regular", lineHeight: "36px", letterSpacing: "0px" },
        largeMedium:  { fontSize: "28px", fontWeight: "Medium",  lineHeight: "36px", letterSpacing: "0px" },
        medium:       { fontSize: "24px", fontWeight: "Regular", lineHeight: "32px", letterSpacing: "0px" },
        mediumMedium: { fontSize: "24px", fontWeight: "Medium",  lineHeight: "32px", letterSpacing: "0px" },
        small:        { fontSize: "20px", fontWeight: "Regular", lineHeight: "28px", letterSpacing: "0px" },
        smallMedium:  { fontSize: "20px", fontWeight: "Medium",  lineHeight: "28px", letterSpacing: "0px" },
    },

    title: {
        large:        { fontSize: "18px", fontWeight: "Regular", lineHeight: "24px", letterSpacing: "0px" },
        largeMedium:  { fontSize: "18px", fontWeight: "Medium",  lineHeight: "24px", letterSpacing: "0px" },
        medium:       { fontSize: "16px", fontWeight: "Regular", lineHeight: "24px", letterSpacing: "0px" },
        mediumMedium: { fontSize: "16px", fontWeight: "Medium",  lineHeight: "24px", letterSpacing: "0px" },
        small:        { fontSize: "14px", fontWeight: "Regular", lineHeight: "20px", letterSpacing: "0px" },
        smallMedium:  { fontSize: "14px", fontWeight: "Medium",  lineHeight: "20px", letterSpacing: "0px" },
    },

    body: {
        large:        { fontSize: "16px", fontWeight: "Regular", lineHeight: "24px",    letterSpacing: "0px" },
        largeMedium:  { fontSize: "16px", fontWeight: "Medium",  lineHeight: "24px",    letterSpacing: "0px" },
        medium:       { fontSize: "15px", fontWeight: "Regular", lineHeight: "22.5px",  letterSpacing: "0px" },
        mediumMedium: { fontSize: "15px", fontWeight: "Medium",  lineHeight: "22.5px",  letterSpacing: "0px" },
        small:        { fontSize: "14px", fontWeight: "Regular", lineHeight: "20px",    letterSpacing: "0px" },
        smallMedium:  { fontSize: "14px", fontWeight: "Medium",  lineHeight: "20px",    letterSpacing: "0px" },
    },

    label: {
        large:        { fontSize: "14px", fontWeight: "Regular", lineHeight: "20px", letterSpacing: "0px" },
        largeMedium:  { fontSize: "14px", fontWeight: "Medium",  lineHeight: "20px", letterSpacing: "0px" },
        medium:       { fontSize: "13px", fontWeight: "Regular", lineHeight: "18px", letterSpacing: "0px" },
        mediumMedium: { fontSize: "13px", fontWeight: "Medium",  lineHeight: "18px", letterSpacing: "0px" },
        small:        { fontSize: "12px", fontWeight: "Regular", lineHeight: "16px", letterSpacing: "0px" },
        smallMedium:  { fontSize: "12px", fontWeight: "Medium",  lineHeight: "16px", letterSpacing: "0px" },
    },
} as const;
