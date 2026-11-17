import { Button, ThemeProvider, useTheme } from "@bigtablet/design-system";

function ThemeToggle() {
	const { mode, resolved, setMode } = useTheme();
	return (
		<Button variant="outline" onClick={() => setMode(resolved === "dark" ? "light" : "dark")}>
			현재: {mode} (적용: {resolved})
		</Button>
	);
}

// 앱에서는 최상위에 한 번 감쌉니다. 여기서는 이 상자에만 적용되게 targetSelector 를 줬습니다
export default function Example() {
	return (
		<div
			id="theme-demo"
			style={{ padding: 16, borderRadius: 8, background: "var(--bt-color-bg-solid)" }}
		>
			<ThemeProvider defaultMode="light" storageKey={null} targetSelector="#theme-demo">
				<ThemeToggle />
			</ThemeProvider>
		</div>
	);
}
