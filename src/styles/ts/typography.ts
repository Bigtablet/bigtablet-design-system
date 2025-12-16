export const typography = {
    fontFamily: {
        primary: "'Pretendard', sans-serif",
    },

    fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "0.9375rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
    },

    fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },

    lineHeight: {
        tight: 1.25,
        snug: 1.3,
        normal: 1.5,
        relaxed: 1.75,
    },

    letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
    },
} as const;