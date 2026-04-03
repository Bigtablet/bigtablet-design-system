// ── Base border-width tokens ──────────────────────────────────────────────────

export const baseBorderWidth = {
	"0": "0px",
	"1": "1px",
	"2": "2px",
} as const;

// ── Semantic border-width tokens ──────────────────────────────────────────────

export const borderWidth = {
	none: baseBorderWidth["0"],
	standard: baseBorderWidth["1"],
	indicator: baseBorderWidth["2"],
} as const;
