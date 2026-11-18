import { Button, ToastProvider, useToast } from "@bigtablet/design-system";

function Buttons() {
	const toast = useToast();
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			<Button onClick={() => toast.success("저장했습니다")}>성공</Button>
			<Button variant="outline" onClick={() => toast.error("저장하지 못했습니다")}>
				실패
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					const id = toast.info("업로드 중…", { duration: 0 });
					setTimeout(
						() => toast.update(id, { tone: "success", message: "업로드 완료", duration: 3000 }),
						1500,
					);
				}}
			>
				진행 → 완료
			</Button>
		</div>
	);
}

// 앱에서는 ToastProvider 를 최상위에 한 번 둡니다
export default function Example() {
	return (
		<ToastProvider>
			<Buttons />
		</ToastProvider>
	);
}
